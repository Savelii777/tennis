import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

export enum AchievementCode {
  // Активность
  FIRST_STEP = 'first_step',
  FIRST_MATCH = 'first_match',
  WARMUP = 'warmup', // 5 матчей
  IN_RHYTHM = 'in_rhythm', // 10 матчей
  REAL_PLAYER = 'real_player', // 50 матчей
  
  // Победы
  FIRST_SUCCESS = 'first_success',
  CONFIDENCE_GROWS = 'confidence_grows', // 5 побед
  STABLE_WINNER = 'stable_winner', // 15 побед
  WINNING_STREAK = 'winning_streak', // 5 побед подряд

  // Турниры
  TOURNAMENT_WINNER = 'tournament_winner',
  BRACKET_MASTER = 'bracket_master',
  GROUP_CHAMPION = 'group_champion',
  LEAGUE_MASTER = 'league_master',
  SPEED_DEMON = 'speed_demon',
  CROWD_PLEASER = 'crowd_pleaser',
  TOURNAMENT_DOMINATOR = 'tournament_dominator',
  RANKED_CHAMPION = 'ranked_champion',
  TOURNAMENT_FINALIST = 'tournament_finalist',
  TOURNAMENT_MEDALIST = 'tournament_medalist',
  TOURNAMENT_STREAK_3 = 'tournament_streak_3',
  TOURNAMENT_STREAK_5 = 'tournament_streak_5',
  TOURNAMENT_LEGEND = 'tournament_legend',
  MONTHLY_CHAMPION = 'monthly_champion',
  MONTHLY_DOMINATOR = 'monthly_dominator',
}

