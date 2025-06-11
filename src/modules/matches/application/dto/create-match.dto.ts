import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchType, MatchState } from '../../domain/enums/match.enum';

export class CreateMatchDto {
  @ApiProperty({ enum: MatchType, description: 'Type of match' })
  @IsEnum(MatchType)
  type: MatchType;

  @ApiProperty({ enum: MatchState, default: MatchState.DRAFT, description: 'State of match' })
  @IsEnum(MatchState)
  @IsOptional()
  state?: MatchState = MatchState.DRAFT;

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
}