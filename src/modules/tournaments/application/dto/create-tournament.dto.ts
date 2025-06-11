import { IsEnum, IsString, IsBoolean, IsNumber, IsDate, IsOptional, IsObject, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentType } from '../../domain/enums/tournament.enum';
import { Type } from 'class-transformer';

export class CreateTournamentDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TournamentType })
  @IsEnum(TournamentType)
  type: TournamentType;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  formatDetails?: any;

  @ApiProperty()
  @IsNumber()
  @Min(2)
  minPlayers: number;

  @ApiProperty()
  @IsNumber()
  @Max(128)
  maxPlayers: number;

  @ApiProperty()
  @IsBoolean()
  isRanked: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  locationId?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  locationName?: string;
}