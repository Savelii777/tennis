import { MatchState } from '../../domain/enums/match.enum';
export declare class UpdateMatchDto {
    state?: MatchState;
    player1Id?: number;
    player2Id?: number;
    optionalId?: number;
    score?: string;
}
