#ifndef HMC_INT_H
#define HMC_INT_H

#include "../../StdTypes.h"
#include "../../MCAL/I2C/I2C_Int.h"

#define HMC5883L_ADDRESS      0x1E
#define HMC5883L_MODE_REG     0x02
#define HMC5883L_CONFIG_REG   0x00
#define HMC5883L_DATA_START   0x03

extern float MAGX, MAGY, MAGZ;

void HMC5883L_init(void);
void HMC5883L_readall(void);
void HMC_write(u8 dev_addr, u8 reg, u8 data);

#endif /* HMC_INT_H */