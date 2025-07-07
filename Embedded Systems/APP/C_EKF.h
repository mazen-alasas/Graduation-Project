#include <stdint.h>

#ifndef C_EKF_H
#define C_EKF_H

#include <Arduino.h>
#include <Wire.h>
#include <BasicLinearAlgebra.h>
#include <WebServer.h>

using namespace BLA;

/********************** Configuration **********************/
#define STATE_DIM               8         // [lat, lon, vx, vy, psi, psi_dot, ba_x, ba_y]
#define I2C_EKF_ADDR            0x08      // ESP32's I2C address
#define CRC8_POLY               0x07      // CRC-8 polynomial
#define EKF_SDA_SLAVE           33
#define EKF_SCL_SLAVE           32
#define EKF_I2C_FREQ            100000

// Earth constants
const double R_earth = 6371000.0; // meters
//const double DEG_TO_RAD = PI / 180.0;
//const double RAD_TO_DEG = 180.0 / PI;

/********************** Matrix Utilities **********************/
template<int N>
Matrix<N, N> identity() {
  Matrix<N, N> mat;
  for(int i=0; i<N; i++) {
    for(int j=0; j<N; j++) {
      mat(i,j) = (i == j) ? 1.0 : 0.0;
    }
  }
  return mat;
}

/********************** Data Structures **********************/
#pragma pack(push, 1)
typedef struct {
	uint8_t ima  : 1;
	uint8_t eebl : 1;
	uint8_t fcw  : 1;
	uint8_t dnpw : 1;
	uint8_t bsw  : 1;
	uint8_t res  : 3;
}Flags;

typedef struct {
	float lat;
	float lon;
	float ax;
	float ay;
	float yaw_rate;
	Flags Flag;
	uint8_t crc;
} SensorData;

typedef struct {
  float fused_lat; // Degrees
  float fused_lon; // Degrees
  float velocity;  // m/s
  float yaw;       // Degrees [0-360)
  float corrected_acc;
  uint8_t crc;
} FusedData;
#pragma pack(pop)
/********************** Global Variables **********************/
extern BLA::Matrix<STATE_DIM> x;
extern BLA::Matrix<STATE_DIM, STATE_DIM> P, Q;
extern BLA::Matrix<2, 2> R;
extern SensorData sensor_input;
extern FusedData fused_output;
extern unsigned long last_update;
extern bool first_update;
extern volatile bool new_data_received;

extern TwoWire EKF_I2C;

extern WebServer server;  

/********************** Function Prototypes **********************/

void EKFreceiveEvent(int byteCount);
void EKFrequestEvent();
void initializeEKF();
void ekfPredict(float dt);
void ekfUpdate();
uint8_t calculateCRC(const uint8_t *data, size_t len);
void handleGPS();
#endif