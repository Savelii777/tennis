import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordTournamentMatchDto {
  @ApiProperty()
  @IsString()
  score: string;

  @ApiProperty()
  @IsNumber()
  winnerId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comments?: string;
}