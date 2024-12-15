#include "../StdTypes.h"
#include "../MemMap.h"
#include "ADC_Int.h"
#include "ADC_Cfg.h"

#define  F_CPU   8000000
#include <util/delay.h>

u8 ConversionFlag=0;

void ADC_Init(void)
{
	/* Vref*/
	switch(Vref)
	{
		case VREF_AREF:
		CLR_BIT(ADMUX,REFS0);
		CLR_BIT(ADMUX,REFS1);
		break;
		case VREF_VCC:
		SET_BIT(ADMUX,REFS0);
		CLR_BIT(ADMUX,REFS1);
		break;
		case VREF_256:
		SET_BIT(ADMUX,REFS0);
		SET_BIT(ADMUX,REFS1);
		break;
	}
	
	/*prescaler*/
	ADCSRA=ADCSRA & ADC_PRESCALER_CLR_MASK;//0b11111000
	ADCSRA=ADCSRA | (Scaler);
	/*pins*/
	/*enable ADC*/
	SET_BIT(ADCSRA,ADEN);
	
}

u16 ADC_Read(ADC_Channel_t ch)
{
	u16 adc;
	/*select channel*/
	ADMUX=ADMUX & ADC_CHANNEL_CLR_MASK;
	ADMUX=ADMUX | ch;

	/*start conversion*/
	SET_BIT(ADCSRA,ADSC);
	
	
	/*wait until conversion end*/
	while(GET_BIT(ADCSRA,ADSC));

	/* get reading*/
	//adc=ADCH<<8|ADCL;
	adc=ADC;
	return adc;
}


void ADC_StartConversion(ADC_Channel_t ch)
{
	if(ConversionFlag==0)
	{
		/*select channel*/
		ADMUX=ADMUX & ADC_CHANNEL_CLR_MASK; // 0b11100000
		ADMUX=ADMUX | ch;

		/*start conversion*/
		SET_BIT(ADCSRA,ADSC);
		ConversionFlag=1;
	}
	
}

u16 ADC_GetRead(void)
{
	/*wait until conversion end*/
	while(GET_BIT(ADCSRA,ADSC));
	ConversionFlag=0;
	/* get reading*/
	//adc=ADCH<<8|ADCL;
	return ADC;
}

u8 ADC_GetReadPeriodic(u16 *Pdata)
{
	if(!GET_BIT(ADCSRA,ADSC))
	{
		*Pdata=ADC;
		ConversionFlag=0;
		return OK;
	}
	return INPROGRESS;
}

u16 ADC_ReadVolt(ADC_Channel_t ch)
{
	u16 adc=ADC_Read(ch);
	u16 volt;
	volt=(((u32)4600*adc)/(1024))+200;        // vref  0.2  -  4.8
	return volt;
}

u16 ADC_ReadVolt1(ADC_Channel_t ch)
{
	u16 adc=ADC_Read(ch);
	u16 volt;
	volt=((u32)5000*adc)/(1024);
	return volt;
}
