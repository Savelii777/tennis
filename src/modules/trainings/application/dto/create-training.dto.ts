import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt, IsDate, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrainingType, CourtSurface, PaymentType } from '../../domain/enums/training-type.enum';
import { Type, Transform } from 'class-transformer';

export class CreateTrainingDto {
  @ApiProperty({ description: 'Название тренировки' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Описание тренировки' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Место проведения' })
  @IsString()
  @IsOptional()
  locationName?: string;

  @ApiPropertyOptional({ enum: CourtSurface, description: 'Тип покрытия корта' })
  @IsEnum(CourtSurface)
  @IsOptional()
  courtSurface?: CourtSurface;

  @ApiPropertyOptional({ description: 'Минимальный NTRP уровень' })
  @IsNumber()
  @Min(1)
  @Max(7)
  @IsOptional()
  minLevel?: number;

  @ApiPropertyOptional({ description: 'Максимальный NTRP уровень' })
  @IsNumber()
  @Min(1)
  @Max(7)
  @IsOptional()
  maxLevel?: number;

  @ApiProperty({ description: 'Максимальное количество мест' })
  @IsInt()
  @Min(2)
  maxSlots: number;

  @ApiProperty({ enum: PaymentType, description: 'Тип оплаты' })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiPropertyOptional({ description: 'Цена за человека (если фиксированная цена)' })
  @IsNumber()
  @IsOptional()
  pricePerPerson?: number;

  @ApiProperty({ description: 'Дата и время начала тренировки', example: '2025-06-11T14:41:39.058Z' })
  @Type(() => Date)
  @Transform(({ value }) => value ? new Date(value) : null)
  @IsDate()
  @IsNotEmpty()
  dateTime: Date;

  @ApiProperty({ description: 'Дата и время окончания тренировки', example: '2025-06-11T16:41:39.058Z' })
  @Type(() => Date)
  @Transform(({ value }) => value ? new Date(value) : null)
  @IsDate()
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({ enum: TrainingType, description: 'Тип тренировки' })
  @IsEnum(TrainingType)
  trainingType: TrainingType;
}