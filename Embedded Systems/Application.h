
#ifndef APPLICATION_H_
#define APPLICATION_H_

#define F_CPU 8000000
#include <util/delay.h>

#include "StdTypes.h"
#include "MemMap.h"

#include "MCAL/DIO/DIO_Int.h"
#include "MCAL/ADC/ADC_Int.h"
#include "HAL/LCD/LCD_Int.h"
#include "MCAL/Timers/Timers.h"
#include "HAL/DC_Motor/DC_Motor.h"
#include "HAL/Ultrasonic/Ultra_Int.h"
#include "MCAL/UART/UART_Int.h"
#include "HAL/GPS/GPS_Int.h"
#include "HAL/MPU6050/MPU_Int.h"
#include "HAL/QMC5883L/QMC_Int.h"
#include "HAL/Servo_Motor/Servo_Int.h"
#include "MCAL/I2C/I2C_Int.h"
#include "MCAL/SPI/SPI.h"
#include "Kernal_RTOS/Kernel_Int.h"
#include "APP/TC/TC_Int.h"
#include "APP/Features.h"

#define  latref       31.006445
#define  lonref       31.316196

#define ESP32_ADDR 0x08
#define ESP32_ADDR2 0x10

typedef struct {
	f32 lat;
	f32 lon;
} GpsData;

GPSData gps_data = {0};

typedef struct {
	f32 fused_lat;
	f32 fused_lon;
	f32 velocity;
	f32 yaw;
	f32 acc;
	u8 crc;
} FusedData;

typedef struct {
	u32 msgCntMsgCount;
	u32 id;
	u32 secMarkDSecond;
	f32 lat;
	f32 lon;
	f32 elev;
	f32 accuracy;
	u8 transmissionState;
	f32 speed;
	f32 heading;
	f32 angle;
	f32 accelSet;
	u8 brakes;
	u8 size;
}BSMcoreData;

SensorData data;
FusedData fused;
BSMcoreData RV1;
BSMcoreData RV2;

f64 lon_offset, laneWidth=3.5;
f64 rvRelX, rvRelY,hvppr2;

u8 left_turn_signal  = 0;
u8 right_turn_signal = 1;

const c8 *zone;
const c8 *direction;
f64 theta;
f64 lat_offset;


void Setup(void);
void Update_Sensors(void);
void TWI_sendSensorData(u8 slave_addr, SensorData* data);
u8 TWI_receiveFusedData(u8 slave_addr, FusedData* dest);
void TWI_receiveBSM(u8 slave_addr, GpsData* dest);

void Send_Data(void);
void Receive_Data(void);
void TC(void);
void Direction(void);
void features (void);


#endif /* APPLICATION_H_ */