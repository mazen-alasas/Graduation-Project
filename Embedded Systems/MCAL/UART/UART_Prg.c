#include "UART_Int.h"

void UART_Init(void) {
	UBRRH = (u8)(MYUBRR >> 8);
	UBRRL = (u8)(MYUBRR);
	
	UCSRB |= (1 << TXEN) | (1 << RXEN);

	UCSRC = (1 << URSEL) | (1 << UCSZ1) | (1 << UCSZ0);
}

void UART_Transmit(u8 data) {
	while (!(GET_BIT(UCSRA, UDRE)));
	UDR = data;
}

u8 UART_Read(void) {
	while (!(GET_BIT(UCSRA, RXC)));
	return UDR;
}

