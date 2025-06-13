import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { SportType } from '../../domain/enums/sport-type.enum';

export class ProfileStepOneDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName?: string;
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  lastName?: string;
  
  @ApiProperty()
  @IsString()
  @IsOptional()
  city?: string;
  
  @ApiProperty()
  @IsString()
  @IsOptional()
  preferredCourt?: string;
  
  @ApiProperty({ enum: ['RIGHT', 'LEFT'] })
  @IsEnum(['RIGHT', 'LEFT'])
  @IsOptional()
  dominantHand?: string;
  
  @ApiProperty({ type: [String], enum: ['MORNING', 'DAY', 'EVENING', 'NIGHT'] })
  @IsArray()
  @IsOptional()
  preferredPlayTime?: string[];
  
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  playsInTournaments?: boolean;
  
  @ApiProperty({ enum: ['ONE', 'TWO_THREE', 'FOUR_PLUS'] })
  @IsEnum(['ONE', 'TWO_THREE', 'FOUR_PLUS'])
  @IsOptional()
  weeklyPlayFrequency?: string;
  
  @ApiProperty({ enum: SportType })
  @IsEnum(SportType)
  @IsOptional()
  sportType?: SportType;
}