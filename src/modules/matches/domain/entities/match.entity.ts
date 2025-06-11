import { MatchType, MatchState } from '../enums/match.enum';

export class MatchEntity {
  id: number;
  creatorId: number;
  player1Id?: number;
  player2Id?: number;
  optionalId?: number;
  type: MatchType;
  state: MatchState;
  score?: string;
  createdAt: Date;
  updatedAt: Date;
  
  constructor(partial: Partial<MatchEntity>) {
    Object.assign(this, partial);
  }
}