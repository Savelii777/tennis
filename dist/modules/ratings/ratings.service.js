"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RatingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RatingsService = RatingsService_1 = class RatingsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RatingsService_1.name);
        // Константы для расчета рейтинга
        this.K_FACTOR = 20; // Коэффициент изменения Эло
        this.NTRP_SCALE = 50; // Очков на 0.1 NTRP
    }
    /**
   * Создает дефолтный рейтинг при регистрации игрока или обновляет существующий
   */
    async createDefaultRating(userId, options) {
        const defaultRating = {
            skillPoints: options?.skillPoints || 1400,
            skillRating: options?.skillRating || 4.0,
            pointsRating: options?.pointsRating || 1000,
        };
        try {
            // Проверяем, существует ли уже рейтинг для этого пользователя
            const existingRating = await this.prisma.playerRating.findUnique({
                where: { userId },
            });
            let rating;
            if (existingRating) {
                // Если рейтинг уже существует, обновляем его
                rating = await this.prisma.playerRating.update({
                    where: { userId },
                    data: {
                        skillPoints: defaultRating.skillPoints,
                        skillRating: defaultRating.skillRating,
                        pointsRating: defaultRating.pointsRating,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                            }
                        }
                    }
                });
                this.logger.log(`Updated rating for user ${userId}: ${JSON.stringify(defaultRating)}`);
            }
            else {
                // Если рейтинга нет, создаем новый
                rating = await this.prisma.playerRating.create({
                    data: {
                        userId,
                        skillPoints: defaultRating.skillPoints,
                        skillRating: defaultRating.skillRating,
                        pointsRating: defaultRating.pointsRating,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                            }
                        }
                    }
                });
                // Записываем в историю только для новых рейтингов
                await this.createRatingHistoryEntry({
                    userId,
                    skillPointsBefore: 0,
                    skillPointsAfter: defaultRating.skillPoints,
                    pointsRatingBefore: 0,
                    pointsRatingAfter: defaultRating.pointsRating,
                    isWin: false,
                    pointsEarned: defaultRating.pointsRating,
                    reason: 'registration',
                });
                this.logger.log(`Created default rating for user ${userId}: ${JSON.stringify(defaultRating)}`);
            }
            return rating;
        }
        catch (error) {
            this.logger.error(`Failed to create/update rating for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Пересчитывает рейтинг после матча
     */
    async recalculateAfterMatch(matchResult) {
        const { winnerId, loserId, matchId } = matchResult;
        // Получаем текущие рейтинги
        const [winnerRating, loserRating] = await Promise.all([
            this.getRatingForUser(winnerId),
            this.getRatingForUser(loserId),
        ]);
        if (!winnerRating || !loserRating) {
            throw new common_1.NotFoundException('Player rating not found');
        }
        // Рассчитываем изменения для победителя
        const winnerResult = this.calculateSkillRatingChange(winnerRating.skillPoints, loserRating.skillPoints, true);
        // Рассчитываем изменения для проигравшего
        const loserResult = this.calculateSkillRatingChange(loserRating.skillPoints, winnerRating.skillPoints, false);
        // Рассчитываем очки активности
        const winnerPointsEarned = this.calculatePointsRating(winnerRating.skillPoints, loserRating.skillPoints, true);
        const loserPointsEarned = this.calculatePointsRating(loserRating.skillPoints, winnerRating.skillPoints, false);
        // Получаем текущий сезон
        const currentSeason = await this.getCurrentSeason();
        // Обновляем рейтинги в базе данных
        const [updatedWinner, updatedLoser] = await Promise.all([
            this.updatePlayerRating(winnerId, {
                skillPoints: winnerResult.newSkillPoints,
                skillRating: winnerResult.newSkillRating,
                pointsRating: winnerRating.pointsRating + winnerPointsEarned,
                wins: winnerRating.wins + 1,
            }),
            this.updatePlayerRating(loserId, {
                skillPoints: loserResult.newSkillPoints,
                skillRating: loserResult.newSkillRating,
                pointsRating: Math.max(0, loserRating.pointsRating + loserPointsEarned),
                losses: loserRating.losses + 1,
            }),
        ]);
        // Записываем историю для обоих игроков
        await Promise.all([
            this.createRatingHistoryEntry({
                userId: winnerId,
                matchId,
                seasonId: currentSeason?.id,
                skillPointsBefore: winnerRating.skillPoints,
                skillPointsAfter: winnerResult.newSkillPoints,
                pointsRatingBefore: winnerRating.pointsRating,
                pointsRatingAfter: winnerRating.pointsRating + winnerPointsEarned,
                isWin: true,
                opponentId: loserId,
                opponentSkillPoints: loserRating.skillPoints,
                pointsEarned: winnerPointsEarned,
                reason: 'match_win',
            }),
            this.createRatingHistoryEntry({
                userId: loserId,
                matchId,
                seasonId: currentSeason?.id,
                skillPointsBefore: loserRating.skillPoints,
                skillPointsAfter: loserResult.newSkillPoints,
                pointsRatingBefore: loserRating.pointsRating,
                pointsRatingAfter: Math.max(0, loserRating.pointsRating + loserPointsEarned),
                isWin: false,
                opponentId: winnerId,
                opponentSkillPoints: winnerRating.skillPoints,
                pointsEarned: loserPointsEarned,
                reason: 'match_loss',
            }),
        ]);
        this.logger.log(`Rating updated after match ${matchId}: Winner ${winnerId} (+${winnerResult.skillPointsChange}), Loser ${loserId} (${loserResult.skillPointsChange})`);
        return {
            winner: {
                ...winnerResult,
                pointsRatingChange: winnerPointsEarned,
                newPointsRating: winnerRating.pointsRating + winnerPointsEarned,
            },
            loser: {
                ...loserResult,
                pointsRatingChange: loserPointsEarned,
                newPointsRating: Math.max(0, loserRating.pointsRating + loserPointsEarned),
            },
        };
    }
    /**
     * Рассчитывает изменение skill rating по формуле Эло
     */
    calculateSkillRatingChange(playerPoints, opponentPoints, isWin) {
        // Ожидаемый результат по формуле Эло
        const expectedResult = 1 / (1 + Math.pow(10, (opponentPoints - playerPoints) / 400));
        // Фактический результат
        const actualResult = isWin ? 1 : 0;
        // Изменение очков
        const skillPointsChange = Math.round(this.K_FACTOR * (actualResult - expectedResult));
        const newSkillPoints = Math.max(800, playerPoints + skillPointsChange); // Минимум 800 очков
        // Пересчет NTRP рейтинга
        const newSkillRating = this.skillPointsToNTRP(newSkillPoints);
        return {
            skillPointsChange,
            pointsRatingChange: 0, // Будет рассчитано отдельно
            newSkillRating,
            newSkillPoints,
            newPointsRating: 0, // Будет рассчитано отдельно
        };
    }
    /**
     * Рассчитывает очки активности (P-Rating)
     */
    calculatePointsRating(playerPoints, opponentPoints, isWin) {
        if (!isWin) {
            return 3; // Участие без побед
        }
        const pointsDifference = opponentPoints - playerPoints;
        if (pointsDifference > 100) {
            return 30; // Победа над более сильным
        }
        else if (pointsDifference < -100) {
            return 10; // Победа над слабым
        }
        else {
            return 20; // Победа над равным
        }
    }
    /**
     * Конвертирует skill points в NTRP рейтинг
     */
    skillPointsToNTRP(skillPoints) {
        // Базовая формула: каждые 50 очков = 0.1 NTRP
        // 1400 очков = 4.0 NTRP
        const baseNTRP = 4.0;
        const basePoints = 1400;
        const ntrp = baseNTRP + ((skillPoints - basePoints) / this.NTRP_SCALE) * 0.1;
        // Ограничиваем диапазон 2.0 - 7.0
        return Math.max(2.0, Math.min(7.0, Math.round(ntrp * 10) / 10));
    }
    /**
     * Получает рейтинг игрока
     */
    async getRatingForUser(userId) {
        const rating = await this.prisma.playerRating.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true, // Исправлено
                        lastName: true, // Исправлено
                    }
                }
            }
        });
        if (!rating) {
            // Создаем дефолтный рейтинг если не существует
            return this.createDefaultRating(userId);
        }
        return rating;
    }
    /**
     * Обновляет рейтинг игрока
     */
    async updatePlayerRating(userId, updates) {
        return this.prisma.playerRating.update({
            where: { userId },
            data: {
                ...updates,
                lastUpdated: new Date(),
            },
        });
    }
    /**
     * Создает запись в истории рейтинга
     */
    async createRatingHistoryEntry(data) {
        return this.prisma.ratingHistory.create({ data });
    }
    /**
     * Получает текущий сезон
     */
    async getCurrentSeason() {
        return this.prisma.ratingSeason.findFirst({
            where: { isCurrent: true },
        });
    }
    /**
     * Создает новый сезон
     */
    async createSeason(data) {
        // Завершаем текущий сезон
        await this.prisma.ratingSeason.updateMany({
            where: { isCurrent: true },
            data: { isCurrent: false },
        });
        // Создаем новый сезон
        return this.prisma.ratingSeason.create({
            data: {
                ...data,
                isCurrent: true,
            },
        });
    }
    /**
     * Сбрасывает P-Rating для нового сезона
     */
    async resetPointsRatingForSeason(seasonId) {
        await this.prisma.playerRating.updateMany({
            data: {
                pointsRating: 1000,
                lastUpdated: new Date(),
            },
        });
        this.logger.log(`Points rating reset for season ${seasonId}`);
    }
    /**
     * Добавляет очки за участие в турнире
     */
    async addTournamentPoints(userId, points, reason) {
        const rating = await this.getRatingForUser(userId);
        const currentSeason = await this.getCurrentSeason();
        const updatedRating = await this.updatePlayerRating(userId, {
            skillPoints: rating.skillPoints,
            skillRating: rating.skillRating,
            pointsRating: rating.pointsRating + points,
        });
        // Записываем в историю
        await this.createRatingHistoryEntry({
            userId,
            seasonId: currentSeason?.id,
            skillPointsBefore: rating.skillPoints,
            skillPointsAfter: rating.skillPoints,
            pointsRatingBefore: rating.pointsRating,
            pointsRatingAfter: rating.pointsRating + points,
            isWin: false,
            pointsEarned: points,
            reason,
        });
        return updatedRating;
    }
    /**
     * Получает топ игроков по skill rating
     */
    async getTopPlayersBySkill(limit = 10) {
        return this.prisma.playerRating.findMany({
            take: limit,
            orderBy: { skillPoints: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true, // Исправлено
                        lastName: true, // Исправлено
                    }
                }
            }
        });
    }
    /**
     * Получает топ игроков по points rating
     */
    async getTopPlayersByPoints(limit = 10) {
        return this.prisma.playerRating.findMany({
            take: limit,
            orderBy: { pointsRating: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true, // Исправлено
                        lastName: true, // Исправлено
                    }
                }
            }
        });
    }
    /**
     * Получает детальную статистику игрока
     */
    async getPlayerStats(userId) {
        const rating = await this.getRatingForUser(userId);
        if (!rating) {
            return null;
        }
        const totalMatches = rating.wins + rating.losses;
        const winRate = totalMatches > 0 ? Math.round((rating.wins / totalMatches) * 100) : 0;
        // Получаем последний матч с правильными include
        const lastMatch = await this.prisma.ratingHistory.findFirst({
            where: {
                userId,
                matchId: { not: null }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                opponent: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true, // Исправлено
                        lastName: true, // Исправлено
                    }
                }
            }
        });
        // Отдельно получаем информацию о матче
        let matchInfo = null;
        if (lastMatch?.matchId) {
            matchInfo = await this.prisma.match.findUnique({
                where: { id: lastMatch.matchId },
                select: {
                    id: true,
                    score: true,
                }
            });
        }
        return {
            skillRating: rating.skillRating,
            skillPoints: rating.skillPoints,
            pointsRating: rating.pointsRating,
            wins: rating.wins,
            losses: rating.losses,
            winRate,
            totalMatches,
            lastMatch: lastMatch ? {
                result: lastMatch.isWin ? 'win' : 'loss',
                opponent: lastMatch.opponent ?
                    `${lastMatch.opponent.firstName} ${lastMatch.opponent.lastName || ''}`.trim() :
                    'Неизвестно',
                opponentRating: this.skillPointsToNTRP(lastMatch.opponentSkillPoints || 1400),
                score: matchInfo?.score || 'Не указан',
                date: lastMatch.createdAt,
            } : null,
        };
    }
    /**
     * Рассчитать очки силы (для публичных профилей)
     */
    async calculatePowerPoints(userId) {
        const rating = await this.getRatingForUser(userId);
        return rating.skillPoints || 1400;
    }
    /**
     * Рассчитать очки активности (для публичных профилей)
     */
    async calculateActivityPoints(userId) {
        const rating = await this.getRatingForUser(userId);
        return rating.pointsRating || 1000;
    }
};
exports.RatingsService = RatingsService;
exports.RatingsService = RatingsService = RatingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RatingsService);
