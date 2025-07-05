#ifndef FEATURES_H_
#define FEATURES_H_

#include "../../StdTypes.h"
#include "../../MCAL/String/String.h"
#include "../../HAL/MPU6050/MPU_Int.h"


// FCW
#define  K_TTC_THRES           3.0


void FCW(f64 host_speed, f64 remote_speed, f64 lon_offset, c8* zone, c8* direction);
