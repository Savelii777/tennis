import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from '../../infrastructure/repositories/notifications.repository';
import { TelegramService } from '../../../telegram/telegram.service';
import { UsersService } from '../../../users/application/services/users.service';
import { CreateNotificationData, NotificationFilters, NotificationPagination } from '../../domain/interfaces/notification.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly telegramService: TelegramService,
    private readonly usersService: UsersService,
  ) {}

  async createNotification(data: CreateNotificationData): Promise<void> {
    try {
      // Создаем уведомление в базе
      const notification = await this.notificationsRepository.create({
        userId: data.userId,
        type: data.type,
        message: data.message,
        payload: data.payload,
      });

      this.logger.log(`Создано уведомление ${notification.id} для пользователя ${data.userId}`);

      // Отправляем через Telegram если требуется
      if (data.sendTelegram !== false) {
        await this.sendTelegramNotification(data.userId, data.message);
        await this.notificationsRepository.updateSentStatus(notification.id);
      }
    } catch (error) {
      this.logger.error(`Ошибка создания уведомления: ${error}`);
      throw error;
    }
  }

  async getNotifications(
    userId: number,
    filters: NotificationFilters,
    pagination: NotificationPagination,
  ) {
    return this.notificationsRepository.findByUserId(userId, filters, pagination);
  }

  async markAsRead(notificationId: number, userId: number): Promise<void> {
    await this.notificationsRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationsRepository.getUnreadCount(userId);
  }

  // Методы для различных типов уведомлений
  async sendMatchScheduledNotification(userId: number, matchData: any): Promise<void> {
    const message = `🎾 У вас матч ${matchData.date} в ${matchData.time} на корте "${matchData.court}"`;
    
    await this.createNotification({
      userId,
      type: 'MATCH_SCHEDULED',
      message,
      payload: {
        matchId: matchData.matchId,
        court: matchData.court,
        time: matchData.time,
        opponent: matchData.opponent,
      },
      sendTelegram: true,
    });
  }

  async sendMatchReminderNotification(userId: number, matchData: any): Promise<void> {
    const message = `⏰ Напоминание: матч сегодня в ${matchData.time} на корте "${matchData.court}"`;
    
    await this.createNotification({
      userId,
      type: 'MATCH_REMINDER',
      message,
      payload: {
        matchId: matchData.matchId,
        court: matchData.court,
        time: matchData.time,
      },
      sendTelegram: true,
    });
  }

  async sendInviteNotification(userId: number, inviteData: any): Promise<void> {
    const message = `🤝 ${inviteData.senderName} приглашает вас на матч ${inviteData.date}`;
    
    await this.createNotification({
      userId,
      type: 'NEW_INVITE',
      message,
      payload: {
        inviteId: inviteData.inviteId,
        senderName: inviteData.senderName,
        date: inviteData.date,
        court: inviteData.court,
      },
      sendTelegram: true,
    });
  }

  async sendTournamentResultNotification(userId: number, resultData: any): Promise<void> {
    const message = `🏆 Вы заняли ${resultData.place}-е место в турнире "${resultData.tournamentName}"`;
    
    await this.createNotification({
      userId,
      type: 'TOURNAMENT_RESULT',
      message,
      payload: {
        tournamentId: resultData.tournamentId,
        tournamentName: resultData.tournamentName,
        place: resultData.place,
        prize: resultData.prize,
      },
      sendTelegram: true,
    });
  }

  async sendReferralBonusNotification(userId: number, bonusData: any): Promise<void> {
    const message = `💰 Вы получили ${bonusData.amount} мячей за приглашение друга!`;
    
    await this.createNotification({
      userId,
      type: 'REFERRAL_BONUS',
      message,
      payload: {
        amount: bonusData.amount,
        referredUser: bonusData.referredUser,
      },
      sendTelegram: true,
    });
  }

  private async sendTelegramNotification(userId: number, message: string): Promise<void> {
    try {
      await this.telegramService.sendNotification(userId, message);
      this.logger.log(`Telegram уведомление отправлено пользователю ${userId}`);
    } catch (error) {
      this.logger.error(`Ошибка отправки Telegram уведомления пользователю ${userId}: ${error}`);
      // Не бросаем ошибку, чтобы не прерывать создание уведомления
    }
  }
}