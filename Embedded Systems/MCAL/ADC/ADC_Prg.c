/*
 * ADC_Prg.c
 *
 * Created: 12/4/2024 10:35:40 PM
 *  Author: esraa
 */ 

#include "ADC_Int.h"

void ADC_Init(void)
{
	/* Disable ADC */
	CLR_BIT(ADCSRA,ADEN);
	/* Select Voltage Reference */
	#if AREF_Internal_Vref == ADC_VOLTAGE_REF
		CLR_BIT(ADMUX,REFS0);
		CLR_BIT(ADMUX,REFS1);
	#elif AVCC_External_Vref == ADC_VOLTAGE_REF
		CLR_BIT(ADMUX,REFS1);
		SET_BIT(ADMUX,REFS0);
	#elif Internal_2_56 == ADC_VOLTAGE_REF
		SET_BIT(ADMUX,REFS0);
		SET_BIT(ADMUX,REFS1);
	#else /* nothing*/
	#endif
	
	/* Select Prescaler Mode */
	ADCSRA &= MASK_PRES;
	ADCSRA |= ADC_PRESCALER_ ;
	/* Select ADC Mode */
	#if ADC_AUTO_TRIGGER == ADC_MODE
		SET_BIT(ADCSRA,ADATE);
		SFIOR &= MASK_AUTO;
		SFIOR |=ADC_Free_Running_mode;
	#elif ADC_SINGLE_CONVERSION == ADC_MODE
	  SET_BIT(ADCSRA,ADATE);
	#endif
	/* Select ADC Adjustment Option */	
	#if ADLAR_RIGHT_ADJUST == ADC_ADJUSTMENT
		CLR_BIT(ADMUX,ADLAR);		
	#elif ADLAR_LEFT_ADJUST == ADC_ADJUSTMENT
		SET_BIT(ADMUX,ADLAR);
	#else /* nothing*/
	#endif
	
	/*Enable ADC Interrupt*/
	//SET_BIT(ADCSRA,ADIF);		
	
	/* Enable ADC */
	SET_BIT(ADCSRA,ADEN);			
}

u16 ADC_GetResult(void)
{
	/* Wait for Conversion to Complete */
	#if ADC_SINGLE_CONVERSION == ADC_MODE
		while (GET_BIT(ADCSRA, ADSC));
	#else /* Auto Trigger*/
	#endif
	#if (ADLAR_RIGHT_ADJUST == ADC_ADJUSTMENT)
		return (ADCL | (ADCH << 8));
	#elif (ADLAR_LEFT_ADJUST == ADC_ADJUSTMENT)
		return ADC;
	#else /* nothing*/
	#endif
}

void ADC_StartConversion(adc_channel_t channel)
{
	ADMUX = (ADMUX & MASK_CHANN) | channel;
	SET_BIT(ADCSRA, ADSC);
}

void ADC_Enable(void)
{
	SET_BIT(ADCSRA, ADEN);
}

void ADC_Disable(void)
{
	CLR_BIT(ADCSRA, ADEN);
}

void ADC_EnableInt(void)
{
	SET_BIT(ADCSRA,ADIE);
}

void ADC_DisableInt(void)
{
	CLR_BIT(ADCSRA,ADIE);
}

/* ISR for ADC conversion complete */
void __vector_16 (void)  __attribute__((signal)) ;
void __vector_16 (void)
{
	// ....
}