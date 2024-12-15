
#ifndef DC_MOTOR_H_
#define DC_MOTOR_H_
#include "../../MCAL/DIO/DIO_Int.h"


typedef enum {
	M1,
	M2,
	M3,
	M4
}Motor_t;
void DC_Motor_Move_CW(Motor_t m);
void DC_Motor_Move_CCW(Motor_t m);
void DC_Motor_Stop(Motor_t m);

#endif /* DC_MOTOR_H_ */
