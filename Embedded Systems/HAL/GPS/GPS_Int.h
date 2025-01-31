
#ifndef GPS_INT_H_
#define GPS_INT_H_
#include "../../StdTypes.h"
#include "../../MCAL/String/String.h"
#include "../../MCAL/UART/UART_Int.h"
#include <math.h> 

typedef double  f64;

typedef struct {
	u8 time[10];
	f64 latitude;
	f64 longitude;
	bool_t valid;
	f64 speed;  
	u32 course; 
} GPSData;

void GPS_Init(void);
bool_t GPS_ReadData(GPSData* data);
f64 GPS_Distance(f64 lat1, f64 lon1, f64 lat2, f64 lon2);

#endif /* GPS_INT_H_*/