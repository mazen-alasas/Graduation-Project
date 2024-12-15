#include "StdTypes.h"
#include "LEDS_Int.h"
#include "DIO_Int.h"

void Led_On(DIO_Pin_t pin)
{
	DIO_WritePin(pin,HIGH);
}
void Led_Off(DIO_Pin_t pin)
{
	DIO_WritePin(pin,LOW);
}