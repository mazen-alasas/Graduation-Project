#include <avr/io.h>
#include "SPI.h"


void SPI_vInitMaster (void)
{
	DDRB |=(1<<SPI_MOSI) |(1<<SPI_SS)|(1<<SPI_SCK);
	SPCR |= (1<<SPE)|(1<<MSTR)|(1<<SPR0);
}

void SPI_vInitSlave (void)
{
	DDRB |= (1<<SPI_MISO) ;
	SPCR |= (1<<SPE);
}

u8 SPI_ui8TransmitRecive (u8 data)
{
	SPDR = data;
	while (((SPSR&(1<<SPIF))>>SPIF)==0)  ;
	
	return SPDR;
}