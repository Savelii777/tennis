import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MatchState } from '../../domain/enums/match.enum';

export class UpdateMatchDto {
  @ApiPropertyOptional({ enum: MatchState, description: 'State of match' })
  @IsEnum(MatchState)
  @IsOptional()
  state?: MatchState;

  @ApiPropertyOptional({ type: Number, description: 'Player 1 ID' })
  @IsNumber()
  @IsOptional()
  player1Id?: number;

  @ApiPropertyOptional({ type: Number, description: 'Player 2 ID' })
  @IsNumber()
  @IsOptional()
  player2Id?: number;

  @ApiPropertyOptional({ type: Number, description: 'Optional ID (can be used for doubles partner)' })
  @IsNumber()
  @IsOptional()
  optionalId?: number;

  @ApiPropertyOptional({ description: 'Match score' })
  @IsString()
  @IsOptional()
  score?: string;
}