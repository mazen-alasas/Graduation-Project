
#ifndef LCD_INT_H_
#define LCD_INT_H_

#define _LCD_CLEAR                      0x01
#define _LCD_RETURN_HOME                0x02
#define _LCD_ENTRY_MODE                 0x06
#define _LCD_CURSOR_OFF_DISPLAY_ON      0x0C
#define _LCD_CURSOR_OFF_DISPLAY_OFF     0x08
#define _LCD_CURSOR_ON_BLINK_ON         0x0F
#define _LCD_CURSOR_ON_BLINK_OFF        0x0E
#define _LCD_DISPLAY_SHIFT_RIGHT        0x1C
#define _LCD_DISPLAY_SHIFT_LEFT         0x18
#define _LCD_8BIT_MODE_2_LINE           0x38
#define _LCD_4BIT_MODE_2_LINE           0x28
#define _LCD_CGRAM_START                0x40
#define _LCD_DDRAM_START                0x80

void LCD_Init(void);
void LCD_WriteString(c8*str);
void WriteData(u8 data);
void LCD_WriteNumber8(u8 num);
void LCD_WriteChar(u8 ch);
void LCD_WriteNumber(s32 num);

void LCD_CleanCursor(u8 line ,u8 cell,u8 NofCells);
void LCD_WriteStringCursor(u8 line ,u8 cell,c8*str);
void LCD_CustomChar(u8 addres,u8*pattern);
void LCD_Clear(void);
/* line 0:1 cell 0:15*/
void LCD_SetCursor(u8 line ,u8 cell);


/* move on LCD*/



#endif /* LCD_INT_H_ */