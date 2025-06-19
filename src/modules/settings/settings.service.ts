import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto, NotificationSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить настройки пользователя или создать дефолтные
   */
  async getUserSettings(userId: number): Promise<any> {
    try {
      let settings = await this.prisma.userSettings.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            }
          },
          city: {
            select: {
              id: true,
              name: true,
              country: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                }
              }
            }
          },
          sport: {
            select: {
              id: true,
              title: true, // Исправляем с name на title
              slug: true,
              emoji: true,
            }
          }
        }
      });

      if (!settings) {
        settings = await this.createDefaultSettings(userId);
      }

      return settings;
    } catch (error) {
      this.logger.error(`Failed to get user settings for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Создать дефолтные настройки для пользователя
   */
  async createDefaultSettings(userId: number): Promise<any> {
    try {
      const settings = await this.prisma.userSettings.create({
        data: {
          userId,
          language: 'ru',
          notificationsEnabled: true,
          notifyTelegram: true,
          notifyEmail: false,
          matchReminderTime: '1h',
          notifyMatchResults: true,
          notifyTournamentResults: true,
          showProfilePublicly: true,
          showRatingPublicly: true,
          allowMatchInvites: true,
          requireMatchConfirm: false,
          theme: 'light',
          timezone: 'Europe/Moscow',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            }
          },
          city: {
            select: {
              id: true,
              name: true,
              country: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                }
              }
            }
          },
          sport: {
            select: {
              id: true,
              title: true, // Исправляем с name на title
              slug: true,
              emoji: true,
            }
          }
        }
      });

      this.logger.log(`Created default settings for user ${userId}`);
      return settings;
    } catch (error) {
      this.logger.error(`Failed to create default settings for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Обновить настройки пользователя
   */
  async updateSettings(userId: number, updateData: UpdateSettingsDto): Promise<any> {
    try {
      await this.getUserSettings(userId);

      const updatedSettings = await this.prisma.userSettings.update({
        where: { userId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            }
          },
          city: {
            select: {
              id: true,
              name: true,
              country: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                }
              }
            }
          },
          sport: {
            select: {
              id: true,
              title: true, // Исправляем с name на title
              slug: true,
              emoji: true,
            }
          }
        }
      });

      this.logger.log(`Updated settings for user ${userId}:`, Object.keys(updateData));
      return updatedSettings;
    } catch (error) {
      this.logger.error(`Failed to update settings for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Изменить язык интерфейса
   */
  async updateLanguage(userId: number, language: string): Promise<any> {
    return this.updateSettings(userId, { language });
  }

  /**
   * Обновить настройки уведомлений
   */
  async updateNotificationSettings(userId: number, notificationData: NotificationSettingsDto): Promise<any> {
    return this.updateSettings(userId, notificationData);
  }

  /**
   * Переключить все уведомления
   */
  async toggleNotifications(userId: number, enabled: boolean): Promise<any> {
    return this.updateSettings(userId, { 
      notificationsEnabled: enabled,
      notifyTelegram: enabled,
      notifyMatchResults: enabled,
      notifyTournamentResults: enabled,
    });
  }

  /**
   * Обновить Telegram Chat ID
   */
  async updateTelegramChatId(userId: number, telegramChatId: string): Promise<any> {
    return this.updateSettings(userId, { telegramChatId });
  }

  /**
   * Получить пользователей с включенными Telegram уведомлениями
   */
  async getUsersWithTelegramNotifications(): Promise<any[]> {
    return this.prisma.userSettings.findMany({
      where: {
        notificationsEnabled: true,
        notifyTelegram: true,
        telegramChatId: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            telegramId: true,
          }
        }
      }
    });
  }

  /**
   * Получить настройки уведомлений пользователя
   */
  async getNotificationSettings(userId: number): Promise<{
    notificationsEnabled: boolean;
    notifyTelegram: boolean;
    notifyEmail: boolean;
    matchReminderTime: string;
    notifyMatchResults: boolean;
    notifyTournamentResults: boolean;
  }> {
    const settings = await this.getUserSettings(userId);
    
    return {
      notificationsEnabled: settings.notificationsEnabled,
      notifyTelegram: settings.notifyTelegram,
      notifyEmail: settings.notifyEmail,
      matchReminderTime: settings.matchReminderTime,
      notifyMatchResults: settings.notifyMatchResults,
      notifyTournamentResults: settings.notifyTournamentResults,
    };
  }

  /**
   * Проверить, нужно ли отправлять уведомление пользователю
   */
  async shouldNotifyUser(userId: number, notificationType: 'telegram' | 'email' | 'match_results' | 'tournament_results'): Promise<boolean> {
    try {
      const settings = await this.getUserSettings(userId);
      
      if (!settings.notificationsEnabled) {
        return false;
      }

      switch (notificationType) {
        case 'telegram':
          return settings.notifyTelegram && !!settings.telegramChatId;
        case 'email':
          return settings.notifyEmail;
        case 'match_results':
          return settings.notifyMatchResults;
        case 'tournament_results':
          return settings.notifyTournamentResults;
        default:
          return false;
      }
    } catch (error) {
      this.logger.error(`Error checking notification settings for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Получить предпочтения пользователя по соперникам
   */
  async getOpponentPreferences(userId: number): Promise<{
    preferredGender?: string;
    preferredAgeMin?: number;
    preferredAgeMax?: number;
    preferredLevelMin?: number;
    preferredLevelMax?: number;
  }> {
    const settings = await this.getUserSettings(userId);
    
    return {
      preferredGender: settings.preferredGender,
      preferredAgeMin: settings.preferredAgeMin,
      preferredAgeMax: settings.preferredAgeMax,
      preferredLevelMin: settings.preferredLevelMin,
      preferredLevelMax: settings.preferredLevelMax,
    };
  }

  /**
   * Удалить настройки пользователя (при удалении аккаунта)
   */
  async deleteUserSettings(userId: number): Promise<void> {
    try {
      await this.prisma.userSettings.delete({
        where: { userId }
      });
      
      this.logger.log(`Deleted settings for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete settings for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Получить статистику по настройкам (для админки)
   */
  async getSettingsStatistics(): Promise<{
    totalUsers: number;
    languageDistribution: Record<string, number>;
    notificationStats: {
      telegramEnabled: number;
      emailEnabled: number;
      allDisabled: number;
    };
    themeDistribution: Record<string, number>;
  }> {
    const totalUsers = await this.prisma.userSettings.count();
    
    const languageStats = await this.prisma.userSettings.groupBy({
      by: ['language'],
      _count: true,
    });

    const notificationStats = await this.prisma.userSettings.aggregate({
      _count: {
        notifyTelegram: true,
        notifyEmail: true,
        notificationsEnabled: true,
      },
      where: {
        notifyTelegram: true,
      }
    });

    const themeStats = await this.prisma.userSettings.groupBy({
      by: ['theme'],
      _count: true,
    });

    return {
      totalUsers,
      languageDistribution: languageStats.reduce((acc, stat) => {
        acc[stat.language] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      notificationStats: {
        telegramEnabled: notificationStats._count.notifyTelegram || 0,
        emailEnabled: notificationStats._count.notifyEmail || 0,
        allDisabled: totalUsers - (notificationStats._count.notificationsEnabled || 0),
      },
      themeDistribution: themeStats.reduce((acc, stat) => {
        acc[stat.theme] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}