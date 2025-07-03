import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface AchievementCheck {
  code: string;
  checkCondition: (userStats: any) => boolean;
  title: string;
  description: string;
}

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Проверить и присвоить достижения пользователю
   */
  async checkAndAwardAchievements(userId: number): Promise<string[]> {
    try {
      // Получаем статистику пользователя
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          rating: true,
          achievements: true,
          player1Matches: { where: { state: 'FINISHED' } },
          player2Matches: { where: { state: 'FINISHED' } },
          createdMatches: { where: { state: 'FINISHED' } },
          wonMatches: true,
          tournaments: true
        }
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Подсчитываем статистику
      const totalMatches = user.player1Matches.length + user.player2Matches.length + user.createdMatches.length;
      const totalWins = user.wonMatches.length;
      const tournamentsPlayed = user.tournaments.length;
      const tournamentsWon = user.profile?.tournamentsWon || 0;

      const userStats = {
        matchesPlayed: totalMatches,
        matchWins: totalWins,
        tournamentsPlayed,
        tournamentsWon
      };

      // Список всех возможных достижений
      const achievementChecks: AchievementCheck[] = [
        {
          code: 'first_match',
          checkCondition: (stats) => stats.matchesPlayed >= 1,
          title: 'Новичок',
          description: 'Сыграл первый матч'
        },
        {
          code: 'five_wins',
          checkCondition: (stats) => stats.matchWins >= 5,
          title: 'Победитель',
          description: 'Выиграл 5 матчей'
        },
        {
          code: 'tournament_player',
          checkCondition: (stats) => stats.tournamentsPlayed >= 1,
          title: 'Турнирный игрок',
          description: 'Участвовал в турнире'
        },
        {
          code: 'marathon_player',
          checkCondition: (stats) => stats.matchesPlayed >= 50,
          title: 'Марафонец',
          description: 'Сыграл 50 матчей'
        },
        {
          code: 'tournament_winner',
          checkCondition: (stats) => stats.tournamentsWon >= 1,
          title: 'Чемпион',
          description: 'Выиграл турнир'
        },
        {
          code: 'ten_wins',
          checkCondition: (stats) => stats.matchWins >= 10,
          title: 'Опытный игрок',
          description: 'Выиграл 10 матчей'
        },
        {
          code: 'twenty_five_wins',
          checkCondition: (stats) => stats.matchWins >= 25,
          title: 'Мастер',
          description: 'Выиграл 25 матчей'
        }
      ];

      // Получаем уже полученные достижения
      const existingAchievements = user.achievements.map(a => a.code);
      const newAchievements: string[] = [];

      // Проверяем каждое достижение
      for (const achievement of achievementChecks) {
        // Если достижение еще не получено и условие выполнено
        if (!existingAchievements.includes(achievement.code) && 
            achievement.checkCondition(userStats)) {
          
          // Присваиваем достижение
          await this.prisma.userAchievement.create({
            data: {
              userId: userId,
              code: achievement.code,
              metadata: {
                title: achievement.title,
                description: achievement.description,
                awardedAt: new Date(),
                stats: userStats
              }
            }
          });

          newAchievements.push(achievement.code);
          this.logger.log(`✅ Присвоено достижение ${achievement.code} пользователю ${userId}`);
        }
      }

      return newAchievements;
    } catch (error) {
      this.logger.error(`Ошибка при проверке достижений для пользователя ${userId}: ${error}`);
      return [];
    }
  }

  /**
   * Получить все достижения пользователя
   */
  async getUserAchievements(userId: number): Promise<any[]> {
    try {
      const achievements = await this.prisma.userAchievement.findMany({
        where: { userId },
        orderBy: { awardedAt: 'desc' }
      });

      return achievements.map(achievement => ({
        code: achievement.code,
        awardedAt: achievement.awardedAt,
        metadata: achievement.metadata
      }));
    } catch (error) {
      this.logger.error(`Ошибка при получении достижений пользователя ${userId}: ${error}`);
      return [];
    }
  }

  /**
   * Проверить достижения после завершения матча
   */
  async checkMatchAchievements(userId: number, isWin: boolean): Promise<string[]> {
    this.logger.log(`Проверка достижений после матча для пользователя ${userId}, победа: ${isWin}`);
    return this.checkAndAwardAchievements(userId);
  }

  /**
   * Проверить достижения после участия в турнире
   */
  async checkTournamentAchievements(userId: number, isWin: boolean): Promise<string[]> {
    this.logger.log(`Проверка достижений после турнира для пользователя ${userId}, победа: ${isWin}`);
    return this.checkAndAwardAchievements(userId);
  }

  /**
   * Получить информацию о прогрессе к достижениям
   */
  async getAchievementProgress(userId: number): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          achievements: true,
          player1Matches: { where: { state: 'FINISHED' } },
          player2Matches: { where: { state: 'FINISHED' } },
          createdMatches: { where: { state: 'FINISHED' } },
          wonMatches: true,
          tournaments: true
        }
      });

      if (!user) return {};

      const totalMatches = user.player1Matches.length + user.player2Matches.length + user.createdMatches.length;
      const totalWins = user.wonMatches.length;
      const tournamentsPlayed = user.tournaments.length;
      const tournamentsWon = user.profile?.tournamentsWon || 0;

      const existingAchievements = user.achievements.map(a => a.code);

      return {
        current: {
          matchesPlayed: totalMatches,
          matchWins: totalWins,
          tournamentsPlayed,
          tournamentsWon
        },
        progress: {
          first_match: {
            achieved: existingAchievements.includes('first_match'),
            current: totalMatches,
            required: 1
          },
          five_wins: {
            achieved: existingAchievements.includes('five_wins'),
            current: totalWins,
            required: 5
          },
          tournament_player: {
            achieved: existingAchievements.includes('tournament_player'),
            current: tournamentsPlayed,
            required: 1
          },
          marathon_player: {
            achieved: existingAchievements.includes('marathon_player'),
            current: totalMatches,
            required: 50
          },
          tournament_winner: {
            achieved: existingAchievements.includes('tournament_winner'),
            current: tournamentsWon,
            required: 1
          }
        }
      };
    } catch (error) {
      this.logger.error(`Ошибка при получении прогресса достижений для пользователя ${userId}: ${error}`);
      return {};
    }
  }
}
