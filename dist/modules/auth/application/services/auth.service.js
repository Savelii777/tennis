"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const telegram_auth_service_1 = require("../../infrastructure/telegram/telegram-auth.service");
const users_service_1 = require("../../../users/application/services/users.service");
const achievements_service_1 = require("../../../achievements/application/services/achievements.service");
const settings_service_1 = require("../../../settings/settings.service");
const ratings_service_1 = require("../../../ratings/ratings.service"); // Добавляем импорт RatingsService
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, telegramAuthService, userService, achievementsService, settingsService, ratingsService) {
        this.jwtService = jwtService;
        this.telegramAuthService = telegramAuthService;
        this.userService = userService;
        this.achievementsService = achievementsService;
        this.settingsService = settingsService;
        this.ratingsService = ratingsService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async loginTelegram(telegramLoginDto) {
        this.logger.log(`Telegram auth attempt for user: ${telegramLoginDto.username}`);
        try {
            let user = await this.userService.findByTelegramId(telegramLoginDto.id.toString());
            let isNewUser = false;
            if (!user) {
                this.logger.log(`Creating new user for Telegram ID: ${telegramLoginDto.id}`);
                user = await this.userService.createFromTelegram(telegramLoginDto);
                isNewUser = true;
                // Создаем дефолтный рейтинг для нового пользователя
                try {
                    await this.ratingsService.createDefaultRating(user.id);
                    this.logger.log(`Created default rating for new user ${user.id}`);
                }
                catch (ratingError) {
                    this.logger.error(`Failed to create rating for user ${user.id}:`, ratingError);
                    // Не прерываем процесс регистрации из-за ошибки рейтинга
                }
                // Создаем дефолтные настройки для нового пользователя
                try {
                    await this.settingsService.createDefaultSettings(user.id);
                    this.logger.log(`Created default settings for new user ${user.id}`);
                }
                catch (settingsError) {
                    this.logger.error(`Failed to create settings for user ${user.id}:`, settingsError);
                    // Не прерываем процесс регистрации из-за ошибки настроек
                }
            }
            else {
                this.logger.log(`Existing user found: ${user.id}`);
                user = await this.userService.updateLastLogin(user.id.toString());
                // Проверяем, есть ли у существующего пользователя рейтинг
                try {
                    const existingRating = await this.ratingsService.getRatingForUser(user.id);
                    if (!existingRating) {
                        await this.ratingsService.createDefaultRating(user.id);
                        this.logger.log(`Created missing rating for existing user ${user.id}`);
                    }
                }
                catch (ratingError) {
                    this.logger.error(`Failed to check/create rating for existing user ${user.id}:`, ratingError);
                }
                // Проверяем, есть ли у существующего пользователя настройки
                try {
                    const existingSettings = await this.settingsService.getUserSettings(user.id);
                    if (!existingSettings) {
                        await this.settingsService.createDefaultSettings(user.id);
                        this.logger.log(`Created missing settings for existing user ${user.id}`);
                    }
                }
                catch (settingsError) {
                    this.logger.error(`Failed to check/create settings for existing user ${user.id}:`, settingsError);
                }
            }
            // Проверяем, что user не null после создания/обновления
            if (!user) {
                throw new common_1.BadRequestException('Failed to create or find user');
            }
            const tokens = await this.generateTokens(user.id.toString(), user.username);
            // Безопасно проверяем достижения для нового пользователя
            if (isNewUser) {
                try {
                    await this.achievementsService.checkAndAwardAchievements(user.id.toString(), 'registration_completed');
                }
                catch (achievementError) {
                    this.logger.error(`Failed to check achievements for new user ${user.id}:`, achievementError);
                }
            }
            return {
                user: {
                    id: user.id,
                    username: user.username,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    telegramId: user.telegram_id,
                    role: user.role,
                    isVerified: user.is_verified,
                    profile: user.profile,
                },
                tokens,
                isNewUser,
            };
        }
        catch (error) {
            this.logger.error(`Login failed for Telegram user ${telegramLoginDto.username}:`, error);
            throw new common_1.BadRequestException('Ошибка входа через Telegram');
        }
    }
    async generateTokens(userId, username) {
        const payload = { sub: userId, username };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async validateTelegramUser(telegramLoginDto) {
        const { id, hash } = telegramLoginDto;
        this.logger.log(`Валидация пользователя Telegram: ${telegramLoginDto.username} (ID: ${id})`);
        const isValid = this.telegramAuthService.validateTelegramSignature(id, hash);
        this.logger.log(`Проверка подписи Telegram: ${isValid ? 'успешно' : 'неудачно'}`);
        if (!isValid) {
            this.logger.error(`Неверная подпись Telegram для ID: ${id}`);
            throw new Error('Invalid Telegram login');
        }
        let user = await this.userService.findByTelegramId(id);
        if (!user) {
            this.logger.log(`Пользователь не найден, создаем новый аккаунт для ${telegramLoginDto.username}`);
            user = await this.userService.create({
                telegram_id: id,
                username: telegramLoginDto.username || `user_${id}`,
                first_name: telegramLoginDto.first_name,
                last_name: telegramLoginDto.last_name,
            });
            // Создаем рейтинг и настройки для нового пользователя
            try {
                await this.ratingsService.createDefaultRating(user.id);
                await this.settingsService.createDefaultSettings(user.id);
                this.logger.log(`Created rating and settings for new user: ${user.username} (ID: ${user.id})`);
            }
            catch (error) {
                this.logger.error(`Failed to create rating/settings for new user ${user.id}:`, error);
            }
            this.logger.log(`Создан новый пользователь: ${user.username} (ID: ${user.id})`);
        }
        else {
            this.logger.log(`Пользователь найден: ${user.username} (ID: ${user.id})`);
        }
        return user;
    }
    async generateJwt(user) {
        this.logger.log(`Генерация JWT для пользователя: ${user.username} (ID: ${user.id})`);
        const payload = { sub: user.id, username: user.username, role: user.role };
        this.logger.debug(`JWT payload: ${JSON.stringify(payload)}`);
        const token = this.jwtService.sign(payload);
        this.logger.debug(`JWT токен создан, длина: ${token.length}`);
        return {
            access_token: token,
        };
    }
    async validateUser(telegramId) {
        this.logger.log(`Валидация пользователя по Telegram ID: ${telegramId}`);
        return this.userService.findByTelegramId(telegramId);
    }
    async getProfile(userId) {
        this.logger.log(`Получение профиля пользователя: ${userId}`);
        return this.userService.findById(userId);
    }
    async findUserByTelegramId(telegramId) {
        return this.userService.findByTelegramId(telegramId);
    }
    async createUserFromTelegram(telegramData) {
        const userData = {
            telegram_id: telegramData.id,
            username: telegramData.username || `user_${telegramData.id}`,
            first_name: telegramData.first_name,
            last_name: telegramData.last_name || null,
            photo_url: telegramData.photo_url || null,
        };
        const user = await this.userService.create(userData);
        // Создаем рейтинг и настройки для нового пользователя
        try {
            await this.ratingsService.createDefaultRating(user.id);
            await this.settingsService.createDefaultSettings(user.id);
            this.logger.log(`Created rating and settings for new Telegram user ${user.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to create rating/settings for new Telegram user ${user.id}:`, error);
        }
        return user;
    }
    async refreshToken(userId) {
        this.logger.log(`Обновление токена для пользователя: ${userId}`);
        const user = await this.userService.findById(userId);
        return this.generateTokens(user.id.toString(), user.username);
    }
    async logout(userId) {
        this.logger.log(`Выход пользователя: ${userId}`);
        return { message: 'Успешный выход из системы' };
    }
    /**
     * Получить рейтинг пользователя (вспомогательный метод)
     */
    async getUserRating(userId) {
        try {
            return await this.ratingsService.getRatingForUser(parseInt(userId));
        }
        catch (error) {
            this.logger.error(`Failed to get rating for user ${userId}:`, error);
            return null;
        }
    }
    /**
     * Получить настройки пользователя (вспомогательный метод)
     */
    async getUserSettings(userId) {
        try {
            return await this.settingsService.getUserSettings(parseInt(userId));
        }
        catch (error) {
            this.logger.error(`Failed to get settings for user ${userId}:`, error);
            return null;
        }
    }
    /**
     * Полная информация о пользователе (профиль + рейтинг + настройки)
     */
    async getFullUserProfile(userId) {
        try {
            const [user, rating, settings] = await Promise.all([
                this.getProfile(userId),
                this.getUserRating(userId),
                this.getUserSettings(userId),
            ]);
            return {
                user,
                rating,
                settings,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get full profile for user ${userId}:`, error);
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        telegram_auth_service_1.TelegramAuthService,
        users_service_1.UsersService,
        achievements_service_1.AchievementsService,
        settings_service_1.SettingsService,
        ratings_service_1.RatingsService])
], AuthService);
