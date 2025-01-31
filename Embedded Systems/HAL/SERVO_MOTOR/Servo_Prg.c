#include "Servo_Int.h"

void Servo_Init(void) {
	// Initialize Timer1 in Fast PWM mode with ICR1 as TOP
	Timer1_Init(TIMER1_FASTPWM_ICR_TOP_MODE, TIMER1_SCALER_8);

	// Set TOP value for 20ms period (50Hz frequency)
	TIMER1_ICR_set(19999);

	// Configure OC1A pin for PWM output (non-inverting mode)
	Timer1_OCRA1Mode(OCRA_NON_INVERTING);

	// Set initial servo angle to 0 degrees (1ms pulse)
	TIMER1_OCRA_set(SERVO_MIN_PULSE);
}

void Servo_SetAngle(u8 angle) {
	if (angle > 180) {
		angle = 180;  // Limit angle to max 180 degrees
	}

	// Map angle (0-180) to pulse width (1000-2000 ticks)
	u16 pulse_width = SERVO_MIN_PULSE + ((u32)(SERVO_MAX_PULSE - SERVO_MIN_PULSE) * angle) / 180;
	TIMER1_OCRA_set(pulse_width);
}