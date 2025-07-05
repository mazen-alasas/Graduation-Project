
#ifndef ULTRA_INT_H_
#define ULTRA_INT_H_
#include "../../StdTypes.h"
#include "../../MemMap.h"
#include "../../MCAL/DIO/DIO_Int.h"
#include "../../MCAL/Timers/Timers.h"
#include "../../CFG/Ultrasonic_Cfg.h"

#define  F_CPU 8000000UL
#include <util/delay.h>

void Ult_Init(void);
u16 Ult_Dista(DIO_Pin_t trigPin);
//u8 UART_ReadLine(c8* line);
#endif /* ULTRA_INT_H_ */