import { PrismaService } from '../../../../prisma/prisma.service';
export declare enum AchievementCode {
    FIRST_STEP = "first_step",
    FIRST_MATCH = "first_match",
    WARMUP = "warmup",// 5 матчей
    IN_RHYTHM = "in_rhythm",// 10 матчей
    REAL_PLAYER = "real_player",// 50 матчей
    FIRST_SUCCESS = "first_success",
    CONFIDENCE_GROWS = "confidence_grows",// 5 побед
    STABLE_WINNER = "stable_winner",// 15 побед
    WINNING_STREAK = "winning_streak"
}
export interface AchievementDefinition {
    code: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}
export declare class AchievementsService {
    private readonly prisma;
    private readonly logger;
    private readonly definitions;
    constructor(prisma: PrismaService);
    checkAndAwardAchievements(userId: string, eventType: string): Promise<string[]>;
    getAllDefinitions(): Promise<AchievementDefinition[]>;
    private checkRegistrationAchievements;
    private checkMatchAchievements;
    private checkVictoryAchievements;
    private hasAchievement;
    private awardAchievement;
    private getUserStats;
    private getWinningStreak;
    getUserAchievements(userId: string): Promise<any[]>;
}
