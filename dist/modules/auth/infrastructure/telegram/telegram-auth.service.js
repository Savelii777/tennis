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
exports.TelegramAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../../../users/application/services/users.service");
let TelegramAuthService = class TelegramAuthService {
    constructor(configService, jwtService, usersService) {
        this.configService = configService;
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.botToken = this.configService.get('telegram.botToken') || '';
        this.apiUrl = this.configService.get('TELEGRAM_API_URL') || '';
    }
    validateTelegramSignature(telegramId, hash) {
        // Implement your validation logic here
        return true; // Placeholder
    }
    async getUserInfo(telegramId) {
        // Implement getting user info from Telegram API
        return { id: telegramId };
    }
    async validateUser(telegramLoginDto) {
        const { id, username, first_name, auth_date } = telegramLoginDto;
        // Validate the auth_date and other parameters as needed
        const user = await this.usersService.findByTelegramId(id);
        if (user) {
            return user;
        }
        // If user does not exist, create a new user
        return this.usersService.create({
            telegram_id: id,
            username,
            first_name,
            // Add other necessary fields
        });
    }
    async login(user) {
        const payload = { id: user.id, username: user.username, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
};
TelegramAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        users_service_1.UsersService])
], TelegramAuthService);
exports.TelegramAuthService = TelegramAuthService;
