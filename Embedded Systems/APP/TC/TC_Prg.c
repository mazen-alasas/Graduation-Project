#include "TC.h"

void ConvertLatLongToXY(f64 refLat, f64 refLong, f64 refHead, f64 latitude, f64 longitude, f64 *x, f64 *y)
{
	f64 refLatRad = refLat * M_PI / 180.0;
	f64 refLongRad = refLong * M_PI / 180.0;
	f64 latRad = latitude * M_PI / 180.0;
	f64 longRad = longitude * M_PI / 180.0;
	f64 headingRad = refHead * M_PI / 180.0;

	f64 deltaLat = latRad - refLatRad;
	f64 deltaLong = longRad - refLongRad;

	f64 deltaX = R * deltaLong * cos(refLatRad);
	f64 deltaY = R * deltaLat;

	*x = deltaX * cos(-headingRad) - deltaY * sin(-headingRad);
	*y = deltaX * sin(-headingRad) + deltaY * cos(-headingRad);
}

void ConvertXYtoLatLong(f64 refLat, f64 refLong, f64 relX, f64 relY, f64 *lat, f64 *lon)
{

	f64 deltaLat = relY / R;
	f64 deltaLon = relX / (R * cos(refLat * (M_PI / 180.0)));

	*lat = refLat + (deltaLat * 180.0 / M_PI);
	*lon = refLong + (deltaLon * 180.0 / M_PI);
}

f64 CalcGpsDist(f64 refLat, f64 refLong, f64 latitude, f64 longitude)
{
	f64 refLatRad = refLat * (M_PI / 180.0);
	f64 refLongRad = refLong * (M_PI / 180.0);
	f64 latRad = latitude * (M_PI / 180.0);
	f64 lonRad = longitude * (M_PI / 180.0);

	f64 deltaLat = latRad - refLatRad;
	f64 deltaLon = lonRad - refLongRad;

	f64 a = sin(deltaLat / 2) * sin(deltaLat / 2)
	+ cos(refLatRad) * cos(latRad) * sin(deltaLon / 2)
	* sin(deltaLon / 2);
	f64 c = 2 * atan2(sqrt(a), sqrt(1 - a));

	f64 distance = R * c;

	return distance;//m
}

f64 Compute_YawRate(f64 RVyaw, f64 HVyaw){
	f64 diff_deg = RVyaw - HVyaw;
	f64 diff_rad = diff_deg * M_PI / 180.0;
	return diff_rad;
}

f64 Compute_Radius(f64 speed, f64 yaw_rate) {
	if (yaw_rate == 0) {
		return -1; // The road is straight
	}
	f64 radius = speed / yaw_rate;

	return radius;
}

f64 Calculate_Bearing(f64 lat1, f64 lat2 ,f64 lon1, f64 lon2) {
	f64 Lat1Rad = lat1* M_PI / 180.0;
	f64 Lat2Rad = lat2 * M_PI / 180.0;
	f64 lonRad = (lon2 - lon1) * M_PI / 180.0;

	f64 y = sin(lonRad) * cos(Lat2Rad);
	f64 x = cos(Lat1Rad)*sin(Lat2Rad) - sin(Lat1Rad)*cos(Lat2Rad)*cos(lonRad);
	f64 Theta = atan2(y, x);
	f64 bearing = Theta * 180.0 / M_PI;

	if (bearing < 0) bearing += 360.0;
	return bearing;
}

f64 Compute_Theta(f64 rv_heading, f64 hv_heading){
	return (rv_heading - hv_heading);
}

