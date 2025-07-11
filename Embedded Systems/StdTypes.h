
#ifndef STDTYPES_H_
#define STDTYPES_H_

typedef unsigned char   u8;
typedef signed char     s8;
typedef char            c8;

typedef unsigned short  u16;
typedef signed short    s16;

typedef unsigned long   u32;
typedef signed long     s32;

typedef float           f32;
typedef double          f64;

#define  Max_u8  255
#define  Max_s8  127
#define  Min_u8   0
#define  Min_s8  -128

#define  Nullptr ((void*)0)
#define  NULL     0

typedef enum
{
	False=0x55,
	True=0xAA
}bool_t;


typedef enum 
{
	OK,
	NOK,
	INPROGRESS
}Return_t;

#define SET_BIT(value,bit)   (value=value|(1<<bit))
#define CLR_BIT(value,bit)   (value=value&~(1<<bit))
#define GET_BIT(value,bit)   ((value>>bit)&1)
#define TOG_BIT(value,bit)   (value=value^(1<<bit))



#endif /* STDTYPES_H_ */
