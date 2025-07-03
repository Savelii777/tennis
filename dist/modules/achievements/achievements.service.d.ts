import { PrismaService } from '../../prisma/prisma.service';
export declare class AchievementsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Проверить и присвоить достижения пользователю
     */
    checkAndAwardAchievements(userId: number): Promise<string[]>;
    /**
     * Получить все достижения пользователя
     */
    getUserAchievements(userId: number): Promise<any[]>;
    /**
     * Проверить достижения после завершения матча
     */
    checkMatchAchievements(userId: number, isWin: boolean): Promise<string[]>;
    /**
     * Проверить достижения после участия в турнире
     */
    checkTournamentAchievements(userId: number, isWin: boolean): Promise<string[]>;
    /**
     * Получить информацию о прогрессе к достижениям
     */
    getAchievementProgress(userId: number): Promise<any>;
}
