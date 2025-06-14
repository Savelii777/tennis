"use strict";
// import { Module } from '@nestjs/common';
// import { TelegrafModule } from 'nestjs-telegraf';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { BotService } from './bot.service';
// import { TelegramService } from './telegram.service';
// import { TelegramController } from './telegram.controller';
// import { UsersModule } from '../users/users.module';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
// @Module({
//   imports: [
//     TelegrafModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => {
//         const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
//         console.log('🤖 Telegram Module Factory');
//         console.log(`Token exists: ${!!token}`);
//         if (!token) {
//           throw new Error('TELEGRAM_BOT_TOKEN не найден в environment');
//         }
//         return {
//           token,
//           // НЕ УКАЗЫВАЕМ include - пусть nestjs-telegraf автоматически найдет все классы с @Update()
//         };
//       },
//     }),
//     UsersModule,
//   ],
//   controllers: [TelegramController],
//   providers: [
//     BotService, // ТОЛЬКО BotService
//     TelegramService,
//     // НЕ ДОБАВЛЯЕМ SCENES
//   ],
//   exports: [TelegramService],
// })
// export class TelegramModule {}
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const config_1 = require("@nestjs/config");
const bot_service_1 = require("./bot.service");
const telegram_service_1 = require("./telegram.service");
const telegram_controller_1 = require("./telegram.controller");
const users_module_1 = require("../users/users.module");
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
            users_module_1.UsersModule,
        ],
        controllers: [telegram_controller_1.TelegramController],
        providers: [
            bot_service_1.BotService,
            telegram_service_1.TelegramService,
        ],
        exports: [telegram_service_1.TelegramService],
    })
], TelegramModule);
exports.TelegramModule = TelegramModule;
