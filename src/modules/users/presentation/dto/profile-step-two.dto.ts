import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ProfileStepTwoDto {
  @ApiProperty({ enum: ['ONE_HANDED', 'TWO_HANDED'] })
  @IsEnum(['ONE_HANDED', 'TWO_HANDED'])
  @IsOptional()
  backhandType?: string;
  
  @ApiProperty({ enum: ['HARD', 'CLAY', 'GRASS', 'CARPET'] })
  @IsEnum(['HARD', 'CLAY', 'GRASS', 'CARPET'])
  @IsOptional()
  preferredSurface?: string;
  
  @ApiProperty({ enum: ['UNIVERSAL', 'DEFENSIVE', 'AGGRESSIVE', 'NET_PLAYER', 'BASIC'] })
  @IsEnum(['UNIVERSAL', 'DEFENSIVE', 'AGGRESSIVE', 'NET_PLAYER', 'BASIC'])
  @IsOptional()
  playingStyle?: string;
  
  @ApiProperty({ enum: ['SERVE', 'FOREHAND', 'BACKHAND', 'VOLLEY', 'SMASH'] })
  @IsEnum(['SERVE', 'FOREHAND', 'BACKHAND', 'VOLLEY', 'SMASH'])
  @IsOptional()
  favoriteShot?: string;
  
  @ApiProperty()
  @IsString()
  @IsOptional()
  racket?: string;
  
  @ApiProperty({ enum: ['ANY', 'MEN', 'WOMEN', 'SAME_LEVEL', 'STRONGER', 'WEAKER'] })
  @IsEnum(['ANY', 'MEN', 'WOMEN', 'SAME_LEVEL', 'STRONGER', 'WEAKER'])
  @IsOptional()
  opponentPreference?: string;
  
  @ApiProperty({ enum: ['BEGINNER', 'AMATEUR', 'CONFIDENT', 'TOURNAMENT', 'SEMI_PRO'] })
  @IsEnum(['BEGINNER', 'AMATEUR', 'CONFIDENT', 'TOURNAMENT', 'SEMI_PRO'])
  @IsOptional()
  selfAssessedLevel?: string;
}