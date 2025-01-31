#ifndef I2C_INT_H
#define I2C_INT_H

#include "../../MemMap.h"
#include "../../StdTypes.h"

void i2c_init(void);
void wait(void);
void start(void);
void stop(void);
void send(u8 data);
u8 Ack(void);
u8 Nack(void);

#endif /* I2C_INT_H */