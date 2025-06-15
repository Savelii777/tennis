"use strict";
// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as crypto from 'crypto';
// import { TelegramLoginDto } from '../../presentation/dto/telegram-login.dto';
// import { JwtService } from '@nestjs/jwt';
// import { UsersService } from '../../../users/application/services/users.service';
// import { User } from '../../../users/domain/entities/user.entity';
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
// @Injectable()
// export class TelegramAuthService {
//   private readonly botToken: string;
//   private readonly apiUrl: string;
//   private readonly logger = new Logger('TelegramAuthService');
//   constructor(
//     private configService: ConfigService,
//     private readonly jwtService: JwtService,
//     private readonly usersService: UsersService,
//   ) {
//     this.botToken = this.configService.get<string>('telegram.botToken') || '';
//     this.apiUrl = this.configService.get<string>('TELEGRAM_API_URL') || '';
//     this.logger.log(`Инициализирован с botToken: ${this.botToken ? 'настроен' : 'не настроен'}`);
//     this.logger.log(`Инициализирован с apiUrl: ${this.apiUrl || 'не настроен'}`);
//   }
//   validateTelegramSignature(telegramId: string, hash: string): boolean {
//     this.logger.log(`Валидация подписи Telegram для ID: ${telegramId}`);
//     if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
//       this.logger.log(`Тестовая среда: валидация пропущена, возвращаем true`);
//       return true;
//     }
//     this.logger.log(`Проверка подписи реализована частично, возвращаем true`);
//     return true;
//   }
//   async getUserInfo(telegramId: string): Promise<any> {
//     this.logger.log(`Получение информации пользователя Telegram ID: ${telegramId}`);
//     return { id: telegramId };
//   }
//   async validateUser(telegramLoginDto: TelegramLoginDto): Promise<User | null> {
//     const { id, username, first_name, auth_date } = telegramLoginDto;
//     const user = await this.usersService.findByTelegramId(id);
//     if (user) {
//       return user;
//     }
//     return this.usersService.create({
//       telegram_id: id,
//       username,
//       first_name,
//     });
//   }
//   async login(user: User): Promise<{ access_token: string }> {
//     const payload = { id: user.id, username: user.username, role: user.role };
//     return {
//       access_token: this.jwtService.sign(payload),
//     };
//   }
// }
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../../../users/application/services/users.service");
let TelegramAuthService = class TelegramAuthService {
    constructor(configService, jwtService, usersService) {
        this.configService = configService;
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.logger = new common_1.Logger('TelegramAuthService');
    }
    validateTelegramSignature(userId, hash) {
        // Простая валидация для разработки
        // В продакшене здесь должна быть реальная проверка подписи Telegram
        this.logger.log(`Валидация подписи для пользователя ${userId}`);
        return true; // Временно всегда возвращаем true
    }
    async authenticateUser(telegramData) {
        const { id, username, first_name, last_name, photo_url } = telegramData;
        this.logger.log(`Аутентификация пользователя: ${username} (${id})`);
        let user = await this.usersService.findByTelegramId(id);
        if (!user) {
            this.logger.log('Создание нового пользователя');
            const userData = {
                telegram_id: id,
                username: username || `user_${id}`,
                first_name,
                last_name: last_name || '',
                photo_url: photo_url || '',
            };
            user = await this.usersService.create(userData);
        }
        // Генерация JWT токена
        const payload = {
            sub: user.id,
            username: user.username,
            telegramId: user.telegram_id
        };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            user: {
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                telegram_id: user.telegram_id,
            },
        };
    }
    async verifyToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (error) {
            this.logger.error(`Ошибка верификации токена: ${error}`);
            throw new Error('Invalid token');
        }
    }
};
TelegramAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        users_service_1.UsersService])
], TelegramAuthService);
exports.TelegramAuthService = TelegramAuthService;
