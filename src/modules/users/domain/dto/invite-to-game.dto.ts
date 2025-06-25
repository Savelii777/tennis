import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class InviteToGameDto {
  @ApiProperty({ description: 'Дата и время игры', example: '2023-07-15T14:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  dateTime: string;

  @ApiProperty({ description: 'Место проведения', example: 'Теннисный клуб "Чемпион"' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ description: 'Дополнительная информация', example: 'Возьми с собой воду, там нет автомата', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}