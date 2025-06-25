import { MatchType, MatchState } from '../../domain/enums/match.enum';
export declare class CreateMatchDto {
    type: MatchType;
    state?: MatchState;
    player1Id?: number;
    player2Id?: number;
    optionalId?: number;
    location?: string;
    matchDate?: Date;
    description?: string;
}
