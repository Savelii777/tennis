import { SettingsService } from './settings.service';
import { UpdateSettingsDto, LanguageDto, NotificationSettingsDto } from './dto/settings.dto';
interface RequestWithUser extends Request {
    user: {
        id: string;
        username: string;
    };
}
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getMySettings(req: RequestWithUser): Promise<any>;
    updateSettings(req: RequestWithUser, updateData: UpdateSettingsDto): Promise<any>;
    updateLanguage(req: RequestWithUser, languageData: LanguageDto): Promise<any>;
    updateNotificationSettings(req: RequestWithUser, notificationData: NotificationSettingsDto): Promise<any>;
    toggleNotifications(req: RequestWithUser, data: {
        enabled: boolean;
    }): Promise<any>;
    getOpponentPreferences(req: RequestWithUser): Promise<{
        preferredGender?: string | undefined;
        preferredAgeMin?: number | undefined;
        preferredAgeMax?: number | undefined;
        preferredLevelMin?: number | undefined;
        preferredLevelMax?: number | undefined;
    }>;
}
export {};
