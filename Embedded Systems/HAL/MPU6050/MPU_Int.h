#ifndef MPU_INT_H
#define MPU_INT_H

#include "../../MCAL/I2C/I2C_Int.h"
#include "../../StdTypes.h"

typedef float   f32;

#define PWR_1   		 0x6B
#define acc_config   	 0x1C
#define gyro_config   	 0x1B
#define WHO_AM_I		 0x75
#define MPU60X0_W		 0xD0
#define MPU60X0_R		 0xD1
#define MPU6050_accx	 0x3B

extern u8 arr[14];
extern f32 ACCX, ACCY, ACCZ, T, GYX, GYY, GYZ;
extern f32 AX, AY, AZ, TEM, GY, GX, GZ;

void MPU_write(u8 dev_addr, u8 reg, u8 instr);
void deviceid();
void MPU_readall();
#endif /* MPU_INT_H */