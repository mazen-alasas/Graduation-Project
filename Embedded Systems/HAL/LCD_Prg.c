
#define  F_CPU   8000000
#include <util/delay.h>
#include "StdTypes.h"

#include "DIO_Int.h"
#include "String.h"
#include "LCD_Int.h"
#include "LCD_Cfg.h"
#include "LCD_Private.h"



#if LCD_MODE==_8_BIT
void WriteIns(u8 ins)
{
	DIO_WritePin(RS,LOW);
	DIO_WritePort(LCD_PORT,ins);
	DIO_WritePin(EN,HIGH);
	_delay_ms(1);
	DIO_WritePin(EN,LOW);
	_delay_ms(1);
}

void WriteData(u8 data)
{
	DIO_WritePin(RS,HIGH);
	DIO_WritePort(LCD_PORT,data);
	DIO_WritePin(EN,HIGH);
	_delay_ms(1);
	DIO_WritePin(EN,LOW);
	_delay_ms(1);
}

void LCD_Init(void)
{
	_delay_ms(50);
	
	WriteIns(_LCD_8BIT_MODE_2_LINE);
	WriteIns(_LCD_CURSOR_OFF_DISPLAY_ON);//0x0e,0x0f
	WriteIns(_LCD_CLEAR);//clear screen
	_delay_ms(1);
	WriteIns(_LCD_ENTRY_MODE);
}
#elif LCD_MODE==_4_BIT

void WriteIns(u8 ins)
{
	DIO_WritePin(RS,LOW);
	DIO_WritePin(D7,GET_BIT(ins,7));
	DIO_WritePin(D6,GET_BIT(ins,6));
	DIO_WritePin(D5,GET_BIT(ins,5));
	DIO_WritePin(D4,GET_BIT(ins,4));
	DIO_WritePin(EN,HIGH);
	_delay_ms(1);
	DIO_WritePin(EN,LOW);
	_delay_ms(1);
	
	DIO_WritePin(D7,GET_BIT(ins,3));
	DIO_WritePin(D6,GET_BIT(ins,2));
	DIO_WritePin(D5,GET_BIT(ins,1));
	DIO_WritePin(D4,GET_BIT(ins,0));
	DIO_WritePin(EN,HIGH);
	_delay_ms(1);
	DIO_WritePin(EN,LOW);
	_delay_ms(1);
}

void WriteData(u8 data)
{
	DIO_WritePin(RS,HIGH);
	DIO_WritePin(D7,GET_BIT(data,7));
	DIO_WritePin(D6,GET_BIT(data,6));
	DIO_WritePin(D5,GET_BIT(data,5));
	DIO_WritePin(D4,GET_BIT(data,4));
	DIO_WritePin(EN,HIGH);
	_delay_ms(1);
	DIO_WritePin(EN,LOW);
	_delay_ms(1);
	
	DIO_WritePin(D7,GET_BIT(data,3));
	DIO_WritePin(D6,GET_BIT(data,2));
	DIO_WritePin(D5,GET_BIT(data,1));
	DIO_WritePin(D4,GET_BIT(data,0));
	DIO_WritePin(EN,HIGH);
	_delay_ms(1);
	DIO_WritePin(EN,LOW);
	_delay_ms(1);
}

void LCD_Init(void)
{
	_delay_ms(50);
	WriteIns(_LCD_RETURN_HOME);
	WriteIns(_LCD_4BIT_MODE_2_LINE);
	WriteIns(_LCD_CURSOR_OFF_DISPLAY_ON);      //0x0e,0x0f
	WriteIns(_LCD_CLEAR);                     //clear screen
	_delay_ms(1);
	WriteIns(_LCD_ENTRY_MODE);
}

#endif



void LCD_WriteString(c8*str)
{
	u8 i;
	for(i=0;str[i];i++)
	{
		WriteData(str[i]);
	}
}

void LCD_WriteChar(u8 ch)
{
	WriteData(ch);
}

void LCD_WriteNumber(s32 num)
{
	c8 str[10]={0},i;
	if(num==0)
	{
		LCD_WriteChar('0');
	}
	NUM_tostring(str,num);
	for (i=0;i<str[i];i++)
	{
		WriteData(str[i]);
	}
}

void LCD_WriteNumber8(u8 num)
{
	c8 str[3]={0},i;
	if(num==0)
	{
		LCD_WriteChar('0');
	}
	NUM_tostring(str,num);
	for (i=0;str[i];i++)
	{
		WriteData(str[i]);
	}
}





/* line 0:1 cell 0:15*/
void LCD_SetCursor(u8 line ,u8 cell)
{
	if (line==0)
	{
		WriteIns(cell|_LCD_DDRAM_START);
	}
	if(line==1)
	{
		WriteIns((cell+ _LCD_CGRAM_START ) | _LCD_DDRAM_START);
	}
	
}

void LCD_WriteStringCursor(u8 line ,u8 cell,c8*str)
{
	
	LCD_SetCursor(line,cell);
	LCD_WriteString(str);
	
}

void LCD_CleanCursor(u8 line ,u8 cell,u8 NofCells)
{
	u8 i;
	LCD_SetCursor(line,cell);
	for(i=0;i<NofCells;i++)
	{
		LCD_WriteChar(' ');
	}
}


void LCD_CustomChar(u8 addres,u8*pattern)
{
	u8 i;
	WriteIns(_LCD_CGRAM_START | addres);
	for(i=0;i<8;i++)
	{
		WriteData(pattern[i]);
	}
	WriteIns(_LCD_DDRAM_START);
}

void LCD_Clear(void)
{
	WriteIns(_LCD_CLEAR);//clear screen
	_delay_ms(1);
}