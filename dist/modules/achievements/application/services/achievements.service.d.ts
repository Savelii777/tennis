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
    WINNING_STREAK = "winning_streak",// 5 побед подряд
    TOURNAMENT_WINNER = "tournament_winner",
    BRACKET_MASTER = "bracket_master",
    GROUP_CHAMPION = "group_champion",
    LEAGUE_MASTER = "league_master",
    SPEED_DEMON = "speed_demon",
    CROWD_PLEASER = "crowd_pleaser",
    TOURNAMENT_DOMINATOR = "tournament_dominator",
    RANKED_CHAMPION = "ranked_champion",
    TOURNAMENT_FINALIST = "tournament_finalist",
    TOURNAMENT_MEDALIST = "tournament_medalist",
    TOURNAMENT_STREAK_3 = "tournament_streak_3",
    TOURNAMENT_STREAK_5 = "tournament_streak_5",
    TOURNAMENT_LEGEND = "tournament_legend",
    MONTHLY_CHAMPION = "monthly_champion",
    MONTHLY_DOMINATOR = "monthly_dominator"
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
    /**
     * Проверяем и присваиваем отдельное достижение
     */
    checkAndAwardSingleAchievement(userId: string, achievementCode: string, metadata?: any): Promise<boolean>;
}
