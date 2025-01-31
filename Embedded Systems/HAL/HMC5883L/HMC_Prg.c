
#include "HMC_Int.h"

float MAGX = 0.0, MAGY = 0.0, MAGZ = 0.0;

void HMC_write(u8 dev_addr, u8 reg, u8 data) {
	start();
	send(dev_addr << 1);          //write mode
	send(reg);
	send(data);
	stop();
}

void HMC5883L_readall() {
	u8 data[6];

	start();
	send(HMC5883L_ADDRESS << 1);
	send(HMC5883L_DATA_START);

	start();
	send((HMC5883L_ADDRESS << 1) | 0x01);

	data[0] = Nack();
	data[1] = Ack();
	data[2] = Nack();
	data[3] = Ack();
	data[4] = Nack();
	data[5] = Nack();

	MAGX = (data[0] << 8) | data[1];
	MAGY = (data[2] << 8) | data[3];
	MAGZ = (data[4] << 8) | data[5];
}

void HMC5883L_init() {
	HMC_write(HMC5883L_ADDRESS, HMC5883L_MODE_REG, 0x00);
	HMC_write(HMC5883L_ADDRESS, HMC5883L_CONFIG_REG, 0x70);
}
