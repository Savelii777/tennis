import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateCaseDto {
  @ApiProperty({ description: 'Название кейса', example: 'Обычный кейс' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Описание кейса', example: 'Кейс с базовыми призами' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Цена в теннисных мячах', example: 100 })
  @IsNumber()
  @Min(1)
  priceBalls: number;

  @ApiPropertyOptional({ description: 'URL изображения кейса' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Активен ли кейс', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCaseDto {
  @ApiPropertyOptional({ description: 'Название кейса' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Описание кейса' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Цена в теннисных мячах' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  priceBalls?: number;

  @ApiPropertyOptional({ description: 'URL изображения кейса' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Активен ли кейс' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}