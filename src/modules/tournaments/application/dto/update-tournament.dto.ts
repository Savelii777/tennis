import { IsEnum, IsString, IsBoolean, IsNumber, IsDate, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentType, TournamentStatus } from '../../domain/enums/tournament.enum';
import { Type } from 'class-transformer';

export class UpdateTournamentDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TournamentType })
  @IsEnum(TournamentType)
  @IsOptional()
  type?: TournamentType;

  @ApiPropertyOptional({ enum: TournamentStatus })
  @IsEnum(TournamentStatus)
  @IsOptional()
  status?: TournamentStatus;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  formatDetails?: any;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isRanked?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  locationId?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  locationName?: string;
}