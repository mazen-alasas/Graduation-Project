
#include "I2C_Int.h"

void i2c_init(void)
{
	TWBR = 32;                    
	TWCR |= (1 << TWEN);   // activation I2C      
}
void wait(void)
{
	while(!( TWCR & (1 << TWINT)));    
	
}
void start(void)
{
	TWCR = (1 << TWINT) | (1 << TWEN) | (1 << TWSTA);  
	wait();
}
void stop()
{
	TWCR = (1 << TWINT) | (1 << TWEN) | (1 << TWSTO);
	
}
u8 Ack(void)                       
{
	TWCR = (1 << TWINT) | (1 << TWEN) | (1 << TWEA);
	wait();
	return TWDR;
}
u8 Nack(void)          
{
	TWCR = (1 << TWINT) | (1 << TWEN);
	wait();
	return TWDR;
}
void send(u8 data)
{
	TWDR = data;
	TWCR = (1 << TWINT) | (1 << TWEN);  
	wait();
}