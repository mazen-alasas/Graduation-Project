
#ifndef DC_MOTOR_CFG_H_
#define DC_MOTOR_CFG_H_

#include "../MCAL/DIO/DIO_Int.h"
#include "../HAL/DC_Motor/DC_Motor.h"

#define NUM_OF_MOTOR    4
#define NUM_OF_PINS     2
extern const DIO_Pin_t motor_pins[NUM_OF_MOTOR][NUM_OF_PINS];


#endif /* DC_MOTOR_CFG_H_ */