const c8* Classify_Zone(f64 rvRelX, f64 hvppr, f64 lat_offset, f64 laneWidth) {
	if (rvRelX >= 0) { // RV Ahead
		if (hvppr >= 0) {
			if (lat_offset <= -2.5 * laneWidth)
			return "AheadFarFarLeft";
			else if (lat_offset <= -1.5 * laneWidth)
			return "AheadFarLeft";
			else if (lat_offset <= -0.5 * laneWidth)
			return "AheadLeft";
			else if (lat_offset <= 0.5 * laneWidth)
			return "Ahead";
			else if (lat_offset < 1.5 * laneWidth)
			return "AheadRight";
			else if (lat_offset < 2.5 * laneWidth)
			return "AheadFarRight";
			else if (lat_offset >= 2.5 * laneWidth)
			return "AheadFarFarRight";
		}
		else {
			if (lat_offset <= -2.5 * laneWidth)
			return "AheadFarFarRight";
			else if (lat_offset <= -1.5 * laneWidth)
			return "AheadFarRight";
			else if (lat_offset <= -0.5 * laneWidth)
			return "AheadRight";
			else if (lat_offset <= 0.5 * laneWidth)
			return "Ahead";
			else if (lat_offset < 1.5 * laneWidth)
			return "AheadLeft";
			else if (lat_offset < 2.5 * laneWidth)
			return "AheadFarLeft";
			else if (lat_offset >= 2.5 * laneWidth)
			return "AheadFarFarLeft";
		}
	}
	else { // RV Behind
		if (hvppr >= 0) {
			if (lat_offset <= -2.5 * laneWidth)
			return "BehindFarFarLeft";
			else if (lat_offset <= -1.5 * laneWidth)
			return "BehindFarLeft";
			else if (lat_offset <= -0.5 * laneWidth)
			return "BehindLeft";
			else if (lat_offset <= 0.5 * laneWidth)
			return "Behind";
			else if (lat_offset <= 1.5 * laneWidth)
			return "BehindRight";
			else if (lat_offset <= 2.5 * laneWidth)
			return "BehindFarRight";
			else if (lat_offset >= 2.5 * laneWidth)
			return "BehindFarFarRight";
		}
		else {
			if (lat_offset <= -2.5 * laneWidth)
			return "BehindFarFarRight";
			else if (lat_offset <= -1.5 * laneWidth)
			return "BehindFarRight";
			else if (lat_offset <= -0.5 * laneWidth)
			return "BehindRight";
			else if (lat_offset <= 0.5 * laneWidth)
			return "Behind";
			else if (lat_offset <= 1.5 * laneWidth)
			return "BehindLeft";
			else if (lat_offset <= 2.5 * laneWidth)
			return "BehindFarLeft";
			else if (lat_offset >= 2.5 * laneWidth)
			return "BehindFarFarLeft";
		}
	}
	return "Undefined";
}

const c8* Classify_Direction(f64 theta)
{
	if (theta > 180.0)
	theta -= 360.0;
	else if (theta < -180.0)
	theta += 360.0;

	if (theta >= -25.0 && theta <= 25.0)
		return "Equidirectional";
	else if (theta > 25.0 && theta < 155.0)
		return "Intersecting Right";
	else if ((theta >= 155.0 && theta <= 180.0) || (theta >= -180.0 && theta <= -155.0))
		return "Reverse";
	else if (theta > -155.0 && theta < -25.0)
		return "Intersecting Left";
	else
		return "Undefined";
}

f64 AvgLateralOffset(f64 RV_lat[], f64 RV_lon[], Vehicle HV)
{
    int Ahead = 0, Behind=0;
    f64 avgLat_A = 0,avgLat_B=0;

    for (int i = 0; i < 5; i++) {
        ConvertLatLongToXY(HV.latitude, HV.longitude,HV.heading, RV_lat[i], RV_lon[i], &rvRelx, &rvRely);
     /*   hvppc_rv_dist = CalcGpsDist(latref,lonref , RV_lat[i], RV_lon[i]);
        hvppr2 = CalcGpsDist(latref,lonref , host.latitude,host.longitude);
        lat_offst =  hvppr2 - hvppc_rv_dist;
    */
        if (rvRely >= 0) {
            avgLat_A += rvRelx;
            Ahead++;
        }else{
            avgLat_B += rvRelx;
            Behind++;
        }
    }
    if (Ahead > 0) {
        return (avgLat_A/Ahead);
    }else if(Behind > 0){
        return (avgLat_B/Behind);
    }else{
        return rvRelx;
    }

}

