import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../../prisma/prisma.service';
import { BotContext } from './interfaces/context.interface';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<BotContext>,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // ==================== БАЗОВЫЕ МЕТОДЫ ОТПРАВКИ ====================

  /**
   * Отправка обычного текстового сообщения
   */
  async sendMessage(chatId: number | string, text: string, extra?: any): Promise<any> {
    try {
      return await this.bot.telegram.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        ...extra,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending message to ${chatId}: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Отправка фото с подписью
   */
  async sendPhoto(chatId: number | string, photo: string, extra?: any): Promise<any> {
    try {
      return await this.bot.telegram.sendPhoto(chatId, photo, {
        parse_mode: 'Markdown',
        ...extra,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending photo to ${chatId}: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Отправка группы медиафайлов
   */
  async sendMediaGroup(chatId: number | string, media: any[]): Promise<any> {
    try {
      return await this.bot.telegram.sendMediaGroup(chatId, media);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending media group to ${chatId}: ${errorMsg}`);
      throw error;
    }
  }

  // ==================== СИСТЕМА УВЕДОМЛЕНИЙ ====================

  /**
   * Основной метод для отправки уведомлений пользователям
   */


async sendNotification(userId: number | string, message: string, options?: {
  parseMode?: 'Markdown' | 'HTML';
  disableWebPagePreview?: boolean;
  replyMarkup?: any;
}): Promise<void> {
  try {
    const telegramChatId = await this.getTelegramChatId(userId);
    
    if (!telegramChatId) {
      this.logger.warn(`Не найден chat_id для пользователя ${userId}`);
      return;
    }

    // Проверяем, включены ли уведомления у пользователя
    const notificationsEnabled = await this.areNotificationsEnabled(userId);
    if (!notificationsEnabled) {
      this.logger.log(`Уведомления отключены для пользователя ${userId}`);
      return;
    }

    await this.bot.telegram.sendMessage(telegramChatId, message, {
      parse_mode: options?.parseMode || 'Markdown',
      // Убираем disable_web_page_preview
      reply_markup: options?.replyMarkup,
    });

    this.logger.log(`✅ Уведомление отправлено пользователю ${userId}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    this.logger.error(`❌ Ошибка отправки уведомления пользователю ${userId}: ${errorMsg}`);
    
    // Если ошибка связана с блокировкой бота пользователем
    if (errorMsg.includes('blocked') || errorMsg.includes('chat not found')) {
      await this.handleBlockedUser(userId);
    }
  }
}

  /**
   * Отправка уведомления с фото
   */
  async sendNotificationWithPhoto(
    userId: number | string, 
    photo: string, 
    caption: string,
    options?: any
  ): Promise<void> {
    try {
      const telegramChatId = await this.getTelegramChatId(userId);
      
      if (!telegramChatId) {
        this.logger.warn(`Не найден chat_id для пользователя ${userId}`);
        return;
      }

      const notificationsEnabled = await this.areNotificationsEnabled(userId);
      if (!notificationsEnabled) {
        this.logger.log(`Уведомления отключены для пользователя ${userId}`);
        return;
      }

      await this.bot.telegram.sendPhoto(telegramChatId, photo, {
        caption,
        parse_mode: 'Markdown',
        ...options,
      });

      this.logger.log(`✅ Уведомление с фото отправлено пользователю ${userId}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Ошибка отправки уведомления с фото пользователю ${userId}: ${errorMsg}`);
    }
  }

  /**
   * Массовая отправка уведомлений
   */
  async sendBulkNotifications(
    userIds: (number | string)[], 
    message: string,
    options?: {
      delay?: number; // задержка между отправками в мс
      batchSize?: number; // размер батча
    }
  ): Promise<void> {
    const delay = options?.delay || 100; // 100мс между сообщениями
    const batchSize = options?.batchSize || 10; // по 10 сообщений в батче
    
    this.logger.log(`📤 Массовая отправка уведомлений для ${userIds.length} пользователей`);

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      const promises = batch.map(async (userId, index) => {
        // Добавляем небольшую задержку для избежания rate limit
        await new Promise(resolve => setTimeout(resolve, index * delay));
        return this.sendNotification(userId, message);
      });

      await Promise.allSettled(promises);
      
      // Пауза между батчами
      if (i + batchSize < userIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.logger.log(`✅ Массовая отправка завершена`);
  }

  // ==================== СПЕЦИАЛИЗИРОВАННЫЕ УВЕДОМЛЕНИЯ ====================

  /**
   * Уведомление о назначенном матче
   */
  async sendMatchNotification(
    userId: number | string,
    matchData: {
      opponentName: string;
      date: string;
      time: string;
      court: string;
      matchId?: number;
    }
  ): Promise<void> {
    const message = 
      `🎾 **Новый матч назначен!**\n\n` +
      `👤 **Соперник:** ${matchData.opponentName}\n` +
      `📅 **Дата:** ${matchData.date}\n` +
      `⏰ **Время:** ${matchData.time}\n` +
      `📍 **Корт:** ${matchData.court}\n\n` +
      `Удачи в игре! 🏆`;

    await this.sendNotification(userId, message);
  }

  /**
   * Напоминание о матче
   */
  async sendMatchReminder(
    userId: number | string,
    matchData: {
      opponentName: string;
      time: string;
      court: string;
      minutesUntil: number;
    }
  ): Promise<void> {
    const message = 
      `⏰ **Напоминание о матче!**\n\n` +
      `🎾 Ваш матч с **${matchData.opponentName}** начинается через **${matchData.minutesUntil} минут**\n\n` +
      `📍 **Корт:** ${matchData.court}\n` +
      `⏰ **Время:** ${matchData.time}\n\n` +
      `Не опаздывайте! 🏃‍♂️`;

    await this.sendNotification(userId, message);
  }

  /**
   * Уведомление о новом приглашении
   */
  async sendInviteNotification(
    userId: number | string,
    inviteData: {
      senderName: string;
      gameType: string;
      date: string;
      court?: string;
      inviteId: number;
    }
  ): Promise<void> {
    const message = 
      `🤝 **Новое приглашение!**\n\n` +
      `👤 **От:** ${inviteData.senderName}\n` +
      `🎾 **Тип игры:** ${inviteData.gameType}\n` +
      `📅 **Дата:** ${inviteData.date}\n` +
      `${inviteData.court ? `📍 **Корт:** ${inviteData.court}\n` : ''}` +
      `\nОтветьте в приложении! 📱`;

    await this.sendNotification(userId, message);
  }

  /**
   * Уведомление о результатах турнира
   */
  async sendTournamentResultNotification(
    userId: number | string,
    resultData: {
      tournamentName: string;
      place: number;
      prize?: string;
      participantsCount: number;
    }
  ): Promise<void> {
    const medal = resultData.place === 1 ? '🥇' : 
                  resultData.place === 2 ? '🥈' : 
                  resultData.place === 3 ? '🥉' : '🏅';

    const message = 
      `🏆 **Результаты турнира!**\n\n` +
      `${medal} **Место:** ${resultData.place} из ${resultData.participantsCount}\n` +
      `🎾 **Турнир:** ${resultData.tournamentName}\n` +
      `${resultData.prize ? `💰 **Приз:** ${resultData.prize}\n` : ''}` +
      `\nПоздравляем! 🎉`;

    await this.sendNotification(userId, message);
  }

  /**
   * Уведомление о бонусах за реферала
   */
  async sendReferralBonusNotification(
    userId: number | string,
    bonusData: {
      amount: number;
      referredUserName: string;
      totalBalance: number;
    }
  ): Promise<void> {
    const message = 
      `💰 **Бонус за приглашение!**\n\n` +
      `🎾 Вы получили **${bonusData.amount} мячей** за приглашение игрока **${bonusData.referredUserName}**!\n\n` +
      `💳 **Текущий баланс:** ${bonusData.totalBalance} мячей\n\n` +
      `Продолжайте приглашать друзей! 🔗`;

    await this.sendNotification(userId, message);
  }

  /**
   * Системное уведомление
   */
  async sendSystemNotification(
    userId: number | string,
    title: string,
    message: string,
    isImportant = false
  ): Promise<void> {
    const icon = isImportant ? '🚨' : 'ℹ️';
    const formattedMessage = 
      `${icon} **${title}**\n\n` +
      `${message}`;

    await this.sendNotification(userId, formattedMessage);
  }

  // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================

  /**
   * Получение Telegram chat_id пользователя из базы данных
   */
private async getTelegramChatId(userId: number | string): Promise<number | null> {
  try {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { 
        telegramChatId: true, 
        telegramId: true,
      },
    });

    if (!user) {
      this.logger.warn(`Пользователь ${userId} не найден в базе данных`);
      return null;
    }

    // Приоритет: telegramChatId из user, затем telegramId
    if (user.telegramChatId) {
      return Number(user.telegramChatId);
    }

    if (user.telegramId) {
      return Number(user.telegramId);
    }

    this.logger.warn(`Не найден chat_id для пользователя ${userId}`);
    return null;
  } catch (error) {
    this.logger.error(`Ошибка получения chat_id для пользователя ${userId}: ${error}`);
    return null;
  }
}

  /**
   * Проверка, включены ли уведомления у пользователя
   */
private async areNotificationsEnabled(userId: number | string): Promise<boolean> {
  try {
    const userSettings = await this.prisma.userSettings.findUnique({
      where: { userId: Number(userId) },
      select: { notificationsEnabled: true }
    });

    return userSettings?.notificationsEnabled ?? true; // по умолчанию включены
  } catch (error) {
    this.logger.error(`Ошибка проверки настроек уведомлений для пользователя ${userId}: ${error}`);
    return true; // в случае ошибки считаем что включены
  }
}

  /**
   * Обработка заблокированного пользователя
   */
private async handleBlockedUser(userId: number | string): Promise<void> {
  try {
    // Отключаем уведомления для заблокировавшего бота пользователя
    await this.prisma.userSettings.upsert({
      where: { userId: Number(userId) },
      update: { notificationsEnabled: false },
      create: { 
        userId: Number(userId),
        notificationsEnabled: false 
      }
    });

    this.logger.log(`🚫 Пользователь ${userId} заблокировал бота. Уведомления отключены.`);
  } catch (error) {
    this.logger.error(`Ошибка обработки блокировки пользователя ${userId}: ${error}`);
  }
}

  /**
   * Обновление chat_id пользователя
   */

async updateUserChatId(userId: number | string, chatId: number | string): Promise<void> {
  try {
    // Сначала находим пользователя по telegramId
    const user = await this.prisma.user.findUnique({
      where: { telegramId: userId.toString() }
    });
    
    if (!user) {
      this.logger.warn(`Пользователь с Telegram ID ${userId} не найден`);
      return;
    }

    const internalUserId = user.id;
    
    // Обновляем telegramChatId в таблице User
    await this.prisma.user.update({
      where: { id: internalUserId },
      data: { telegramChatId: BigInt(chatId) }
    });

    // Проверяем существование записи в userSettings перед upsert
    const existingSettings = await this.prisma.userSettings.findUnique({
      where: { userId: internalUserId }
    });

    if (existingSettings) {
      // Если запись уже существует - используем update
      await this.prisma.userSettings.update({
        where: { userId: internalUserId },
        data: { 
          telegramChatId: chatId.toString(),
          notificationsEnabled: true 
        }
      });
    } else {
      // Если записи нет - используем create
      await this.prisma.userSettings.create({
        data: { 
          userId: internalUserId,
          telegramChatId: chatId.toString(),
          notificationsEnabled: true 
        }
      });
    }

    this.logger.log(`✅ Обновлен chat_id для пользователя ${internalUserId}: ${chatId}`);
  } catch (error) {
    this.logger.error(`Ошибка обновления chat_id для пользователя ${userId}: ${error}`);
  }
}


  /**
   * Включение/отключение уведомлений для пользователя
   */

async toggleNotifications(userId: number | string, enabled: boolean): Promise<void> {
  try {
    await this.prisma.userSettings.upsert({
      where: { userId: Number(userId) },
      update: { notificationsEnabled: enabled },
      create: { 
        userId: Number(userId),
        notificationsEnabled: enabled 
      }
    });

    this.logger.log(`${enabled ? '🔔' : '🔕'} Уведомления ${enabled ? 'включены' : 'отключены'} для пользователя ${userId}`);
  } catch (error) {
    this.logger.error(`Ошибка изменения настроек уведомлений для пользователя ${userId}: ${error}`);
  }
}

  /**
   * Получение статистики отправки уведомлений
   */
async getNotificationStats(): Promise<{
  totalUsers: number;
  enabledUsers: number;
  disabledUsers: number;
}> {
  try {
    const totalUsers = await this.prisma.user.count();
    
    const enabledUsers = await this.prisma.userSettings.count({
      where: { notificationsEnabled: true }
    });
    
    const disabledUsers = await this.prisma.userSettings.count({
      where: { notificationsEnabled: false }
    });

    return {
      totalUsers,
      enabledUsers,
      disabledUsers: disabledUsers
    };
  } catch (error) {
    this.logger.error(`Ошибка получения статистики уведомлений: ${error}`);
    return { totalUsers: 0, enabledUsers: 0, disabledUsers: 0 };
  }
}
}