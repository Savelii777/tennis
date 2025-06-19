export declare class UpdateSettingsDto {
    language?: string;
    cityId?: number;
    sportId?: number;
    notificationsEnabled?: boolean;
    notifyTelegram?: boolean;
    notifyEmail?: boolean;
    matchReminderTime?: string;
    notifyMatchResults?: boolean;
    notifyTournamentResults?: boolean;
    showProfilePublicly?: boolean;
    showRatingPublicly?: boolean;
    allowMatchInvites?: boolean;
    requireMatchConfirm?: boolean;
    preferredGender?: string;
    preferredAgeMin?: number;
    preferredAgeMax?: number;
    preferredLevelMin?: number;
    preferredLevelMax?: number;
    theme?: string;
    timezone?: string;
    telegramChatId?: string;
}
export declare class LanguageDto {
    language: string;
}
export declare class NotificationSettingsDto {
    notificationsEnabled: boolean;
    notifyTelegram?: boolean;
    notifyEmail?: boolean;
    matchReminderTime?: string;
}
