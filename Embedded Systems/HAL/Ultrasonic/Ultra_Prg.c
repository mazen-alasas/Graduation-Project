#include "Ultra_Int.h"

void Ultra_Init(void)
{
	DIO_WritePin(TRIGGER_PIN, LOW);
}

void Ultra_Trigger(void)
{
	DIO_WritePin(TRIGGER_PIN, HIGH);
	_delay_us(10);
	DIO_WritePin(TRIGGER_PIN, LOW);
}

u16 Ultra_Time(void)
{
	Ultra_Trigger();
	u16 timeout = 0;
	while(!DIO_ReadPin(ECHO_PIN));
	
	while (DIO_ReadPin(ECHO_PIN) && timeout < MAX_TIMEOUT)
	{
		timeout++;
		_delay_us(1);
	}
	if (timeout >= MAX_TIMEOUT)
	{
		return 0;
	}
	return timeout;
}

u16 Ultra_Dist(void)
{
	u16 pulses = Ultra_Time();

	if(pulses == 0)
	{
		return 0;
	}
	
	u16 distance = (pulses * 0.0343) / 2; //cm
	return distance;
}

