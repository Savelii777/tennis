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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TelegramFileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramFileService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let TelegramFileService = TelegramFileService_1 = class TelegramFileService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TelegramFileService_1.name);
        this.token = ''; // Инициализируем пустой строкой
        const configToken = this.configService.get('TELEGRAM_BOT_TOKEN');
        if (!configToken) {
            this.logger.error('TELEGRAM_BOT_TOKEN is not defined in environment');
            throw new Error('TELEGRAM_BOT_TOKEN is required');
        }
        else {
            this.token = configToken;
        }
    }
    /**
     * Получить путь к файлу по его ID в Telegram
     * @param fileId ID файла в Telegram
     */
    async getFilePath(fileId) {
        try {
            // Использование Telegram Bot API для получения информации о файле
            const response = await axios_1.default.get(`https://api.telegram.org/bot${this.token}/getFile`, {
                params: { file_id: fileId }
            });
            // Проверяем успешность запроса
            if (!response.data.ok) {
                throw new Error(`Telegram API error: ${response.data.description}`);
            }
            // Возвращаем путь к файлу
            return response.data.result.file_path;
        }
        catch (error) {
            this.logger.error(`Error getting file path: ${error}`);
            throw error;
        }
    }
    /**
     * Получить полный URL файла
     * @param filePath Путь к файлу
     */
    getFileUrl(filePath) {
        return `https://api.telegram.org/file/bot${this.token}/${filePath}`;
    }
};
exports.TelegramFileService = TelegramFileService;
exports.TelegramFileService = TelegramFileService = TelegramFileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TelegramFileService);
