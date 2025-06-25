import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({ description: 'Код страны', example: 'RU', required: false })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ description: 'ID города', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  cityId?: number;

  @ApiProperty({ description: 'ID вида спорта', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  sportId?: number;
}