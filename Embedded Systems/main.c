
#include "StdTypes.h"
#include "MemMap.h"
#include "DIO_Int.h"

#define F_CPU 8000000
#include <util/delay.h>

int main(void)
{
    
    while (1) 
    {
		DIO_InitPin(PINB0,HIGH);
		DIO_WritePin(PINB0,HIGH);
    }
}

