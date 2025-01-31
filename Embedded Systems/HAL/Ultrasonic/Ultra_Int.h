
#ifndef ULTRA_INT_H_
#define ULTRA_INT_H_
#include "../../StdTypes.h"
#include "../../MCAL/DIO/DIO_Int.h"
#include "../../CFG/Ultra_Cfg.h"
#include <util/delay.h>


#define MAX_TIMEOUT   30000 // > ((2*400)/0.0343)  

void Ultra_Init(void);
u16 Ultra_Time(void);
u16 Ultra_Dist(void) ;

#endif /* ULTRA_INT_H_ */