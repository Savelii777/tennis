import { RatingsService, MatchResult } from './ratings.service';
export declare class RatingsController {
    private readonly ratingsService;
    constructor(ratingsService: RatingsService);
    getPlayerRating(userId: number): Promise<any>;
    getPlayerStats(userId: number): Promise<any>;
    getSkillLeaderboard(limit?: string): Promise<any[]>;
    getPointsLeaderboard(limit?: string): Promise<any[]>;
    recalculateRating(matchResult: MatchResult): Promise<{
        winner: import("./ratings.service").RatingCalculationResult;
        loser: import("./ratings.service").RatingCalculationResult;
    }>;
    addTournamentPoints(data: {
        userId: number;
        points: number;
        reason: string;
    }): Promise<any>;
    createSeason(data: {
        title: string;
        startDate: string;
        endDate: string;
        description?: string;
    }): Promise<any>;
    resetPointsRating(seasonId: number): Promise<{
        message: string;
    }>;
    getCurrentSeason(): Promise<any>;
}
