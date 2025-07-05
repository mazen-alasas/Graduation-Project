#ifndef TC_INT_H_
#define TC_INT_H_

#include "../../StdTypes.h"

#include <math.h>

#define  R            6371000.0
#define  K_TTC_THRES  4.0

typedef struct {
	f64 latitude;
	f64 longitude;
	f64 heading;
	f64 speed;
} Vehicle;

f64 rvRelx;
f64 rvRely;
void ConvertLatLongToXY(f64 refLat, f64 refLong, f64 refHead, f64 latitude, f64 longitude, f64 *x, f64 *y) ;
void ConvertXYtoLatLong(f64 refLat, f64 refLong, f64 relX, f64 relY, f64 *lat, f64 *lon);
f64 CalcGpsDist(f64 refLat, f64 refLong, f64 latitude, f64 longitude);
f64 Compute_YawRate(f64 RVyaw, f64 HVyaw);
f64 Compute_Radius(f64 speed, f64 yaw_rate);
f64 Calculate_Bearing(f64 lat1, f64 lat2 ,f64 lon1, f64 lon2) ;
f64 Compute_Theta(f64 rv_heading, f64 hv_heading);
const c8* Classify_Zone(f64 rvRelX, f64 hvppr, f64 lat_offset, f64 laneWidth);
const c8* Classify_Direction(f64 theta);
f64 AvgLateralOffset(f64 RV_lat[], f64 RV_lon[], Vehicle HV);

#endif /* TC_INT_H_ */