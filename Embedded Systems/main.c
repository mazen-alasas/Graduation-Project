#include "Application.h"

u16 distance1, distance2, distance3, distance4;
volatile u8 mpu_flag = 0;
f32 Yaw = 0.0;
u8 rec;
int main(void)
{
	Setup();
	Lcd_String_Pos(1,1,"ADAS & V2V");
	while (1)
	{
		MPU_Conv();
		if (GPS_ReadData(&gps_data)) {
			if (gps_data.valid ){
				data.lat = gps_data.latitude;  
				data.lon = gps_data.longitude;
			}
		}
		data.ax = AX;
		data.ay = AY;
		data.yaw_rate = GZ;

		Send_Data();
		rec = TWI_receiveFusedData(ESP32_ADDR, &fused);

		if(TWI_receiveFusedData(ESP32_ADDR2, &RV1) || TWI_receiveFusedData(ESP32_ADDR2, &RV2))
		{
			TC();
			Direction();
			features();
		}
		if (data.flag.bsw){
			if(bsw_warning == bsw_right_warn) Lcd_String_Pos(4,1,"BSW Right Warning");
			if(bsw_warning == bsw_left_warn) Lcd_String_Pos(4,1,"BSW Left Warning");
		}
		if (data.flag.dnpw) Lcd_String_Pos(4,1,"DNPW Warning");
		if (data.flag.eebl) Lcd_String_Pos(4,1,"EEBL Warning");
		if (data.flag.fcw)  Lcd_String_Pos(4,1,"FCW Warning");
		if (data.flag.ima){
			if(ima_warning == ima_right_warn) Lcd_String_Pos(4,1,"IMA Left Warning");
			if(ima_warning == ima_left_warn) Lcd_String_Pos(4,1,"IMA Left Warning");
		}
		RTOS_u8CreateTask(0, Send_Data, 100);
		RTOS_u8CreateTask(1, Receive_Data, 200);
		RTOS_u8CreateTask(2, TC, 500);
		RTOS_u8CreateTask(3, Direction, 500);
		RTOS_u8CreateTask(4, features, 500);
		RTOS_voidStart();
	
		_delay_ms(500);
	}
}
void Timer0_Handler(void)
{
	mpu_flag = 1;
}

void Setup(void){
	DIO_Init();
	TWI_init();
	Lcd_Init();
	GPS_Init();
	Ult_Init();
	MPU_Init();
	calibrate_MPU();
	MPU_Conv();
	TIMER0_Init(TIMER0_CTC_MODE, TIMER0_SCALER_64);
	TIMER0_OCR_set(234);
	TIMER0_OC_intSetCallBack(Timer0_Handler);
	TIMER0_OC_InterruptEnable();
	Lcd_Clear();
	sei();
}

void Update_Sensors(void)
{
	distance1 = Ult_Dista(PINB0);
	distance2 = Ult_Dista(PINB1);
	distance3 = Ult_Dista(PINB2);
	distance4 = Ult_Dista(PINB3);
	if (mpu_flag) {
		mpu_flag = 0;
		MPU_Conv();
		Yaw += GZ * 1.125;
		if (Yaw < 0) {
			Yaw += 360;
		}
		Yaw = fmod(Yaw, 360);
	}
	
}
u32 MeasureTime(void (*Func)(void))
{
	TCNT1 = 0;
	Func();
	return (u32)TCNT1;
}

void Send_Data(void){
	TWI_sendSensorData(ESP32_ADDR , &data);
}
void Receive_Data(void){
	TWI_receiveFusedData(ESP32_ADDR, &fused);
	TWI_receiveFusedData(ESP32_ADDR2, &RV1);
	TWI_receiveFusedData(ESP32_ADDR2, &RV2);
}

void TC(void)
{
	ConvertLatLongToXY(fused.fused_lat, fused.fused_lon,0.0, RV1.lat, RV1.lon, &rvRelX, &rvRelY);
	hvppr2 = CalcGpsDist(latref,lonref ,fused.fused_lat, fused.fused_lon);
	f64 hvppc_rv_dist = CalcGpsDist(latref,lonref , RV1.lat, RV1.lon);
	lat_offset = hvppc_rv_dist -  hvppr2 ;
	zone = Classify_Zone(rvRelY, hvppr2, rvRelX, laneWidth);
}

void Direction(void){
	theta = Compute_Theta(RV1.heading, fused.yaw);
	direction = Classify_Direction(theta);
}

void features (){
	lon_offset = hvppr2 * theta;
	FCW(fused.velocity, RV1.speed,lon_offset, zone,direction);
	EEBL(fused.velocity, RV1.accelSet, lon_offset, zone, direction);
	DNPW(fused.velocity, RV1.speed, RV2.speed, lon_offset,zone,direction);
	BSW(fused.velocity, RV1.speed, lon_offset,zone,direction,left_turn_signal,right_turn_signal);
	IMA(fused.velocity, RV1.speed, lat_offset,lon_offset,theta,zone,direction);
}
void TWI_sendSensorData(u8 slave_addr, SensorData* data) {
	u8* bytePtr = (u8*)data;
	u8 crc = calculateCRC((u8*)bytePtr, sizeof(SensorData) - 1);
	data->crc = crc;
	Lcd_Clear();
	LCD_WriteNumber((u32)data->crc);
	TWI_start();
	TWI_writeByte(slave_addr << 1 | 0);  // Write

	for (u8 i = 0; i < sizeof(SensorData); i++) {
		TWI_writeByte(bytePtr[i]);
	}
	TWI_stop();
}

void TWI_sendFlags(u8 slave_addr, flags* f) {
	u8 crc = calculateCRC((u8*)f, sizeof(flags));
	TWI_start();
	TWI_writeByte((slave_addr << 1) | 0);
	for (u8 i = 0; i < sizeof(flags); i++) {
		TWI_writeByte(((u8*)f)[i]);
	}
	TWI_writeByte(crc);
	TWI_stop();
}

u8 TWI_receiveFusedData(u8 slave_addr, FusedData* dest) {
	u8* bytePtr = (u8*)dest;

	TWI_start();
	TWI_writeByte((slave_addr << 1) | 1);  // Read
	
	for (u8 i = 0; i < sizeof(FusedData); i++) {
		if (i == sizeof(FusedData) - 1)
		bytePtr[i] = TWI_readByteWithNACK();  // last byte (crc)
		else
		bytePtr[i] = TWI_readByteWithACK();
	}
	TWI_stop();

	u8 crc = calculateCRC((u8*)dest, sizeof(FusedData) - 1);
	return (crc == dest->crc);
}


