/*
 * cfg.h
 *
 * Created: 12/6/2024 10:28:08 PM
 *  Author: esraa
 */ 
#include "../MemMap.h"
#include "../StdTypes.h"
#include "../MCAL/ADC/ADC_Int.h"
/*
* ADC_ENABLE
* ADC_DISABLE
*/
#define ADC_STATUS              ADC_ENABLE
/*
* ADC_INT_ENABLE
* ADC_INT_DISABLE
*/
#define INT_STATUS              ADC_INT_DISABLE
/*
* AREF_Internal_Vref
* AVCC_External_Vref
* Internal_2_56
*/
#define ADC_VOLTAGE_REF         AVCC_External_Vref
/*
* AREF_Internal_Vref
* AVCC_External_Vref
* Internal_2_56
*/
#define ADC_MODE                ADC_SINGLE_CONVERSION
/*
* ADLAR_RIGHT_ADJUST
* ADLAR_LEFT_ADJUST
*/
#define ADC_ADJUSTMENT          ADLAR_RIGHT_ADJUST
/*
* ADC_PRESCALER_2
* ADC_PRESCALER_4
* ADC_PRESCALER_8
* ADC_PRESCALER_16
* ADC_PRESCALER_32
* ADC_PRESCALER_64
* ADC_PRESCALER_128
*/
#define ADC_PRESCALER_          ADC_PRESCALER_128
