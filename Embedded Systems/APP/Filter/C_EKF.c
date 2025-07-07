#include "C_EKF.h"

BLA::Matrix<STATE_DIM> x;
BLA::Matrix<STATE_DIM, STATE_DIM> P, Q;
BLA::Matrix<2, 2> R;
SensorData sensor_input;
FusedData fused_output;
unsigned long last_update = 0;
bool first_update = true;
volatile bool new_data_received = false;

float last_corrected_ax = 0.0;
float last_corrected_ay = 0.0;
WebServer server(80);
TwoWire EKF_I2C(1);


/**
 * @brief Handle I2C receive event.
 *
 * This function is called whenever an I2C receive event occurs. It checks
 * the received data for validity and updates the `sensor_input` structure
 * if the data is valid. Additionally, it initializes the state with the
 * first valid reading.
 *
 * @param[in] byteCount The number of bytes received.
 */
void EKFreceiveEvent(int byteCount) {
  unsigned long long start = micros();
  if (byteCount == sizeof(SensorData)) {
    uint8_t buffer[sizeof(SensorData)];
    EKF_I2C.readBytes(buffer, sizeof(SensorData));
    uint8_t recv_crc = buffer[sizeof(SensorData) - 1];
    if (calculateCRC(buffer, sizeof(SensorData) - 1) == recv_crc) {
      memcpy(&sensor_input, buffer, sizeof(SensorData));
      /*Serial.printf(
        "Received from ATmega:\n lat = %.6f\n lon = %.6f\n ax = %.2f\n ay = %.2f\n "
        "yaw_rate = %.2f\n crc = 0x%02X\n",
        sensor_input.lat, sensor_input.lon, sensor_input.ax, sensor_input.ay,
        sensor_input.yaw_rate, sensor_input.crc);*/
      // Initialize state with first valid reading
      if (first_update) {
        server.handleClient();
        x(0) = sensor_input.lat * DEG_TO_RAD;
        x(1) = sensor_input.lon * DEG_TO_RAD;
        x(5) = sensor_input.yaw_rate;
        x(6) = sensor_input.ax;  // Initial bias estimate
        x(7) = sensor_input.ay;
        first_update = false;
      }
    }
    Serial.print("EKF Data Receive time: ");
    Serial.print((micros() - start) / 1000.0);
    Serial.println(" ms");
  }
  new_data_received = true;
}

/**
 * @brief Handle I2C request event.
 *
 * This function is called whenever an I2C request event occurs. It prepares
 * the fused output by copying the current state into the `fused_output`
 * structure, calculates the CRC, and sends the fused output over I2C.
 */
void EKFrequestEvent() {
  unsigned long start = micros();
  // Calculate CRC
  uint8_t buffer[sizeof(FusedData) - 1];
  memcpy(buffer, &fused_output, sizeof(FusedData) - 1);
  fused_output.crc = calculateCRC(buffer, sizeof(FusedData) - 1);
  /*Serial.printf(
    "Sending FusedData:\n fused_lat = %.6f\n fused_lon = %.6f\n velocity = %.2f\n "
    "yaw = %.2f\n crc = 0x%02X\n",
    fused_output.fused_lat, fused_output.fused_lon, fused_output.velocity,
    fused_output.yaw, fused_output.crc);*/
  EKF_I2C.write((uint8_t *)&fused_output, sizeof(FusedData));
  Serial.print("EKF Data Send time: ");
  Serial.print((micros() - start) / 1000.0);
  Serial.println(" ms");
}

/**
 * @brief Calculate an 8-bit CRC for the given data.
 *
 * This function calculates a simple 8-bit CRC (polynomial 0x31) for the given
 * data. The CRC is calculated over the given data length (`len`).
 *
 * @param[in] data Pointer to the data to calculate the CRC for.
 * @param[in] len  The length of the data to calculate the CRC for.
 *
 * @return The calculated 8-bit CRC.
 */
uint8_t calculateCRC(const uint8_t *data, size_t len) {
  uint8_t crc = 0;
  for (size_t i = 0; i < len; i++) {
    crc ^= data[i];
    for (int bit = 0; bit < 8; bit++)
      crc = (crc & 0x80) ? (crc << 1) ^ CRC8_POLY : (crc << 1);
  }
  return crc;
}

/********************** EKF Implementation **********************/

/**
 * @brief Initializes the EKF parameters and matrices.
 *
 * Initializes the process noise covariance matrix (`Q`) and the measurement
 * noise covariance matrix (`R`). The process noise covariance matrix is
 * diagonal, with the following values:
 *   - Velocity components (x, y): 0.1 m²/s²
 *   - Yaw component: 0.01 rad²/s²
 *   - Yaw rate component: 0.001 rad²/s³
 *   - Bias components (x, y): 1e-6 m²/s²
 *
 * The measurement noise covariance matrix is a 2x2 matrix, with the following
 * values:
 *   - Diagonal elements: 1.5e-6 m²
 *   - Off-diagonal elements: 0
 */
