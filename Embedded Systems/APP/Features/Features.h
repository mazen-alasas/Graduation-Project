#include "Features.h"
#include <math.h>

/**************************************************  FCW  **************************************************************/
void FCW(f64 host_speed, f64 remote_speed, f64 lon_offset, c8* zone, c8* direction)
{
	f64 TTC;

	if (string_compare(zone, "Ahead") && string_compare(direction, "Equidirectional"))
	{
		if (host_speed > remote_speed)
		{
			TTC = lon_offset / (host_speed - remote_speed);
			if (TTC < K_TTC_THRES)
			{
				data.flag.fcw = 1;
			}
		}
	}
}