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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("../../application/services/auth.service");
const auth_guard_1 = require("../../../../common/guards/auth.guard");
const telegram_login_dto_1 = require("../dto/telegram-login.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger('AuthController');
        const path = 'login/telegram';
        this.logger.log(`Auth controller initialized. Login path: /auth/${path}`);
    }
    async loginWithTelegram(telegramLoginDto) {
        this.logger.log(`Попытка входа через Telegram: ${telegramLoginDto.username} (ID: ${telegramLoginDto.id})`);
        this.logger.debug(`Данные телеграм: ${JSON.stringify(telegramLoginDto)}`);
        try {
            const user = await this.authService.validateTelegramUser(telegramLoginDto);
            this.logger.log(`Пользователь валидирован: ${user.username} (ID: ${user.id})`);
            const jwtResult = await this.authService.generateJwt(user);
            this.logger.log(`JWT токен сгенерирован, длина: ${jwtResult.access_token.length}`);
            this.logger.debug(`Токен: ${jwtResult.access_token.substring(0, 20)}...`);
            return jwtResult;
        }
        catch (error) {
            this.logger.error(`Ошибка при входе: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            throw error;
        }
    }
    getProfile(request) {
        this.logger.log(`Запрос профиля пользователя: ${request.user.id}`);
        return this.authService.getProfile(request.user.id);
    }
    refreshToken(request) {
        this.logger.log(`Запрос обновления токена: ${request.user.id}`);
        return this.authService.refreshToken(request.user.id);
    }
    logout(request) {
        this.logger.log(`Запрос выхода: ${request.user.id}`);
        return this.authService.logout(request.user.id);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login/telegram'),
    (0, swagger_1.ApiOperation)({ summary: 'Login with Telegram' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Успешная авторизация' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Неверные данные запроса' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegram_login_dto_1.TelegramLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginWithTelegram", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get authenticated user profile' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh JWT token' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
