import { PrismaService } from '../../../../prisma/prisma.service';
import { AchievementCode } from '../../domain/enums/achievement-codes.enum';
export declare class AchievementsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserAchievements(userId: string): Promise<import(".prisma/client").UserAchievement[]>;
    hasAchievement(userId: string, code: AchievementCode): Promise<boolean>;
    awardAchievement(userId: string, code: AchievementCode, metadata?: any): Promise<import(".prisma/client").UserAchievement>;
    getUserStats(userId: string): Promise<{
        matchesPlayed: number;
        matchWins: number;
        tournamentsPlayed: number;
        tournamentsWon: number;
        lastActivity: Date | null | undefined;
        createdAt: Date;
    } | null>;
    getWinningStreak(userId: string): Promise<number>;
    getReferralsCount(userId: string): Promise<number>;
}
