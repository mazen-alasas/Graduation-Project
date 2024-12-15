
#include "../../StdTypes.h"
#include "../../MCAL/DIO/DIO_Int.h"
#include "../../CFG/DC_Motor_Cfg.h"
#include "DC_Motor.h"
#include "DC_Motor_Private.h"

void DC_Motor_Move_CW(Motor_t m)
{
	Motor_t i;
	for(i=M1; i<NUM_OF_MOTOR ;i++)
	{
		if(i == m){
			DIO_WritePin(motor_pins[i][0], HIGH);
			DIO_WritePin(motor_pins[i][1], LOW);
		}
	}
}

void DC_Motor_Move_CCW(Motor_t m)
{
	Motor_t i;
	for(i=M1; i<NUM_OF_MOTOR ;i++)
	{
		if(i == m){
			DIO_WritePin(motor_pins[i][0], LOW);
			DIO_WritePin(motor_pins[i][1], HIGH);
		}
	}
}

void DC_Motor_Stop(Motor_t m)
{
	Motor_t i;
	for(i=M1; i<NUM_OF_MOTOR ;i++)
	{
		if(i == m){
			DIO_WritePin(motor_pins[i][0], LOW);
			DIO_WritePin(motor_pins[i][1], LOW);
		}
	}
}