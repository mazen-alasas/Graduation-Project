

#ifndef ULTRA_INT_H_
#define ULTRA_INT_H_
#include "../../StdTypes.h"
#include "../../MemMap.h"
#include "../../MCAL/DIO/DIO_Int.h"
#include "../../CFG/Ultrasonic_Cfg.h"

#include <util/delay.h>

u16 Ult_InpCap(DIO_Pin_t pinnumber);
u16 Ult_Dista(DIO_Pin_t pinnumber);

#endif /* ULTRA_INT_H_ */