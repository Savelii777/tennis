import { PrismaService } from '../../prisma/prisma.service';
export interface MatchResult {
    winnerId: number;
    loserId: number;
    matchId: number;
    score?: string;
    isRanked?: boolean;
}
export interface RatingCalculationResult {
    skillPointsChange: number;
    pointsRatingChange: number;
    newSkillRating: number;
    newSkillPoints: number;
    newPointsRating: number;
}
export declare class RatingsService {
    private readonly prisma;
    private readonly logger;
    private readonly K_FACTOR;
    private readonly NTRP_SCALE;
    constructor(prisma: PrismaService);
    /**
   * Создает дефолтный рейтинг при регистрации игрока или обновляет существующий
   */
    createDefaultRating(userId: number, options?: {
        skillPoints?: number;
        skillRating?: number;
        pointsRating?: number;
    }): Promise<any>;
    /**
     * Пересчитывает рейтинг после матча
     */
    recalculateAfterMatch(matchResult: MatchResult): Promise<{
        winner: RatingCalculationResult;
        loser: RatingCalculationResult;
    }>;
    /**
     * Рассчитывает изменение skill rating по формуле Эло
     */
    private calculateSkillRatingChange;
    /**
     * Рассчитывает очки активности (P-Rating)
     */
    private calculatePointsRating;
    /**
     * Конвертирует skill points в NTRP рейтинг
     */
    private skillPointsToNTRP;
    /**
     * Получает рейтинг игрока
     */
    getRatingForUser(userId: number): Promise<any>;
    /**
     * Обновляет рейтинг игрока
     */
    private updatePlayerRating;
    /**
     * Создает запись в истории рейтинга
     */
    private createRatingHistoryEntry;
    /**
     * Получает текущий сезон
     */
    getCurrentSeason(): Promise<any>;
    /**
     * Создает новый сезон
     */
    createSeason(data: {
        title: string;
        startDate: Date;
        endDate: Date;
        description?: string;
    }): Promise<any>;
    /**
     * Сбрасывает P-Rating для нового сезона
     */
    resetPointsRatingForSeason(seasonId: number): Promise<void>;
    /**
     * Добавляет очки за участие в турнире
     */
    addTournamentPoints(userId: number, points: number, reason: string): Promise<any>;
    /**
     * Получает топ игроков по skill rating
     */
    getTopPlayersBySkill(limit?: number): Promise<any[]>;
    /**
     * Получает топ игроков по points rating
     */
    getTopPlayersByPoints(limit?: number): Promise<any[]>;
    /**
     * Получает детальную статистику игрока
     */
    getPlayerStats(userId: number): Promise<any>;
    /**
     * Рассчитать очки силы (для публичных профилей)
     */
    calculatePowerPoints(userId: number): Promise<number>;
    /**
     * Рассчитать очки активности (для публичных профилей)
     */
    calculateActivityPoints(userId: number): Promise<number>;
}
