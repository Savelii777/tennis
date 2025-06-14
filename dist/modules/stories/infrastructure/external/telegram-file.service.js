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
var TelegramFileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramFileService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let TelegramFileService = TelegramFileService_1 = class TelegramFileService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TelegramFileService_1.name);
        const token = this.configService.get('TELEGRAM_BOT_TOKEN');
        if (!token) {
            throw new Error('TELEGRAM_BOT_TOKEN is required');
        }
        this.botToken = token;
    }
    async getFile(fileId) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getFile?file_id=${fileId}`);
            if (!response.ok) {
                this.logger.error(`Failed to get file info: ${response.statusText}`);
                return null;
            }
            const data = await response.json();
            if (!data.ok) {
                this.logger.error(`Telegram API error: ${data.description}`);
                return null;
            }
            return data.result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting file from Telegram: ${errorMessage}`);
            return null;
        }
    }
    getFileUrl(filePath) {
        return `https://api.telegram.org/file/bot${this.botToken}/${filePath}`;
    }
    getBotToken() {
        return this.botToken;
    }
    async validateFileSize(fileId, maxSizeMB = 50) {
        const fileInfo = await this.getFile(fileId);
        if (!fileInfo || !fileInfo.file_size)
            return true; // Allow if we can't check size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return fileInfo.file_size <= maxSizeBytes;
    }
};
TelegramFileService = TelegramFileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TelegramFileService);
exports.TelegramFileService = TelegramFileService;
