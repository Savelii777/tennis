import { JwtService } from '@nestjs/jwt';
import { TelegramAuthService } from '../../infrastructure/telegram/telegram-auth.service';
import { UsersService } from '../../../users/application/services/users.service';
import { TelegramLoginDto } from '../../presentation/dto/telegram-login.dto';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { AchievementsService } from '../../../achievements/application/services/achievements.service';
import { SettingsService } from '../../../settings/settings.service';
import { RatingsService } from '../../../ratings/ratings.service';
export declare class AuthService {
    private jwtService;
    private telegramAuthService;
    private userService;
    private readonly achievementsService;
    private readonly settingsService;
    private readonly ratingsService;
    private readonly logger;
    constructor(jwtService: JwtService, telegramAuthService: TelegramAuthService, userService: UsersService, achievementsService: AchievementsService, settingsService: SettingsService, ratingsService: RatingsService);
    loginTelegram(telegramLoginDto: TelegramLoginDto): Promise<any>;
    private generateTokens;
    validateTelegramUser(telegramLoginDto: TelegramLoginDto): Promise<UserEntity>;
    generateJwt(user: UserEntity): Promise<{
        access_token: string;
    }>;
    validateUser(telegramId: string): Promise<UserEntity | null>;
    getProfile(userId: string): Promise<UserEntity>;
    findUserByTelegramId(telegramId: string): Promise<UserEntity | null>;
    createUserFromTelegram(telegramData: any): Promise<UserEntity>;
    refreshToken(userId: string): Promise<any>;
    logout(userId: string): Promise<any>;
    /**
     * Получить рейтинг пользователя (вспомогательный метод)
     */
    getUserRating(userId: string): Promise<any>;
    /**
     * Получить настройки пользователя (вспомогательный метод)
     */
    getUserSettings(userId: string): Promise<any>;
    /**
     * Полная информация о пользователе (профиль + рейтинг + настройки)
     */
    getFullUserProfile(userId: string): Promise<any>;
}
