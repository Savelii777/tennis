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
var TelegramController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bot_service_1 = require("./bot.service");
let TelegramController = TelegramController_1 = class TelegramController {
    constructor(configService, botService) {
        this.configService = configService;
        this.botService = botService;
        this.logger = new common_1.Logger(TelegramController_1.name);
    }
    async handleWebhook(update, secretToken) {
        this.logger.log(`📥 Получен webhook: ${JSON.stringify(update)}`);
        try {
            await this.botService.processUpdate(update);
            return { ok: true };
        }
        catch (error) {
            this.logger.error('❌ Ошибка обработки webhook:', error);
            return { ok: false, error: String(error) };
        }
    }
    async getBotInfo() {
        try {
            const info = await this.botService.getBotInfo();
            return { ok: true, result: info };
        }
        catch (error) {
            return { ok: false, error: String(error) };
        }
    }
    async testBot(body) {
        this.logger.log(`🧪 Тестовый вызов: ${JSON.stringify(body)}`);
        // Создаем тестовое обновление
        const testUpdate = {
            update_id: Date.now(),
            message: {
                message_id: 1,
                from: {
                    id: 123456789,
                    is_bot: false,
                    first_name: "Test",
                    username: "testuser"
                },
                chat: {
                    id: 123456789,
                    first_name: "Test",
                    username: "testuser",
                    type: "private"
                },
                date: Math.floor(Date.now() / 1000),
                text: body.text || "/start"
            }
        };
        try {
            await this.botService.processUpdate(testUpdate);
            return { ok: true, message: "Тестовое сообщение обработано" };
        }
        catch (error) {
            return { ok: false, error: String(error) };
        }
    }
};
exports.TelegramController = TelegramController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-telegram-bot-api-secret-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "getBotInfo", null);
__decorate([
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "testBot", null);
exports.TelegramController = TelegramController = TelegramController_1 = __decorate([
    (0, common_1.Controller)('telegram'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        bot_service_1.BotService])
], TelegramController);
