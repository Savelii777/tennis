import { IsString, IsNumber, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID пользователя' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Тип уведомления' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Текст уведомления' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Дополнительные данные', required: false })
  @IsOptional()
  @IsObject()
  payload?: any;

  @ApiProperty({ description: 'Отправить через Telegram', required: false })
  @IsOptional()
  @IsBoolean()
  sendTelegram?: boolean;

  data?: any;

}