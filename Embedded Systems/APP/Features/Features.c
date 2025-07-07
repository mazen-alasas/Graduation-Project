#include "Features.h"
#include <math.h>

bsw_warning_t bs_warning = bsw_no_warning;
ima_warning_t ima_warning = ima_no_warning;
const char* warning_strings[] = {
	"No Warning",
	"Left Warning",
	"Left Advisory",
	"Right Warning",
	"Right Advisory"
};

/**************************************************  FCW  **************************************************************/
void FCW(f64 Ult_1, c8* zone, c8* direction)
{
	data.flag.fcw=0;
	if (string_compare(zone, "Ahead") && string_compare(direction, "Equidirectional"))
	{
		if (Ult_1 < SAFE_DISTANCE)
		{
			data.flag.fcw = 1;

		}else
		{
			data.flag.fcw=0;
		}
	}
}
/*************************************************  EEBL  ******************************************************************/
void EEBL(f64 Ult_1, c8* zone, c8* direction)
{
	data.flag.eebl=0;
	if (string_compare(zone, "Ahead") && string_compare(direction, "Equidirectional"))
	{
		if (Ult_1 < SAFE_DISTANCE)
		{
			data.flag.eebl = 1; // EEBL_WARNING = TRUE
		}else
		{
			data.flag.eebl=0;
		}
	}
}

/*************************************************  BSW  ******************************************************************/
bsw_warning_t BSW(f64 ULT_3,f64 ULT_4, const c8* rv_zone, const c8* rv_direction, u8 left_turn_signal, u8 right_turn_signal)
{
	data.flag.bsw=0;
	if (string_compare(rv_direction, "Equidirectional") &&
	(string_compare(rv_zone, "BehindLeft") || string_compare(rv_zone, "BehindRight")))
	{
			if (string_compare(rv_zone, "BehindLeft"))
			{
				if (left_turn_signal && ULT_4 < SAFE_DISTANCE)
				bs_warning = bsw_left_warn;
				data.flag.bsw =1;
				
			}else
			{
				data.flag.bsw=0;
			}
			if (string_compare(rv_zone, "BehindRight"))
			{
				if (right_turn_signal && ULT_3 < SAFE_DISTANCE)
				bs_warning = bsw_right_warn;
				data.flag.bsw =1;
			}else
			{
				data.flag.bsw=0;
			}
			
	}return bs_warning;
}
/**************************************************************  DNPW  **************************************************/
void DNPW(f64 ULT_1, const c8* rv_zone, const c8* rv_direction)
{
	data.flag.dnpw=0;
	if (string_compare(rv_zone, "AheadLeft") && string_compare(rv_direction, "Reverse"))
	{
		if (ULT_1 < SAFE_DISTANCE)
		{
			data.flag.dnpw = 1;
		}else
		{
			data.flag.dnpw=0;
		}
	}
}


/**************************************************  IMA  **************************************************************/
ima_warning_t IMA(f64 ULT_1, const c8* rv_zone, const c8* rv_direction)
{
	data.flag.ima=0;
	// Check for IMA Right conditions
	if (string_compare(rv_direction, "IntersectingRight") &&
	(string_compare(rv_zone, "Ahead") ||
	string_compare(rv_zone, "AheadRight") ||
	string_compare(rv_zone, "AheadFarRight") ||
	string_compare(rv_zone, "AheadFarFarRight")))
	{
		if (ULT_1 < SAFE_DISTANCE)
		{
			ima_warning = ima_right_warn;
			data.flag.ima=1; //IMA_RIGHT_WARNING
		}
		else
		{
			data.flag.ima=0;
		}
	}
	// Check for IMA Left conditions
	if (string_compare(rv_direction, "IntersectingLeft") &&
	(string_compare(rv_zone, "Ahead") ||
	string_compare(rv_zone, "AheadLeft") ||
	string_compare(rv_zone, "AheadFarLeft") ||
	string_compare(rv_zone, "AheadFarFarLeft")))
	{
		if (ULT_1 < SAFE_DISTANCE)
		{
			ima_warning = ima_left_warn;
			data.flag.ima=1; //IMA_LEFT_WARNING
		}
		else
		{
			data.flag.ima=0;
		}
	}
	return ima_warning;
}
