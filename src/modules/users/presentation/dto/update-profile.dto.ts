import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { SportType } from '../../domain/enums/sport-type.enum';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;
  
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;
  
  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
  
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;
  
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  countryCode?: string;
  
  @ApiPropertyOptional({ enum: SportType })
  @IsEnum(SportType)
  @IsOptional()
  sportType?: SportType;
  
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  ntrpRating?: number;
  
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublicProfile?: boolean;
}