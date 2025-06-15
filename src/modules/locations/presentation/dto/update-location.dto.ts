import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsPositive } from 'class-validator';

export class UpdateLocationDto {
  @ApiPropertyOptional({ 
    description: 'Код страны (ISO alpha-2)',
    example: 'RU'
  })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ 
    description: 'ID города',
    example: 1
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  cityId?: number;

  @ApiPropertyOptional({ 
    description: 'ID вида спорта',
    example: 1
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  sportId?: number;
}