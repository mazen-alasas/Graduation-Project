/*
 * ADC_Int.h
 *
 * Created: 12/4/2024 10:36:19 PM
 *  Author: esraa
 */ 
#ifndef	ADC_INT_H_
#define ADC_INT_H_

#include "../../MemMap.h"
#include "../../StdTypes.h"


#define MASK_CHANN               0xE0
#define MASK_Vref                0x3F
#define MASK_AUTO                0xDF
#define MASK_PRES                0xFC

#define ADC_ENABLE                1
#define ADC_DISABLE               0
#define ADC_INT_ENABLE            1
#define ADC_INT_DISABLE           0

#define AREF_Internal_Vref       0x00
#define AVCC_External_Vref       0x40
#define Internal_2_56            0xC0


#define ADC_SINGLE_CONVERSION    0
#define ADC_AUTO_TRIGGER         1

#define ADC_Free_Running_mode    0x00
#define ADC_Analog_Comp          0x20
#define ADC_Ext_Int              0x40
#define ADC_Timer0_Comp_Match    0x60
#define ADC_Timer0_Overflow      0x80
#define ADC_Timer1_Comp_Match    0xA0
#define ADC_Timer1_Overflow      0xC0
#define ADC_Timer1_Capture_event 0xE0

typedef enum {
	ADC_CHANNEL_0 = 0,
	ADC_CHANNEL_1,
	ADC_CHANNEL_2,
	ADC_CHANNEL_3,
	ADC_CHANNEL_4,
	ADC_CHANNEL_5,
	ADC_CHANNEL_6,
	ADC_CHANNEL_7
} adc_channel_t;

/* ADC Adjustment Options */
typedef enum {
	ADLAR_RIGHT_ADJUST = 0,
	ADLAR_LEFT_ADJUST
}adc_adjust_t;

typedef enum {
	ADC_PRESCALER_2 = 0,
	ADC_PRESCALER_4 = 2,
	ADC_PRESCALER_8,
	ADC_PRESCALER_16,
	ADC_PRESCALER_32,
	ADC_PRESCALER_64,
	ADC_PRESCALER_128
} adc_prescaler_t;

void ADC_Init(void); 
void ADC_StartConversion(adc_channel_t channel);             
u16  ADC_GetResult(void);

void ADC_Enable(void);
void ADC_Disable(void);
void ADC_EnableInt(void);
void ADC_DisableInt(void);


#endif /* ADC_INT_H_ */
