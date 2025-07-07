#ifndef SPI_H_
#define SPI_H_

#include "../../MemMap.h"
#include "../../StdTypes.h"

#define SPI_SCK  7
#define SPI_MISO 6
#define SPI_MOSI 5
#define SPI_SS   4
#define DEFAULT_ACK  0XFF


void SPI_vInitMaster (void);


void SPI_vInitSlave (void);


u8 SPI_ui8TransmitRecive (u8 data);

#endif�/*�SPI_H_�*/