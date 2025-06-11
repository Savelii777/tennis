import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordScoreDto {
  @ApiProperty({ description: 'Match score (e.g., "6-4, 7-5")' })
  @IsString()
  @IsNotEmpty()
  score: string;
}