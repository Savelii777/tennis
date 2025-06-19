import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../../prisma/prisma.service';
import { BotContext } from './interfaces/context.interface';
export declare class TelegramService {
    private readonly bot;
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    constructor(bot: Telegraf<BotContext>, configService: ConfigService, prisma: PrismaService);
    /**
     * Отправка обычного текстового сообщения
     */
    sendMessage(chatId: number | string, text: string, extra?: any): Promise<any>;
    /**
     * Отправка фото с подписью
     */
    sendPhoto(chatId: number | string, photo: string, extra?: any): Promise<any>;
    /**
     * Отправка группы медиафайлов
     */
    sendMediaGroup(chatId: number | string, media: any[]): Promise<any>;
    /**
     * Основной метод для отправки уведомлений пользователям
     */
    sendNotification(userId: number | string, message: string, options?: {
        parseMode?: 'Markdown' | 'HTML';
        disableWebPagePreview?: boolean;
        replyMarkup?: any;
    }): Promise<void>;
    /**
     * Отправка уведомления с фото
     */
    sendNotificationWithPhoto(userId: number | string, photo: string, caption: string, options?: any): Promise<void>;
    /**
     * Массовая отправка уведомлений
     */
    sendBulkNotifications(userIds: (number | string)[], message: string, options?: {
        delay?: number;
        batchSize?: number;
    }): Promise<void>;
    /**
     * Уведомление о назначенном матче
     */
    sendMatchNotification(userId: number | string, matchData: {
        opponentName: string;
        date: string;
        time: string;
        court: string;
        matchId?: number;
    }): Promise<void>;
    /**
     * Напоминание о матче
     */
    sendMatchReminder(userId: number | string, matchData: {
        opponentName: string;
        time: string;
        court: string;
        minutesUntil: number;
    }): Promise<void>;
    /**
     * Уведомление о новом приглашении
     */
    sendInviteNotification(userId: number | string, inviteData: {
        senderName: string;
        gameType: string;
        date: string;
        court?: string;
        inviteId: number;
    }): Promise<void>;
    /**
     * Уведомление о результатах турнира
     */
    sendTournamentResultNotification(userId: number | string, resultData: {
        tournamentName: string;
        place: number;
        prize?: string;
        participantsCount: number;
    }): Promise<void>;
    /**
     * Уведомление о бонусах за реферала
     */
    sendReferralBonusNotification(userId: number | string, bonusData: {
        amount: number;
        referredUserName: string;
        totalBalance: number;
    }): Promise<void>;
    /**
     * Системное уведомление
     */
    sendSystemNotification(userId: number | string, title: string, message: string, isImportant?: boolean): Promise<void>;
    /**
     * Получение Telegram chat_id пользователя из базы данных
     */
    private getTelegramChatId;
    /**
     * Проверка, включены ли уведомления у пользователя
     */
    private areNotificationsEnabled;
    /**
     * Обработка заблокированного пользователя
     */
    private handleBlockedUser;
    /**
     * Обновление chat_id пользователя
     */
    updateUserChatId(userId: number | string, chatId: number | string): Promise<void>;
    /**
     * Включение/отключение уведомлений для пользователя
     */
    toggleNotifications(userId: number | string, enabled: boolean): Promise<void>;
    /**
     * Получение статистики отправки уведомлений
     */
    getNotificationStats(): Promise<{
        totalUsers: number;
        enabledUsers: number;
        disabledUsers: number;
    }>;
}
