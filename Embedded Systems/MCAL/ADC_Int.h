


#ifndef ADC_INT_H_
#define ADC_INT_H_




typedef enum{
	CH_0=0,
	CH_1,
	CH_2,
	CH_3,
	CH_4,
	CH_5,
	CH_6,
	CH_7
}ADC_Channel_t;

typedef enum{
	VREF_AREF,
	VREF_VCC,
	VREF_256
}ADC_VREF_t;


typedef enum{
	ADC_SCALER_2=1,
	ADC_SCALER_4,
	ADC_SCALER_8,
	ADC_SCALER_16,
	ADC_SCALER_32,
	ADC_SCALER_64,
	ADC_SCALER_128
}ADC_Prescaler_t;

extern ADC_Prescaler_t Scaler;
extern ADC_VREF_t Vref;

void ADC_Init(void);

u16 ADC_Read(ADC_Channel_t ch);

u16 ADC_ReadVolt(ADC_Channel_t ch);
u16 ADC_ReadVolt1(ADC_Channel_t ch);

#endif /* ADC_INT_H_ */