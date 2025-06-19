import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto, NotificationSettingsDto } from './dto/settings.dto';
export declare class SettingsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Получить настройки пользователя или создать дефолтные
     */
    getUserSettings(userId: number): Promise<any>;
    /**
     * Создать дефолтные настройки для пользователя
     */
    createDefaultSettings(userId: number): Promise<any>;
    /**
     * Обновить настройки пользователя
     */
    updateSettings(userId: number, updateData: UpdateSettingsDto): Promise<any>;
    /**
     * Изменить язык интерфейса
     */
    updateLanguage(userId: number, language: string): Promise<any>;
    /**
     * Обновить настройки уведомлений
     */
    updateNotificationSettings(userId: number, notificationData: NotificationSettingsDto): Promise<any>;
    /**
     * Переключить все уведомления
     */
    toggleNotifications(userId: number, enabled: boolean): Promise<any>;
    /**
     * Обновить Telegram Chat ID
     */
    updateTelegramChatId(userId: number, telegramChatId: string): Promise<any>;
    /**
     * Получить пользователей с включенными Telegram уведомлениями
     */
    getUsersWithTelegramNotifications(): Promise<any[]>;
    /**
     * Получить настройки уведомлений пользователя
     */
    getNotificationSettings(userId: number): Promise<{
        notificationsEnabled: boolean;
        notifyTelegram: boolean;
        notifyEmail: boolean;
        matchReminderTime: string;
        notifyMatchResults: boolean;
        notifyTournamentResults: boolean;
    }>;
    /**
     * Проверить, нужно ли отправлять уведомление пользователю
     */
    shouldNotifyUser(userId: number, notificationType: 'telegram' | 'email' | 'match_results' | 'tournament_results'): Promise<boolean>;
    /**
     * Получить предпочтения пользователя по соперникам
     */
    getOpponentPreferences(userId: number): Promise<{
        preferredGender?: string;
        preferredAgeMin?: number;
        preferredAgeMax?: number;
        preferredLevelMin?: number;
        preferredLevelMax?: number;
    }>;
    /**
     * Удалить настройки пользователя (при удалении аккаунта)
     */
    deleteUserSettings(userId: number): Promise<void>;
    /**
     * Получить статистику по настройкам (для админки)
     */
    getSettingsStatistics(): Promise<{
        totalUsers: number;
        languageDistribution: Record<string, number>;
        notificationStats: {
            telegramEnabled: number;
            emailEnabled: number;
            allDisabled: number;
        };
        themeDistribution: Record<string, number>;
    }>;
}
