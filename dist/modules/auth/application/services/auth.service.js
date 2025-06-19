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
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, telegramAuthService, userService, achievementsService) {
        this.jwtService = jwtService;
        this.telegramAuthService = telegramAuthService;
        this.userService = userService;
        this.achievementsService = achievementsService;
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
            }
            else {
                this.logger.log(`Existing user found: ${user.id}`);
                user = await this.userService.updateLastLogin(user.id.toString());
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
                    // Логируем ошибку, но не прерываем процесс авторизации
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
        return this.userService.create(userData);
    }
    async refreshToken(userId) {
        this.logger.log(`Обновление токена для пользователя: ${userId}`);
        const user = await this.userService.findById(userId);
        return this.generateJwt(user);
    }
    async logout(userId) {
        this.logger.log(`Выход пользователя: ${userId}`);
        return { success: true };
    }
};
AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        telegram_auth_service_1.TelegramAuthService,
        users_service_1.UsersService,
        achievements_service_1.AchievementsService])
], AuthService);
exports.AuthService = AuthService;
