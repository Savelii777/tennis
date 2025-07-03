import { PrismaService } from '../../../../prisma/prisma.service';
import { AchievementCode } from '../../domain/enums/achievement-codes.enum';
export declare class AchievementsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserAchievements(userId: string): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        code: string;
        awardedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    hasAchievement(userId: string, code: AchievementCode): Promise<boolean>;
    awardAchievement(userId: string, code: AchievementCode, metadata?: any): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        code: string;
        awardedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
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
