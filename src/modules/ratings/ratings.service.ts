import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);
  
  // Константы для расчета рейтинга
  private readonly K_FACTOR = 20; // Коэффициент изменения Эло
  private readonly NTRP_SCALE = 50; // Очков на 0.1 NTRP
  
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создает дефолтный рейтинг при регистрации игрока
   */
  async createDefaultRating(userId: number, options?: {
    skillPoints?: number;
    skillRating?: number;
    pointsRating?: number;
  }): Promise<any> {
    const defaultRating = {
      skillPoints: options?.skillPoints || 1400,
      skillRating: options?.skillRating || 4.0,
      pointsRating: options?.pointsRating || 1000,
    };

    try {
      const rating = await this.prisma.playerRating.create({
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
              firstName: true, // Исправлено
              lastName: true,  // Исправлено
            }
          }
        }
      });

      // Записываем в историю
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
      return rating;

    } catch (error) {
      this.logger.error(`Failed to create default rating for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Пересчитывает рейтинг после матча
   */
  async recalculateAfterMatch(matchResult: MatchResult): Promise<{
    winner: RatingCalculationResult;
    loser: RatingCalculationResult;
  }> {
    const { winnerId, loserId, matchId } = matchResult;

    // Получаем текущие рейтинги
    const [winnerRating, loserRating] = await Promise.all([
      this.getRatingForUser(winnerId),
      this.getRatingForUser(loserId),
    ]);

    if (!winnerRating || !loserRating) {
      throw new NotFoundException('Player rating not found');
    }

    // Рассчитываем изменения для победителя
    const winnerResult = this.calculateSkillRatingChange(
      winnerRating.skillPoints,
      loserRating.skillPoints,
      true
    );

    // Рассчитываем изменения для проигравшего
    const loserResult = this.calculateSkillRatingChange(
      loserRating.skillPoints,
      winnerRating.skillPoints,
      false
    );

    // Рассчитываем очки активности
    const winnerPointsEarned = this.calculatePointsRating(
      winnerRating.skillPoints,
      loserRating.skillPoints,
      true
    );

    const loserPointsEarned = this.calculatePointsRating(
      loserRating.skillPoints,
      winnerRating.skillPoints,
      false
    );

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
  private calculateSkillRatingChange(
    playerPoints: number,
    opponentPoints: number,
    isWin: boolean
  ): RatingCalculationResult {
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
  private calculatePointsRating(
    playerPoints: number,
    opponentPoints: number,
    isWin: boolean
  ): number {
    if (!isWin) {
      return 3; // Участие без побед
    }

    const pointsDifference = opponentPoints - playerPoints;
    
    if (pointsDifference > 100) {
      return 30; // Победа над более сильным
    } else if (pointsDifference < -100) {
      return 10; // Победа над слабым
    } else {
      return 20; // Победа над равным
    }
  }

  /**
   * Конвертирует skill points в NTRP рейтинг
   */
  private skillPointsToNTRP(skillPoints: number): number {
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
  async getRatingForUser(userId: number): Promise<any> {
    const rating = await this.prisma.playerRating.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true, // Исправлено
            lastName: true,  // Исправлено
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
  private async updatePlayerRating(userId: number, updates: {
    skillPoints: number;
    skillRating: number;
    pointsRating: number;
    wins?: number;
    losses?: number;
  }): Promise<any> {
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
  private async createRatingHistoryEntry(data: {
    userId: number;
    matchId?: number;
    seasonId?: number;
    skillPointsBefore: number;
    skillPointsAfter: number;
    pointsRatingBefore: number;
    pointsRatingAfter: number;
    isWin: boolean;
    opponentId?: number;
    opponentSkillPoints?: number;
    pointsEarned: number;
    reason: string;
  }): Promise<any> {
    return this.prisma.ratingHistory.create({ data });
  }

  /**
   * Получает текущий сезон
   */
  async getCurrentSeason(): Promise<any> {
    return this.prisma.ratingSeason.findFirst({
      where: { isCurrent: true },
    });
  }

  /**
   * Создает новый сезон
   */
  async createSeason(data: {
    title: string;
    startDate: Date;
    endDate: Date;
    description?: string;
  }): Promise<any> {
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
  async resetPointsRatingForSeason(seasonId: number): Promise<void> {
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
  async addTournamentPoints(userId: number, points: number, reason: string): Promise<any> {
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
  async getTopPlayersBySkill(limit: number = 10): Promise<any[]> {
    return this.prisma.playerRating.findMany({
      take: limit,
      orderBy: { skillPoints: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true, // Исправлено
            lastName: true,  // Исправлено
          }
        }
      }
    });
  }

  /**
   * Получает топ игроков по points rating
   */
  async getTopPlayersByPoints(limit: number = 10): Promise<any[]> {
    return this.prisma.playerRating.findMany({
      take: limit,
      orderBy: { pointsRating: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true, // Исправлено
            lastName: true,  // Исправлено
          }
        }
      }
    });
  }

  /**
   * Получает детальную статистику игрока
   */
  async getPlayerStats(userId: number): Promise<any> {
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
            lastName: true,  // Исправлено
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
}