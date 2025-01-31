#include "GPS_Int.h"

#define EARTH_RADIUS_KM    6371
#define MAX_BUFFER_SIZE    100
#define MAX_SUB_SIZE       20

f64 Float_tostring(c8 str[]);

void GPS_Init(void){
	UART_INIT();
}

void Read_UART(c8* buffer)
{
	for (u8 i = 0; i < MAX_BUFFER_SIZE; i++)
	{
		buffer[i] = UART_Read();
		if (buffer[i] == '\n') {
			buffer[i + 1] = '\0';
			break;
		}
	}
}

bool_t check_GPRMC(c8* buffer)
{
	c8 first6[7];
	for (u8 num = 0; num < 6; num++) {
		first6[num] = buffer[num];
	}
	first6[6] = '\0';
	return string_compare(first6, "$GPRMC");
}

void Process_Data(u8 numCom, c8* substring, GPSData* data)
{
	switch(numCom)
	{
		case 2:
			for (u8 j = 0; j < 9 && substring[j] != '\0'; j++) {
				data->time[j] = substring[j];
			}
			data->time[9] = '\0';
			break;
		case 3:
			data->valid = (substring[0] == 'A') ? True : False;
			break;
		case 4:
			data->latitude = Float_tostring(substring);
			break;
		case 5: // N/S
			if (substring[0] == 'S') {
				data->latitude *= -1;
			}
			break;
		case 6:
			data->longitude = Float_tostring(substring);
			break;
		case 7: // W/E
			if (substring[0] == 'W') {
				data->longitude *= -1;
			}
			break;
		case 8:
			data->speed = Float_tostring(substring) * 0.514444;
			break;
		case 9:
			data->course = (u32)Float_tostring(substring);
			break;
	}
}


void Extract_Comma(c8* buffer, GPSData* data)
{
	u8 field = 0;
	c8 currentToken[MAX_SUB_SIZE];
	u8 i = 0;
	while (buffer[i] != '\0')
	{
		if (buffer[i] == ',' || buffer[i] == '\n')
		{
			buffer[i] = '\0';
			field++;
			Process_Data(field, currentToken, data);
			currentToken[0] = '\0';
		}
		else
		{
			u8 len = string_length(currentToken);
			currentToken[len] = buffer[i];
			currentToken[len + 1] = '\0';
		}
		i++;
	}
}

bool_t GPS_ReadData(GPSData* data) {
	c8 buffer[MAX_BUFFER_SIZE];
	bool_t found_data = False;
	do {
		Read_UART(buffer);
		if (check_GPRMC(buffer)) {
			found_data = True;
		}
	}while (!found_data);
	Extract_Comma(buffer, data);
	
	return data->valid;
}

f64 GPS_Distance(f64 lat1, f64 lon1, f64 lat2, f64 lon2) {
	f64 lat1_rad = lat1 / 100000.0 * M_PI / 180.0;
	f64 lon1_rad = lon1 / 100000.0 * M_PI / 180.0;
	f64 lat2_rad = lat2 / 100000.0 * M_PI / 180.0;
	f64 lon2_rad = lon2 / 100000.0 * M_PI / 180.0;

	f64 dlat = lat2_rad - lat1_rad;
	f64 dlon = lon2_rad - lon1_rad;

	f64 a = sin(dlat / 2) * sin(dlat / 2) + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2) * sin(dlon / 2);
	f64 c = 2 * atan2(sqrt(a), sqrt(1 - a));
	return (u32)(EARTH_RADIUS_KM * c * 1000);
}

void GPS_ConvertLatLongToXY(f64 refLat, f64 refLong, f64 latitude, f64 longitude, f64* X, f64* Y)
{
	f64 refLatRad = refLat/ 100000.0 * M_PI / 180.0;
	f64 refLongRad = refLong/ 100000.0 * M_PI / 180.0;
	f64 latRad = latitude/ 100000.0 * M_PI / 180.0;
	f64 lonRad = longitude/ 100000.0 * M_PI / 180.0;

	f64 dLat = latRad - refLatRad;  
	f64 dLon = lonRad - refLongRad; 

	*X = dLon * EARTH_RADIUS_KM * 1000.0 * cos(refLatRad);
	*Y = dLat * EARTH_RADIUS_KM * 1000.0;  
}

f64 Float_tostring(c8 str[]) {
	f64 result = 0.0;
	f64 fraction = 0.0;
	f64 divisor = 10.0;
	u8 i = 0;
	u8 isFraction = 0;

	while (str[i] != '\0') {
		if (str[i] == '.') {
			isFraction = 1;
			i++;
			continue;
		}
		if (isFraction) {
			fraction += (str[i] - '0') / divisor;
			divisor *= 10.0;
		}
		else {
			result = result * 10 + (str[i] - '0');
		}
		i++;
	}
	return (result + fraction);
}
