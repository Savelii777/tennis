"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./application/services/auth.service");
const telegram_auth_service_1 = require("./infrastructure/telegram/telegram-auth.service");
const auth_controller_1 = require("./presentation/controllers/auth.controller");
const prisma_service_1 = require("../../prisma/prisma.service");
const users_module_1 = require("../users/users.module");
const achievements_module_1 = require("../achievements/achievements.module");
const settings_module_1 = require("../settings/settings.module");
const ratings_module_1 = require("../ratings/ratings.module"); // Добавляем RatingsModule
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => achievements_module_1.AchievementsModule),
            (0, common_1.forwardRef)(() => settings_module_1.SettingsModule),
            (0, common_1.forwardRef)(() => ratings_module_1.RatingsModule), // Добавляем циклический импорт RatingsModule
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '1h' },
                }),
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, telegram_auth_service_1.TelegramAuthService, prisma_service_1.PrismaService],
        exports: [auth_service_1.AuthService, jwt_1.JwtModule],
    })
], AuthModule);
