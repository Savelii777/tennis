import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';
import { UpdateProfileDto } from '../../presentation/dto/update-profile.dto';
import { ProfileStatisticsDto } from '../../presentation/dto/profile-statistics.dto';
import { ProfileStepOneDto } from '../../presentation/dto/profile-step-one.dto';
import { ProfileStepTwoDto } from '../../presentation/dto/profile-step-two.dto';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Role } from '../../domain/enums/role.enum';
import { RatingsService } from '../../../ratings/ratings.service'; 

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
    private readonly ratingsService: RatingsService 
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.findAll();
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateTelegramChatId(userId: string, telegramChatId: number): Promise<void> {
    await this.usersRepository.updateTelegramChatId(Number(userId), BigInt(telegramChatId));
  }

  async setReferrer(userId: string, referrerId: string): Promise<void> {
    await this.usersRepository.setReferrer(Number(userId), Number(referrerId));
  }
  
async findByTelegramId(telegramId: string): Promise<UserEntity | null> {
  const user = await this.prisma.user.findUnique({
    where: { telegramId },
    include: {
      profile: true
    }
  });
  
  if (!user) {
    return null;
  }
  
  // Create entity directly without using repository method
  const entity = new UserEntity();
  entity.id = user.id;
  entity.telegram_id = user.telegramId;
  entity.username = user.username;
  entity.first_name = user.firstName;
  entity.last_name = user.lastName || undefined;
  entity.is_verified = user.isVerified;
  entity.role = user.role as Role;
  entity.telegramChatId = user.telegramChatId || undefined;
  entity.referredBy = user.referredBy || undefined; // Добавляем поле

  // Map profile if it exists
  if (user.profile) {
    entity.profile = user.profile as any;
  }
  
  return entity;
}
// Добавляем недостающий метод createFromTelegram
  async createFromTelegram(telegramData: any): Promise<UserEntity> {
    const userData = {
      telegram_id: telegramData.id.toString(),
      username: telegramData.username || `user_${telegramData.id}`,
      first_name: telegramData.first_name,
      last_name: telegramData.last_name || undefined,
      is_verified: false,
      role: Role.USER,
    };

    const user = await this.create(userData);
    
    
    return user;
  }

    // Добавляем недостающий метод updateLastLogin
  async updateLastLogin(userId: string): Promise<UserEntity> {
    await this.prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        profile: {
          update: {
            lastActivity: new Date()
          }
        }
      }
    });

    return this.findById(userId);
  }
  
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = new UserEntity();
    Object.assign(user, createUserDto);
    const createdUser = await this.usersRepository.create(user);
    
    
    return createdUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    await this.findById(id); 
    return this.usersRepository.update(id, updateUserDto);
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<UserEntity> {
    await this.findById(id); 
    return this.usersRepository.updateProfile(id, updateProfileDto);
  }

  async getRatingHistory(userId: string): Promise<any[]> {
    return this.usersRepository.getRatingHistory(userId);
  }

  async getProfileStatistics(userId: string): Promise<ProfileStatisticsDto> {
    const user = await this.findById(userId);
    
    return {
      matchesPlayed: user.profile.matches_played,
      matchWins: user.profile.match_wins,
      matchLosses: user.profile.match_losses,
      tournamentsPlayed: user.profile.tournaments_played,
      tournamentsWon: user.profile.tournaments_won,
      winRate: user.profile.winRate,
      ratingPoints: user.profile.rating_points,
      lastActivity: user.profile.last_activity
    };
  }

  async getUserAchievements(userId: string): Promise<Record<string, any>> {
    return this.usersRepository.getUserAchievements(userId);
  }
  
  async updateMatchStats(userId: string, isWin: boolean): Promise<UserEntity> {
    return this.usersRepository.updateMatchStats(userId, isWin);
  }

  async updateTournamentStats(userId: string, isWin: boolean): Promise<UserEntity> {
    return this.usersRepository.updateTournamentStats(userId, isWin);
  }

  async addAchievement(userId: string, achievementKey: string, achievementData: any): Promise<UserEntity> {
    return this.usersRepository.addAchievement(userId, achievementKey, achievementData);
  }

  async getRecentMatches(userId: string, limit: number = 5): Promise<any[]> {
    return this.usersRepository.getRecentMatches(userId, limit);
  }

  async completeProfileStepOne(userId: string, profileData: ProfileStepOneDto): Promise<any> {
    // Проверить существование пользователя
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Сохранить данные первого шага
    const updatedProfile = await this.prisma.userProfile.upsert({
      where: { userId: parseInt(userId) },
      update: {
        city: profileData.city,
        preferredCourt: profileData.preferredCourt,
        dominantHand: profileData.dominantHand,
        preferredPlayTime: profileData.preferredPlayTime,
        playsInTournaments: profileData.playsInTournaments,
        weeklyPlayFrequency: profileData.weeklyPlayFrequency,
        profileStepOneCompleted: true
      },
      create: {
        user: { connect: { id: parseInt(userId) } },
        city: profileData.city,
        preferredCourt: profileData.preferredCourt,
        dominantHand: profileData.dominantHand,
        preferredPlayTime: profileData.preferredPlayTime,
        playsInTournaments: profileData.playsInTournaments,
        weeklyPlayFrequency: profileData.weeklyPlayFrequency,
        profileStepOneCompleted: true
      }
    });
    
    // Обновить имя/фамилию если предоставлены
    if (profileData.firstName || profileData.lastName) {
      await this.prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          firstName: profileData.firstName || user.first_name, // исправлено поле
          lastName: profileData.lastName || user.last_name     // исправлено поле
        }
      });
    }
    
    return { 
      status: 'success',
      message: 'Profile step 1 completed', 
      profileId: updatedProfile.id 
    };
  }

  async completeProfileStepTwo(userId: string, profileData: ProfileStepTwoDto): Promise<any> {
    // Проверить существование пользователя и завершение первого шага
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: parseInt(userId) }
    });
    
    if (!profile) {
      throw new BadRequestException('Complete step 1 first');
    }
    
    // Рассчитать начальный рейтинг на основе самооценки
    let initialRating = 0;
    let ntrpEstimate = 0;
    
    switch(profileData.selfAssessedLevel) {
      case 'BEGINNER':
        initialRating = 1000;
        ntrpEstimate = 2.5;
        break;
      case 'AMATEUR':
        initialRating = 1200;
        ntrpEstimate = 3.0;
        break;
      case 'CONFIDENT':
        initialRating = 1400;
        ntrpEstimate = 4.0;
        break;
      case 'TOURNAMENT':
        initialRating = 1600;
        ntrpEstimate = 5.0;
        break;
      case 'SEMI_PRO':
        initialRating = 1800;
        ntrpEstimate = 5.5;
        break;
      default:
        initialRating = 1400;
        ntrpEstimate = 4.0;
    }
    
    // Сохранить данные второго шага
    const updatedProfile = await this.prisma.userProfile.update({
      where: { userId: parseInt(userId) },
      data: {
        backhandType: profileData.backhandType,
        preferredSurface: profileData.preferredSurface,
        playingStyle: profileData.playingStyle,
        favoriteShot: profileData.favoriteShot,
        racket: profileData.racket,
        opponentPreference: profileData.opponentPreference,
        selfAssessedLevel: profileData.selfAssessedLevel,
        initialRatingPoints: initialRating,
        ratingPoints: initialRating,
        ntrpRating: ntrpEstimate,
        profileStepTwoCompleted: true
      }
    });

    // Обновляем рейтинг игрока на основе самооценки
    try {
      await this.ratingsService.createDefaultRating(parseInt(userId), {
        skillPoints: initialRating,
        skillRating: ntrpEstimate,
        pointsRating: 1000, // Стартовые очки активности
      });
    } catch (error) {
      // Логируем ошибку, но не прерываем выполнение
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to update rating for user ${userId}: ${errorMessage}`);
    }
    
    return {
      success: true,
      userId,
      message: 'Profile step two completed successfully'
    };
  }

async getProfileCompletionStatus(userId: string): Promise<{ percentage: number, stepOneCompleted: boolean, stepTwoCompleted: boolean }> {
  const profile = await this.prisma.userProfile.findUnique({
    where: { userId: parseInt(userId) }
  });
  
  const stepOneCompleted = profile?.profileStepOneCompleted || false;
  const stepTwoCompleted = profile?.profileStepTwoCompleted || false;
  
  // Вычисляем процент заполнения
  const percentage = Math.round(
    ((stepOneCompleted ? 50 : 0) + 
     (stepTwoCompleted ? 50 : 0))
  );
  
  return {
    percentage,
    stepOneCompleted,
    stepTwoCompleted
  };
}
  // Добавьте эти методы в класс UsersService

  async updateUserLocation(userId: string, locationData: {
    countryCode?: string;
    cityId?: number;
    sportId?: number;
  }) {
    return this.usersRepository.updateUser(userId, {
      countryCode: locationData.countryCode,
      cityId: locationData.cityId,
      sportId: locationData.sportId,
    });
  }

  async getUserWithLocation(userId: string) {
    return this.usersRepository.findByIdWithLocation(userId);
  }
  
  // Добавляем метод getUserMatches
  /**
   * Получение матчей пользователя
   */
  async getUserMatches(userId: string): Promise<any[]> {
    const userIdInt = parseInt(userId);
    
    // Используем правильные поля из схемы Prisma
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          { creatorId: userIdInt },
          { player1Id: userIdInt },
          { player2Id: userIdInt }
        ]
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, username: true }
        }
        // Удаляем включение player1 и player2, так как это отношения Many-to-One
        // и они уже определены через creatorId, player1Id и player2Id
      },
      orderBy: { createdAt: 'desc' } // Используем существующее поле
    });

    return matches.map(match => {
      // Определяем оппонента на основе ID
      let opponentId: number | null = null;
      
      if (match.creatorId === userIdInt && match.player1Id) {
        opponentId = match.player1Id;
      } else if (match.creatorId === userIdInt && match.player2Id) {
        opponentId = match.player2Id;
      } else if (match.player1Id === userIdInt && match.player2Id) {
        opponentId = match.player2Id;
      } else if (match.player2Id === userIdInt && match.player1Id) {
        opponentId = match.player1Id;
      } else if (match.player1Id === userIdInt || match.player2Id === userIdInt) {
        opponentId = match.creatorId;
      }
      
      // Находим имя оппонента (если есть)
      let opponentName = 'Неизвестно';
      if (opponentId && opponentId === match.creatorId && match.creator) {
        opponentName = `${match.creator.firstName} ${match.creator.lastName || ''}`.trim();
      }
      // Для остальных случаев нужно дополнительно запрашивать данные пользователя

      return {
        id: match.id,
        date: match.createdAt, // Или matchDate если добавили это поле
        score: match.score,
        result: match.winnerId === userIdInt ? 'WIN' : 'LOSS',
        opponentName
      };
    });
  }

  
  /**
   * Получить полный профиль пользователя со всеми связями
   */
  async getUserFullProfile(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        profile: true,
        rating: true,
        country: true,
        city: true,
        sport: true,
        settings: true,
        achievements: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        },
        player1Matches: {
          where: { state: 'FINISHED' },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        player2Matches: {
          where: { state: 'FINISHED' },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        createdMatches: {
          where: { state: 'FINISHED' },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        wonMatches: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        tournaments: {
          orderBy: { startDate: 'desc' },
          take: 5
        },
        stories: {
          where: { status: 'approved' },
          orderBy: { publishedAt: 'desc' },
          take: 10
        }, 
        
      }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Форматируем данные согласно ТЗ
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.profile?.avatarUrl,
      city: user.city?.name,
      country: user.country?.name,
      countryFlag: user.country?.flagUrl,
      sport: {
        id: user.sportId,
        title: user.sport?.title || 'Не указан',
        emoji: user.sport?.emoji || '',
        icon: user.sport?.icon || '',
        isSpecified: !!user.sportId,
      },
      level: {
        ntrp: user.profile?.ntrpRating,
        visual: user.profile?.ntrpRating?.toFixed(1), // Форматированное значение
        ratingInfo: this.getNtrpVisualRating(user.profile?.ntrpRating), // Полная информация о рейтинге
      },
      rating: {
        points: user.rating?.skillPoints || 0,
        ranking: user.rating?.pointsRating || 0,
      },
      statistics: {
        matchesPlayed: user.profile?.matchesPlayed || 0,
        matchWins: user.profile?.matchWins || 0,
        matchLosses: user.profile?.matchLosses || 0,
        winRate: this.calculateWinRate(user.profile),
        tournamentsPlayed: user.profile?.tournamentsPlayed || 0,
        tournamentsWon: user.profile?.tournamentsWon || 0,
        lastActivity: user.profile?.lastActivity,
      },
      playingStyle: {
        dominantHand: user.profile?.dominantHand,
        preferredCourt: user.profile?.preferredCourt,
        backhandType: user.profile?.backhandType,
        preferredSurface: user.profile?.preferredSurface,
        playingStyle: user.profile?.playingStyle,
        favoriteShot: user.profile?.favoriteShot,
        preferredPlayTime: user.profile?.preferredPlayTime,
        playsInTournaments: user.profile?.playsInTournaments,
        weeklyPlayFrequency: user.profile?.weeklyPlayFrequency,
        racket: user.profile?.racket,
      },
      privacySettings: {
        isPublic: user.settings?.showProfilePublicly || true,
        showRating: user.settings?.showRatingPublicly || true,
        allowMessages: user.settings?.allowDirectMessages || true
      }
    };
  }

  /**
   * Получить публичный профиль с учетом настроек приватности
   */
  async getPublicUserProfile(targetUserId: string, requesterId?: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(targetUserId) },
      include: {
        profile: true,
        rating: true,
        country: true,
        city: true,
        sport: true,
        settings: true
      }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем приватность
    const isProfilePublic = user.settings?.showProfilePublicly ?? true;
    if (!isProfilePublic) {
      // Если профиль приватный, возвращаем только базовую информацию
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.profile?.avatarUrl,
        isPrivate: true
      };
    }

    // Для публичного профиля формируем расширенную информацию
    const result: any = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.profile?.avatarUrl,
      city: user.city?.name,
      country: user.country?.name,
      countryFlag: user.country?.flagUrl,
      sport: {
        id: user.sportId,
        title: user.sport?.title || 'Не указан',
        emoji: user.sport?.emoji || '',
        icon: user.sport?.icon || '',
        isSpecified: !!user.sportId,
      },
      allowDirectMessages: user.settings?.allowDirectMessages ?? true
    };

    // Если разрешено показывать рейтинг публично
    if (user.settings?.showRatingPublicly) {
      result.level = {
        ntrp: user.profile?.ntrpRating,
        visual: user.profile?.ntrpRating?.toFixed(1),
        ratingInfo: this.getNtrpVisualRating(user.profile?.ntrpRating),
      };
      
      result.statistics = {
        matchesPlayed: user.profile?.matchesPlayed || 0,
        matchWins: user.profile?.matchWins || 0,
        matchLosses: user.profile?.matchLosses || 0,
        winRate: this.calculateWinRate(user.profile),
        tournamentsPlayed: user.profile?.tournamentsPlayed || 0,
        tournamentsWon: user.profile?.tournamentsWon || 0,
      };
      
      // Получаем историю матчей (только если рейтинг публичный)
      result.recentMatches = await this.getPublicUserMatches(targetUserId, 5);
    }

    return result;
  }

  /**
   * Обновить аватар пользователя
   */
  async updateAvatar(userId: string, filename: string): Promise<any> {
    // Находим пользователя
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Получаем текущий профиль или создаем новый
    let profile = await this.prisma.userProfile.findUnique({
      where: { userId: parseInt(userId) }
    });

    // Обновляем аватар
    if (profile) {
      // Если профиль существует - обновляем
      await this.prisma.userProfile.update({
        where: { userId: parseInt(userId) },
        data: {
          avatarUrl: `/uploads/avatars/${filename}`
        }
      });
    } else {
      // Если профиля нет - создаем
      await this.prisma.userProfile.create({
        data: {
          userId: parseInt(userId),
          avatarUrl: `/uploads/avatars/${filename}`
        }
      });
    }

    return { 
      success: true, 
      avatarUrl: `/uploads/avatars/${filename}` 
    };
  }

  /**
   * Сгенерировать ссылку для шаринга профиля
   */
  async generateProfileShareUrl(userId: string): Promise<string> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    
    // Создаем укороченную ссылку для шаринга
    const baseUrl = process.env.APP_URL || 'https://tennis-app.com';
    return `${baseUrl}/profile/${userId}`;
  }

  /**
   * Отправить прямое сообщение пользователю
   */
  async sendDirectMessage(senderId: string, recipientId: string, message: string): Promise<any> {
    // Проверяем существование отправителя и получателя
    const [sender, recipient] = await Promise.all([
      this.findById(senderId),
      this.findById(recipientId)
    ]);

    if (!sender || !recipient) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем настройки приватности получателя
    const recipientSettings = await this.prisma.userSettings.findUnique({
      where: { userId: parseInt(recipientId) }
    });

    const allowDirectMessages = recipientSettings?.allowDirectMessages ?? true;
    if (!allowDirectMessages) {
      throw new ForbiddenException('Этот пользователь не принимает сообщения');
    }

    // Создаем запись о сообщении
    const directMessage = await this.prisma.directMessage.create({
      data: {
        senderId: parseInt(senderId),
        recipientId: parseInt(recipientId),
        message,
        isRead: false
      }
    });

    // Если у получателя есть Telegram ID, отправляем ему уведомление
if (recipient.telegram_id) {
    const senderName = `${sender.first_name} ${sender.last_name || ''}`.trim();
      
      // Создаем уведомление
      await this.prisma.notification.create({
        data: {
          userId: parseInt(recipientId),
          type: 'SYSTEM_MESSAGE',
          message: `Новое сообщение от ${senderName}`,
          data: {
            senderId: parseInt(senderId),
            messageId: directMessage.id,
            text: message.length > 50 
              ? `${message.substring(0, 50)}...` 
              : message
          },
          isRead: false
        }
      });

      // Если интегрирован сервис Telegram - отправляем сообщение
      // this.telegramService.sendMessage(recipient.telegramId, ...);
    }

    return {
      id: directMessage.id,
      message: message,
      createdAt: directMessage.createdAt
    };
  }

/**
 * Вспомогательный метод для визуального отображения NTRP рейтинга
 * Возвращает объект с данными для отображения NTRP рейтинга и бейджа
 */
private getNtrpVisualRating(ntrpRating?: number | null): { value: string, badge: string, level: string } {
  if (!ntrpRating) return { value: 'Не указан', badge: 'basic', level: 'Неизвестный' };

  // Округляем до 1 десятичного знака для корректного отображения
  const formattedRating = ntrpRating.toFixed(1);
  
  // Определяем уровень игрока на основе NTRP
  let badge: string;
  let level: string;
  
  if (ntrpRating < 3.0) {
    badge = 'beginner';
    level = 'Начинающий';
  } else if (ntrpRating >= 3.0 && ntrpRating < 4.0) {
    badge = 'intermediate';
    level = 'Средний';
  } else if (ntrpRating >= 4.0 && ntrpRating < 5.0) {
    badge = 'advanced';
    level = 'Продвинутый';
  } else if (ntrpRating >= 5.0 && ntrpRating < 6.0) {
    badge = 'expert';
    level = 'Эксперт';
  } else {
    badge = 'pro';
    level = 'Профессионал';
  }
  
  return {
    value: formattedRating,  // Строковое представление рейтинга (например, "4.5")
    badge,                   // Класс для CSS стилизации бейджа
    level                    // Текстовое описание уровня
  };
}

  /**
   * Вспомогательный метод для расчета процента побед
   */
  private calculateWinRate(profile?: any): number {
    if (!profile) return 0;
    
    const wins = profile.matchWins || 0;
    const losses = profile.matchLosses || 0;
    const total = wins + losses;
    
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  }

  /**
   * Получить публичные матчи пользователя для отображения в профиле
   */
  private async getPublicUserMatches(userId: string, limit: number): Promise<any[]> {
    // Здесь должен быть код получения матчей через matchesService
    // Для примера:
    return this.prisma.match.findMany({
      where: {
        OR: [
          { player1Id: parseInt(userId) },
          { player2Id: parseInt(userId) },
          { creatorId: parseInt(userId) }
        ],
        state: 'FINISHED'
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    }).then(matches => matches.map(match => ({
      id: match.id,
      date: match.matchDate || match.createdAt,
      score: match.score,
      result: match.winnerId === parseInt(userId) ? 'WIN' : 'LOSS'
      // Дополнительные данные...
    })));
  }

}