void initializeEKF() {
  // Process noise (tune these values)
  Q = identity<STATE_DIM>();
  Q(2, 2) = Q(3, 3) = 0.1;   // Velocity noise
  Q(4, 4) = 0.01;            // Yaw noise
  Q(5, 5) = 0.001;           // Yaw rate noise
  Q(6, 6) = Q(7, 7) = 1e-6;  // Bias drift

  // Measurement noise (GPS accuracy) - NOW 2x2 MATRIX
  R = identity<2>() * pow(1.5e-6, 2);  // ±1.5m
}

/**
 * @brief Predicts the state at the next time step using the EKF prediction equations.
 *
 * @param[in] dt The time step to predict over.
 */
void ekfPredict(float dt) {
  // Current state values
  float psi = x(4);
  float ax = sensor_input.ax - x(6);
  float ay = sensor_input.ay - x(7);

  // State transition
  x(0) += (x(3) * dt) / R_earth;
  x(1) += (x(2) * dt) / (R_earth * cos(x(0)));
  x(2) += (ax * cos(psi) - ay * sin(psi)) * dt;
  x(3) += (ax * sin(psi) + ay * cos(psi)) * dt;
  x(4) += (sensor_input.yaw_rate - x(5)) * dt;

  // Jacobian matrix F
  BLA::Matrix<STATE_DIM, STATE_DIM> f = identity<STATE_DIM>();

  // Position partials
  f(0, 3) = dt / R_earth;
  f(1, 0) = (x(2) * dt * sin(x(0))) / (R_earth * pow(cos(x(0)), 2));
  f(1, 2) = dt / (R_earth * cos(x(0)));

  // Velocity partials
  f(2, 4) = (-ax * sin(psi) - ay * cos(psi)) * dt;
  f(2, 6) = -cos(psi) * dt;
  f(2, 7) = sin(psi) * dt;

  f(3, 4) = (ax * cos(psi) - ay * sin(psi)) * dt;
  f(3, 6) = -sin(psi) * dt;
  f(3, 7) = -cos(psi) * dt;

  // Yaw rate partial
  f(4, 5) = dt;

  // Covariance prediction
  P = f * P * ~f + Q;
  
  ax = sensor_input.ax - x(6);
  ay = sensor_input.ay - x(7);
  
  last_corrected_ax = ax;
  last_corrected_ay = ay;
}

/**
 * @brief EKF update step.
 *
 * This function performs the EKF update step, given the current state and covariance.
 * The update step computes the innovation, innovation covariance, Kalman gain, and
 * then updates the state and covariance.
 */
void ekfUpdate() {
  BLA::Matrix<2> z = { x(0), x(1) };  // Already in radians
  BLA::Matrix<2, STATE_DIM> H = { 0 };
  H(0, 0) = H(1, 1) = 1.0;

  BLA::Matrix<2> y = z - H * x;
  BLA::Matrix<2, 2> S = H * P * ~H + R;  // Now compatible dimensions
  BLA::Matrix<STATE_DIM, 2> K = P * ~H * Inverse(S);

  x += K * y;
  P = (identity<STATE_DIM>() - K * H) * P;
  fused_output.fused_lat = x(0) * RAD_TO_DEG;
  fused_output.fused_lon = x(1) * RAD_TO_DEG;
  fused_output.velocity = sqrt(pow(x(2), 2) + pow(x(3), 2));
  fused_output.corrected_acc = sqrt(pow(last_corrected_ax, 2) + pow(last_corrected_ay, 2));
  fused_output.yaw = fmod(x(4) * RAD_TO_DEG, 360.0);
  if (fused_output.yaw < 0) {
    fused_output.yaw += 360.0;
  }
}

/**
 * @brief Handles incoming GPS data sent via HTTP request.
 *
 * This function is called whenever the ESP32 receives an HTTP request with
 * "lat" and "lon" arguments. The received values are parsed and stored in the
 * `sensor_input` structure.
 *
 * @note This function is intended to be called from the `handleClient()`
 *       function, which is called whenever an HTTP request is received.
 */
void handleGPS() {
  String latStr = server.arg("lat");
  String lonStr = server.arg("lon");

  Serial.println("Received via HTTP:");
  Serial.println("  Latitude:  " + latStr);
  Serial.println("  Longitude: " + lonStr);

  sscanf(latStr.c_str(), "%f", &sensor_input.lat);
  sscanf(lonStr.c_str(), "%f", &sensor_input.lon);

  server.send(200, "text/plain", "OK");
}
