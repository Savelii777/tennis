import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt, IsDate, IsNumber, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestType, PaymentType, RatingType } from '../../domain/enums/request-type.enum';
import { MatchType } from '@prisma/client';
import { Type, Transform } from 'class-transformer';

export class CreateRequestDto {
  @ApiProperty({ enum: RequestType, description: 'Тип заявки' })
  @IsEnum(RequestType)
  @IsNotEmpty()
  type: RequestType;

  @ApiProperty({ description: 'Название заявки' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Описание заявки' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Место проведения' })
  @IsString()
  @IsOptional()
  locationName?: string;

  @ApiProperty({ description: 'Максимальное количество участников' })
  @IsInt()
  @Min(2)
  maxPlayers: number;

  @ApiProperty({ enum: MatchType, description: 'Режим игры' })
  @IsEnum(MatchType)
  gameMode: MatchType;

  @ApiProperty({ description: 'Дата и время проведения', example: '2025-06-11T14:41:39.058Z' })
  @Type(() => Date)
  @Transform(({ value }) => value ? new Date(value) : null)
  @IsDate()
  @IsNotEmpty()
  dateTime: Date;

  @ApiProperty({ enum: PaymentType, description: 'Тип оплаты' })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({ enum: RatingType, description: 'Влияет на рейтинг' })
  @IsEnum(RatingType)
  ratingType: RatingType;

  @ApiPropertyOptional({ description: 'Дополнительная информация о формате' })
  @IsObject()
  @IsOptional()
  formatInfo?: Record<string, any>;
}