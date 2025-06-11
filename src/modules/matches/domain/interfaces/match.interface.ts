import { MatchType, MatchState } from '../enums/match.enum';

export interface IMatch {
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
}