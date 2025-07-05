
#include "Ultra_Int.h"

static volatile u8 flag = 0;
static volatile u16 t1 = 0, t2 = 0;

static void FUNC_ICU(void)
{
	if (flag == 0)
	{
		t1 = ICR1;
		Timer1_InputCaptureEdge(FALLING);
		flag = 1;
	}
	else if (flag == 1)
	{
		t2 = ICR1;
		Timer1_ICU_InterruptDisable();
		flag = 2;
	}
}

void Ult_Init(void)
{
	Timer1_Init(TIMER1_NORMAL_MODE, TIMER1_SCALER_8);
	Timer1_ICU_SetCallBack(FUNC_ICU);
	
}

u16 Ult_Dista(DIO_Pin_t trigPin)
{
	TCNT1 = 0;
	TIFR = (1 << ICF1);
	Timer1_InputCaptureEdge(RISING);
	Timer1_ICU_InterruptEnable();

	DIO_WritePin(trigPin, HIGH);
	_delay_us(10);
	DIO_WritePin(trigPin, LOW);

	while(flag < 2);
	u16 time = t2 - t1;
	u16 distance = time / 58;
	flag = 0;

	return distance;
}
