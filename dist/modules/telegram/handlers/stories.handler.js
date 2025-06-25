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
var StoriesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoriesHandler = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const state_service_1 = require("../services/state.service");
const keyboard_service_1 = require("../services/keyboard.service");
let StoriesHandler = StoriesHandler_1 = class StoriesHandler {
    constructor(stateService, keyboardService) {
        this.stateService = stateService;
        this.keyboardService = keyboardService;
        this.logger = new common_1.Logger(StoriesHandler_1.name);
    }
    register(bot) {
        bot.action('create_story', this.handleCreateStory.bind(this));
    }
    async handleStories(ctx) {
        try {
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('📱 Создать историю', 'create_story')]
            ]);
            await ctx.reply('📱 **Stories**\n\nПубликуйте свои фото и видео с корта!', {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleStories: ${error}`);
            await ctx.reply('❌ Произошла ошибка при работе со сторис');
        }
    }
    async handleCreateStory(ctx) {
        try {
            await ctx.answerCbQuery();
            await ctx.reply('📱 Отправьте фото или видео для создания истории');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleCreateStory: ${error}`);
        }
    }
    async handlePhoto(ctx) {
        try {
            await ctx.reply('📸 Фото получено');
        }
        catch (error) {
            this.logger.error(`Ошибка в handlePhoto: ${error}`);
        }
    }
    async handleVideo(ctx) {
        try {
            await ctx.reply('🎥 Видео получено');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleVideo: ${error}`);
        }
    }
    async handleStoryInput(ctx, text, userId) {
        // Заглушка для обработки ввода
        return false;
    }
};
StoriesHandler = StoriesHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_service_1.StateService,
        keyboard_service_1.KeyboardService])
], StoriesHandler);
exports.StoriesHandler = StoriesHandler;
