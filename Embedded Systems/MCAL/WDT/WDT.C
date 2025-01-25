
#include "StdTypes.h"
#include "MemMap.h"

#include "WDT.h"




void WDT_Set(TimeOut_type time)
{
	u8 wdt_value=0x08;//WDE SET & WDTOE CLEARED 0B00001000
	wdt_value|=time;//0B00001011
	/*start  critical section*/
	WDTCR |= (1<<WDTOE) | (1<<WDE);
		
	WDTCR=wdt_value;
	/*end critical */
}
void WDT_Stop(void)
{
	/*start  critical section*/
	WDTCR=(1<<WDTOE)|(1<<WDE);
	
	WDTCR=0;
	/*end critical */
}


void WDT_Reset(TimeOut_type time)
{
	// stop
	
	cli();
	WDTCR=(1<<WDTOE)|(1<<WDE);
	
	WDTCR=0;
	sei();
	
	// set
	
	u8 wdt_value=0x08;//WDE SET & WDTOE CLEARED 0B00001000
	wdt_value|=time;//0B00001011
	cli();
	WDTCR |= (1<<WDTOE) | (1<<WDE);
	
	WDTCR=wdt_value;
	sei();
}