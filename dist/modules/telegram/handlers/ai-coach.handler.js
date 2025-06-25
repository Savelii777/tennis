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
var AiCoachHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiCoachHandler = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const state_service_1 = require("../services/state.service");
const keyboard_service_1 = require("../services/keyboard.service");
let AiCoachHandler = AiCoachHandler_1 = class AiCoachHandler {
    constructor(stateService, keyboardService) {
        this.stateService = stateService;
        this.keyboardService = keyboardService;
        this.logger = new common_1.Logger(AiCoachHandler_1.name);
    }
    register(bot) {
        bot.action('ask_coach', this.handleAskCoach.bind(this));
    }
    async handleAICoach(ctx) {
        try {
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('❓ Задать вопрос тренеру', 'ask_coach')]
            ]);
            await ctx.reply('🤖 **AI-Coach**\n\nЗадайте вопрос и получите рекомендации от виртуального тренера!', {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleAICoach: ${error}`);
            await ctx.reply('❌ Произошла ошибка при обращении к AI-Coach');
        }
    }
    async handleAskCoach(ctx) {
        try {
            await ctx.answerCbQuery();
            await ctx.reply('❓ Задайте свой вопрос...');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleAskCoach: ${error}`);
        }
    }
    async handleAIInput(ctx, text, userId) {
        // Заглушка для обработки ввода
        return false;
    }
};
AiCoachHandler = AiCoachHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_service_1.StateService,
        keyboard_service_1.KeyboardService])
], AiCoachHandler);
exports.AiCoachHandler = AiCoachHandler;
