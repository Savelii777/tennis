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
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
let TelegramService = TelegramService_1 = class TelegramService {
    constructor(bot, configService) {
        this.bot = bot;
        this.configService = configService;
        this.logger = new common_1.Logger(TelegramService_1.name);
    }
    // Методы для отправки сообщений пользователям
    async sendMessage(chatId, text, extra) {
        try {
            return await this.bot.telegram.sendMessage(chatId, text, extra);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error sending message to ${chatId}: ${errorMsg}`);
            throw error;
        }
    }
    async sendPhoto(chatId, photo, extra) {
        try {
            return await this.bot.telegram.sendPhoto(chatId, photo, extra);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error sending photo to ${chatId}: ${errorMsg}`);
            throw error;
        }
    }
    async sendMediaGroup(chatId, media) {
        try {
            return await this.bot.telegram.sendMediaGroup(chatId, media);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error sending media group to ${chatId}: ${errorMsg}`);
            throw error;
        }
    }
    // Метод для отправки уведомлений пользователям
    async sendNotification(userId, message) {
        try {
            // Находим telegramChatId пользователя по userId
            const telegramChatId = await this.getTelegramChatId(userId);
            if (telegramChatId) {
                await this.bot.telegram.sendMessage(telegramChatId, message);
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error sending notification to user ${userId}: ${errorMsg}`);
        }
    }
    // Вспомогательный метод для получения telegramChatId
    async getTelegramChatId(userId) {
        // В будущем здесь будет логика получения telegramChatId из базы данных
        return null;
    }
};
TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        config_1.ConfigService])
], TelegramService);
exports.TelegramService = TelegramService;
