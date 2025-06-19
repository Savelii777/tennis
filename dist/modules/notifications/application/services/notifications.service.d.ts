import { NotificationsRepository } from '../../infrastructure/repositories/notifications.repository';
import { TelegramService } from '../../../telegram/telegram.service';
import { UsersService } from '../../../users/application/services/users.service';
import { CreateNotificationData, NotificationFilters, NotificationPagination } from '../../domain/interfaces/notification.interface';
export declare class NotificationsService {
    private readonly notificationsRepository;
    private readonly telegramService;
    private readonly usersService;
    private readonly logger;
    constructor(notificationsRepository: NotificationsRepository, telegramService: TelegramService, usersService: UsersService);
    createNotification(data: CreateNotificationData): Promise<void>;
    getNotifications(userId: number, filters: NotificationFilters, pagination: NotificationPagination): Promise<import("../../domain/interfaces/notification.interface").NotificationInterface[]>;
    markAsRead(notificationId: number, userId: number): Promise<void>;
    markAllAsRead(userId: number): Promise<void>;
    getUnreadCount(userId: number): Promise<number>;
    sendMatchScheduledNotification(userId: number, matchData: any): Promise<void>;
    sendMatchReminderNotification(userId: number, matchData: any): Promise<void>;
    sendInviteNotification(userId: number, inviteData: any): Promise<void>;
    sendTournamentResultNotification(userId: number, resultData: any): Promise<void>;
    sendReferralBonusNotification(userId: number, bonusData: any): Promise<void>;
    private sendTelegramNotification;
}
