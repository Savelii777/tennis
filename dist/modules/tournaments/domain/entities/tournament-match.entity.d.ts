import { MatchStatus } from '../enums/tournament.enum';
export declare class TournamentMatchEntity {
    id: number;
    tournamentId: number;
    round?: number;
    group?: string;
    playerAId: number;
    playerBId: number;
    score?: string;
    winnerId?: number;
    status: MatchStatus;
    court?: string;
    scheduledAt?: Date;
    confirmedBy: number[];
    isThirdPlaceMatch?: boolean;
    createdAt: Date;
    updatedAt: Date;
    constructor(partial: Partial<TournamentMatchEntity>);
}