export interface AchievementDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);
  private readonly definitions: AchievementDefinition[] = [
    {
      code: 'first_step',
      name: 'Первый шаг',
      description: 'Завершил регистрацию',
      icon: '👋',
      category: 'activity'
    },
    {
      code: 'first_match',
      name: 'Первый матч',
      description: 'Сыграл первый матч',
      icon: '🎾',
      category: 'matches'
    },
    {
      code: 'warmup',
      name: 'Разогрев',
      description: 'Сыграл 5 матчей',
      icon: '🔥',
      category: 'matches'
    },
    {
      code: 'in_rhythm',
      name: 'В ритме',
      description: 'Сыграл 10 матчей',
      icon: '⚡',
      category: 'matches'
    },
    {
      code: 'real_player',
      name: 'Настоящий игрок',
      description: 'Сыграл 50 матчей',
      icon: '🏆',
      category: 'matches'
    },
    {
      code: 'first_success',
      name: 'Первый успех',
      description: 'Выиграл первый матч',
      icon: '🥇',
      category: 'victories'
    },
    {
      code: 'confidence_grows',
      name: 'Уверенность растет',
      description: 'Выиграл 5 матчей',
      icon: '💪',
      category: 'victories'
    },
    {
      code: 'stable_winner',
      name: 'Стабильный победитель',
      description: 'Выиграл 15 матчей',
      icon: '🌟',
      category: 'victories'
    },
    {
      code: 'winning_streak',
      name: 'Победная серия',
      description: 'Выиграл 5 матчей подряд',
      icon: '🔥',
      category: 'victories'
    },
    // Турнирные достижения
    {
      code: 'tournament_winner',
      name: 'Победитель турнира',
      description: 'Выиграл турнир',
      icon: '🏆',
      category: 'tournaments'
    },
    {
      code: 'bracket_master',
      name: 'Мастер сетки',
      description: 'Выиграл турнир на выбывание',
      icon: '🎯',
      category: 'tournaments'
    },
    {
      code: 'group_champion',
      name: 'Чемпион группы',
      description: 'Выиграл групповой турнир',
      icon: '👥',
      category: 'tournaments'
    },
    {
      code: 'league_master',
      name: 'Мастер лиги',
      description: 'Выиграл лиговой турнир',
      icon: '🏅',
      category: 'tournaments'
    },
    {
      code: 'speed_demon',
      name: 'Демон скорости',
      description: 'Выиграл блиц-турнир',
      icon: '⚡',
      category: 'tournaments'
    },
    {
      code: 'crowd_pleaser',
      name: 'Любимец публики',
      description: 'Выиграл турнир с 8+ участниками',
      icon: '👏',
      category: 'tournaments'
    },
    {
      code: 'tournament_dominator',
      name: 'Доминатор турниров',
      description: 'Выиграл турнир с 16+ участниками',
      icon: '👑',
      category: 'tournaments'
    },
    {
      code: 'ranked_champion',
      name: 'Рейтинговый чемпион',
      description: 'Выиграл рейтинговый турнир',
      icon: '⭐',
      category: 'tournaments'
    },
    {
      code: 'tournament_finalist',
      name: 'Финалист турнира',
      description: 'Занял 2-е место в турнире',
      icon: '🥈',
      category: 'tournaments'
    },
    {
      code: 'tournament_medalist',
      name: 'Призер турнира',
      description: 'Занял 3-е место в турнире',
      icon: '🥉',
      category: 'tournaments'
    },
    {
      code: 'tournament_streak_3',
      name: 'Турнирная серия',
      description: 'Выиграл 3 турнира подряд',
      icon: '🔥',
      category: 'tournaments'
    },
    {
      code: 'tournament_streak_5',
      name: 'Турнирная доминация',
      description: 'Выиграл 5 турниров подряд',
      icon: '🌟',
      category: 'tournaments'
    },
    {
      code: 'tournament_legend',
      name: 'Легенда турниров',
      description: 'Выиграл 10 турниров подряд',
      icon: '👑',
      category: 'tournaments'
    },
    {
      code: 'monthly_champion',
      name: 'Чемпион месяца',
      description: 'Выиграл 3 турнира за месяц',
      icon: '📅',
      category: 'tournaments'
    },
    {
      code: 'monthly_dominator',
      name: 'Доминатор месяца',
      description: 'Выиграл 5 турниров за месяц',
      icon: '🗓️',
      category: 'tournaments'
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async checkAndAwardAchievements(userId: string, eventType: string): Promise<string[]> {
    const newAchievements: string[] = [];

    try {
      switch (eventType) {
        case 'registration_completed':
          await this.checkRegistrationAchievements(userId, newAchievements);
          break;
        case 'match_played':
          await this.checkMatchAchievements(userId, newAchievements);
          break;
        case 'match_won':
          await this.checkVictoryAchievements(userId, newAchievements);
          break;
      }

      // Награждаем новыми достижениями
      for (const code of newAchievements) {
        await this.awardAchievement(userId, code);
      }

    } catch (error) {
      this.logger.error(`Error checking achievements for user ${userId}:`, error);
    }

    return newAchievements;
  }

  async getAllDefinitions(): Promise<AchievementDefinition[]> {
    return this.definitions;
  }

  private async checkRegistrationAchievements(userId: string, newAchievements: string[]) {
    if (!(await this.hasAchievement(userId, AchievementCode.FIRST_STEP))) {
      newAchievements.push(AchievementCode.FIRST_STEP);
    }
  }

  private async checkMatchAchievements(userId: string, newAchievements: string[]) {
    const stats = await this.getUserStats(userId);
    if (!stats) return;

    // Первый матч
    if (stats.matchesPlayed >= 1 && !(await this.hasAchievement(userId, AchievementCode.FIRST_MATCH))) {
      newAchievements.push(AchievementCode.FIRST_MATCH);
    }

    // 5 матчей
    if (stats.matchesPlayed >= 5 && !(await this.hasAchievement(userId, AchievementCode.WARMUP))) {
      newAchievements.push(AchievementCode.WARMUP);
    }

    // 10 матчей
    if (stats.matchesPlayed >= 10 && !(await this.hasAchievement(userId, AchievementCode.IN_RHYTHM))) {
      newAchievements.push(AchievementCode.IN_RHYTHM);
    }

    // 50 матчей
    if (stats.matchesPlayed >= 50 && !(await this.hasAchievement(userId, AchievementCode.REAL_PLAYER))) {
      newAchievements.push(AchievementCode.REAL_PLAYER);
    }
  }

  private async checkVictoryAchievements(userId: string, newAchievements: string[]) {
    const stats = await this.getUserStats(userId);
    if (!stats) return;

    // Первая победа
    if (stats.matchWins >= 1 && !(await this.hasAchievement(userId, AchievementCode.FIRST_SUCCESS))) {
      newAchievements.push(AchievementCode.FIRST_SUCCESS);
    }

    // 5 побед
    if (stats.matchWins >= 5 && !(await this.hasAchievement(userId, AchievementCode.CONFIDENCE_GROWS))) {
      newAchievements.push(AchievementCode.CONFIDENCE_GROWS);
    }

    // 15 побед
    if (stats.matchWins >= 15 && !(await this.hasAchievement(userId, AchievementCode.STABLE_WINNER))) {
      newAchievements.push(AchievementCode.STABLE_WINNER);
    }

    // Проверяем серию побед
    const winningStreak = await this.getWinningStreak(userId);
    if (winningStreak >= 5 && !(await this.hasAchievement(userId, AchievementCode.WINNING_STREAK))) {
      newAchievements.push(AchievementCode.WINNING_STREAK);
    }
  }

  private async hasAchievement(userId: string, code: AchievementCode): Promise<boolean> {
    const achievement = await this.prisma.userAchievement.findUnique({
      where: {
        userId_code: {
          userId: parseInt(userId),
          code: code,
        },
      },
    });
    return !!achievement;
  }

  private async awardAchievement(userId: string, code: string) {
    try {
      await this.prisma.userAchievement.create({
        data: {
          userId: parseInt(userId),
          code: code,
        },
      });
      this.logger.log(`Achievement ${code} awarded to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to award achievement ${code} to user ${userId}:`, error);
    }
  }

  private async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        profile: true,
        // Используем правильные отношения из схемы
        player1Matches: {
          where: { state: 'FINISHED' },
          orderBy: { createdAt: 'desc' },
        },
        player2Matches: {
          where: { state: 'FINISHED' },
          orderBy: { createdAt: 'desc' },
        },
        createdMatches: {
          where: { state: 'FINISHED' },
          orderBy: { createdAt: 'desc' },
        }
      },
    });

    if (!user) return null;

    // Объединяем все матчи с правильными полями
    const allMatches = [
      ...(user.createdMatches || []),
      ...(user.player1Matches || []),
      ...(user.player2Matches || [])
    ];
    
    return {
      matchesPlayed: allMatches.length,
      matchWins: user.profile?.matchWins || 0,
      lastActivity: user.profile?.lastActivity,
      createdAt: user.createdAt,
    };
  }

  private async getWinningStreak(userId: string): Promise<number> {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          { creatorId: parseInt(userId) },
          { player1Id: parseInt(userId) },
          { player2Id: parseInt(userId) },
        ],
        state: 'FINISHED',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    let streak = 0;
    for (const match of matches) {
      // Упрощенная логика - проверяем счет
      const isWin = match.score && match.score.includes('6-');
      if (isWin) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  async getUserAchievements(userId: string) {
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { awardedAt: 'desc' },
    });

    // Добавляем определения к достижениям
    return userAchievements.map((achievement: any) => {
      const definition = this.definitions.find(def => def.code === achievement.code);
      return {
        ...achievement,
        definition: definition || {
          code: achievement.code,
          name: achievement.code,
          description: 'Неизвестное достижение',
          icon: '🏆',
          category: 'unknown'
        }
      };
    });
  }

  /**
   * Проверяем и присваиваем отдельное достижение
   */
  async checkAndAwardSingleAchievement(userId: string, achievementCode: string, metadata?: any): Promise<boolean> {
    try {
      // Проверяем, есть ли уже это достижение
      const hasAchievement = await this.prisma.userAchievement.findUnique({
        where: {
          userId_code: {
            userId: parseInt(userId),
            code: achievementCode,
          },
        },
      });

      if (hasAchievement) {
        return false; // Достижение уже есть
      }

      // Присваиваем достижение
      await this.awardAchievement(userId, achievementCode);
      
      this.logger.log(`🏆 Присвоено достижение ${achievementCode} пользователю ${userId}`);
      return true;

    } catch (error) {
      this.logger.error(`❌ Ошибка при присвоении достижения ${achievementCode}:`, error);
      return false;
    }
  }
}