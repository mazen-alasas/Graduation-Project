#include "Ultra_Int.h"

u16 Ult_InpCap(DIO_Pin_t pinnumber)
{
	u16 a, b, high;

	TCCR1A = 0;
	TIFR = (1<<ICF1);  	/* Clear ICF (Input Capture flag)  */

	DIO_WritePin(pinnumber, 1);
	_delay_us(10);
	DIO_WritePin(pinnumber, 0);

	TCCR1B = 0xc1;  	/* Rising edge, no prescaler , noise canceler*/
	while ((TIFR&(1<<ICF1)) == 0);
	a = ICR1;
	TIFR = (1<<ICF1);  	/* Clear ICF flag */

	TCCR1B = 0x81;  	/* Falling edge, no prescaler ,noise canceler*/
	while ((TIFR&(1<<ICF1)) == 0);
	b = ICR1;
	TIFR = (1<<ICF1);  	/* Clear ICF flag */

	TCNT1 = 0;
	TCCR1B = 0;  		/* Stop the timer */
	high = b - a;

	return high;
}

u16 Ult_Dista(DIO_Pin_t pinnumber)
{
	u16 timee = Ult_InpCap(pinnumber);
	return timee/58;
}
