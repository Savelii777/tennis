import { ApiProperty } from '@nestjs/swagger';

export class ProfileStatisticsDto {
  @ApiProperty()
  matchesPlayed: number;
  
  @ApiProperty()
  matchWins: number;
  
  @ApiProperty()
  matchLosses: number;
  
  @ApiProperty()
  tournamentsPlayed: number;
  
  @ApiProperty()
  tournamentsWon: number;
  
  @ApiProperty()
  winRate: string;
  
  @ApiProperty()
  ratingPoints: number;
  
  @ApiProperty({ nullable: true })
  lastActivity?: Date;
}