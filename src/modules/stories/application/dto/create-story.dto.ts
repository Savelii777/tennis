import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { MediaType } from '@prisma/client';

export class CreateStoryDto {
  @ApiProperty({ description: 'ID файла в Telegram', example: 'AgACAgIAAxkBAAIJ...' })
  @IsString()
  telegramFileId: string;

  @ApiProperty({ 
    description: 'Тип медиафайла',
    enum: MediaType,
    example: MediaType.image // Исправлено с IMAGE на image
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({ description: 'Подпись к сторис', example: 'Отличный матч сегодня!' })
  @IsString()
  @IsOptional()
  caption?: string;
}