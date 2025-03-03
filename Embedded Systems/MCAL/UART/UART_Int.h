#ifndef UART_INT_H
#define UART_INT_H

#include "../../StdTypes.h"
#include "../../MemMap.h"
#include "../../CFG/UART_Cfg.h"

#define MYUBRR ((F_CPU / 16/BAUD) - 1)


void UART_Init(void);
void UART_Transmit(u8 data);
u8  UART_Read(void);

#endif /* UART_INT_H */