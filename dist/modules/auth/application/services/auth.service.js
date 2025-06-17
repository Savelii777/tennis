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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const telegram_auth_service_1 = require("../../infrastructure/telegram/telegram-auth.service");
const users_service_1 = require("../../../users/application/services/users.service");
let AuthService = class AuthService {
    constructor(jwtService, telegramAuthService, userService) {
        this.jwtService = jwtService;
        this.telegramAuthService = telegramAuthService;
        this.userService = userService;
        this.logger = new common_1.Logger('AuthService');
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
    async loginTelegram(telegramData) {
        const user = await this.validateTelegramUser(telegramData);
        const tokenData = await this.generateJwt(user);
        return {
            user: {
                id: user.id,
                telegram_id: user.telegram_id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
            },
            ...tokenData,
        };
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        telegram_auth_service_1.TelegramAuthService,
        users_service_1.UsersService])
], AuthService);
exports.AuthService = AuthService;
