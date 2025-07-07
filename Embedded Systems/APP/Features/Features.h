#ifndef FEATURES_H_
#define FEATURES_H_

#include "../../StdTypes.h"
#include "../../MCAL/String/String.h"
#include "../../HAL/MPU6050/MPU_Int.h"


#define SAFE_DISTANCE    30

//BSW
typedef enum {
	bsw_no_warning,
	bsw_left_warn,
	bsw_right_warn,
}bsw_warning_t;

typedef struct {
	u8 ima  : 1;
	u8 eebl : 1;
	u8 fcw  : 1;
	u8 dnpw : 1;
	u8 bsw  : 1;
	u8 res  : 3;
}flags;
typedef enum {
	ima_no_warning,
	ima_left_warn,
	ima_right_warn,
}ima_warning_t;

typedef struct {
	f32 lat;
	f32 lon;
	f32 ax;
	f32 ay;
	f32 yaw_rate;
	flags flag;
	u8 crc;
} SensorData;

SensorData data;
extern bsw_warning_t bs_warning;
extern ima_warning_t ima_warning;
extern const char* warning_strings[];

void FCW(f64 Ult_1, c8* zone, c8* direction);
void EEBL(f64 Ult_1, c8* zone, c8* direction);
void DNPW(f64 ULT_1, const c8* rv_zone, const c8* rv_direction);
ima_warning_t IMA(f64 ULT_1, const c8* rv_zone, const c8* rv_direction);
bsw_warning_t BSW(f64 ULT_3,f64 ULT_4, const c8* rv_zone, const c8* rv_direction, u8 left_turn_signal, u8 right_turn_signal);
#endif /* FEATURES_H_ */
