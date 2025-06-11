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
    }
    async validateTelegramUser(telegramLoginDto) {
        const { id, hash } = telegramLoginDto;
        const isValid = this.telegramAuthService.validateTelegramSignature(id, hash);
        if (!isValid) {
            throw new Error('Invalid Telegram login');
        }
        let user = await this.userService.findByTelegramId(id);
        if (!user) {
            user = await this.userService.create({
                telegram_id: id,
                username: telegramLoginDto.username,
                first_name: telegramLoginDto.first_name,
                last_name: telegramLoginDto.last_name,
            });
        }
        return user;
    }
    async generateJwt(user) {
        const payload = { sub: user.id, username: user.username, role: user.role };
        return {
            access_token: this.jwtService.sign(payload), // Изменено на snake_case для соответствия конвенции
        };
    }
    async validateUser(telegramId) {
        return this.userService.findByTelegramId(telegramId);
    }
    async getProfile(userId) {
        return this.userService.findById(userId);
    }
    async refreshToken(userId) {
        const user = await this.userService.findById(userId);
        return this.generateJwt(user);
    }
    async logout(userId) {
        // Implement logout logic if needed
        return { success: true };
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        telegram_auth_service_1.TelegramAuthService,
        users_service_1.UsersService])
], AuthService);
exports.AuthService = AuthService;
