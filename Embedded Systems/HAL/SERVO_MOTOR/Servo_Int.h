#ifndef SERVO_H_
#define SERVO_H_


#include "../../MCAL/Timer/TIMERS.h"
#include "../../MemMap.h"
#define SERVO_MIN_PULSE 1000  // Minimum pulse width for 0 degrees (in timer ticks)
#define SERVO_MAX_PULSE 2000  // Maximum pulse width for 180 degrees (in timer ticks)


void Servo_Init(void) ;
void Servo_SetAngle(u8 angle) ;

#endif /* SERVO_H_ */