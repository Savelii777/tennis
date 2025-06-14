import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MediaType } from '../../domain/enums/media-type.enum';

export class CreateStoryDto {
  @ApiProperty({ description: 'Telegram file ID' })
  @IsString()
  @IsNotEmpty()
  telegramFileId: string;

  @ApiProperty({ enum: MediaType, description: 'Тип медиа файла' })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({ description: 'Telegram file path', required: false })
  @IsString()
  @IsOptional()
  telegramFilePath?: string;
}