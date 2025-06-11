import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SportType {
  TENNIS = 'TENNIS',
  PADEL = 'PADEL'
}

export class UserProfileDto {
  @ApiProperty()
  @IsString()
  username: string = '';

  @ApiProperty()
  @IsString()
  firstName: string = '';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ enum: SportType, default: SportType.TENNIS })
  @IsEnum(SportType)
  sportType: SportType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ntrpRating?: number;

  @ApiProperty()
  @IsNumber()
  ratingPoints: number;

  @ApiProperty()
  @IsNumber()
  matchesPlayed: number;

  @ApiProperty()
  @IsNumber()
  matchWins: number;

  @ApiProperty()
  @IsNumber()
  matchLosses: number;

  @ApiProperty()
  @IsNumber()
  tournamentsPlayed: number;

  @ApiProperty()
  @IsNumber()
  tournamentsWon: number;

  @ApiPropertyOptional()
  @IsOptional()
  achievements?: Record<string, any>;

  @ApiProperty()
  @IsBoolean()
  isPublicProfile: boolean = true;
}