"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const config_1 = require("@nestjs/config");
const bot_service_1 = require("./bot.service");
const telegram_service_1 = require("./telegram.service");
const telegram_controller_1 = require("./telegram.controller");
const users_module_1 = require("../users/users.module");
const requests_module_1 = require("../requests/requests.module");
const tournaments_module_1 = require("../tournaments/tournaments.module");
const matches_module_1 = require("../matches/matches.module");
const trainings_module_1 = require("../trainings/trainings.module");
const stories_module_1 = require("../stories/stories.module");
const cases_module_1 = require("../cases/cases.module");
const notifications_module_1 = require("../notifications/notifications.module");
const prisma_service_1 = require("../../prisma/prisma.service");
const achievements_module_1 = require("../achievements/achievements.module"); // Добавляем
const ratings_module_1 = require("../ratings/ratings.module"); // Добавляем
let TelegramModule = class TelegramModule {
};
TelegramModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_telegraf_1.TelegrafModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const token = configService.get('TELEGRAM_BOT_TOKEN');
                    console.log('🤖 Telegram Module Factory');
                    console.log(`Token exists: ${!!token}`);
                    if (!token) {
                        throw new Error('TELEGRAM_BOT_TOKEN не найден в environment');
                    }
                    return {
                        token,
                    };
                },
            }),
            config_1.ConfigModule,
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => requests_module_1.RequestsModule),
            (0, common_1.forwardRef)(() => tournaments_module_1.TournamentsModule),
            (0, common_1.forwardRef)(() => matches_module_1.MatchesModule),
            (0, common_1.forwardRef)(() => trainings_module_1.TrainingsModule),
            (0, common_1.forwardRef)(() => stories_module_1.StoriesModule),
            (0, common_1.forwardRef)(() => cases_module_1.CasesModule),
            (0, common_1.forwardRef)(() => notifications_module_1.NotificationsModule),
            (0, common_1.forwardRef)(() => achievements_module_1.AchievementsModule),
            (0, common_1.forwardRef)(() => ratings_module_1.RatingsModule),
        ],
        controllers: [telegram_controller_1.TelegramController],
        providers: [
            bot_service_1.BotService,
            telegram_service_1.TelegramService,
            prisma_service_1.PrismaService
        ],
        exports: [telegram_service_1.TelegramService, bot_service_1.BotService],
    })
], TelegramModule);
exports.TelegramModule = TelegramModule;
