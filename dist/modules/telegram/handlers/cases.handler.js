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
var CasesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasesHandler = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const state_service_1 = require("../services/state.service");
const keyboard_service_1 = require("../services/keyboard.service");
let CasesHandler = CasesHandler_1 = class CasesHandler {
    constructor(stateService, keyboardService) {
        this.stateService = stateService;
        this.keyboardService = keyboardService;
        this.logger = new common_1.Logger(CasesHandler_1.name);
    }
    register(bot) {
        bot.action('open_case', this.handleOpenCase.bind(this));
        bot.action('buy_balls', this.handleBuyBalls.bind(this));
    }
    async handleCases(ctx) {
        try {
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🎁 Открыть кейс', 'open_case')],
                [telegraf_1.Markup.button.callback('💰 Купить мячи', 'buy_balls')]
            ]);
            await ctx.reply('🎁 **Кейсы**\n\nОткрывайте кейсы и получайте призы!', {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleCases: ${error}`);
            await ctx.reply('❌ Произошла ошибка при работе с кейсами');
        }
    }
    async handleOpenCase(ctx) {
        try {
            await ctx.answerCbQuery();
            await ctx.reply('🎁 Открытие кейса...');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleOpenCase: ${error}`);
        }
    }
    async handleBuyBalls(ctx) {
        try {
            await ctx.answerCbQuery();
            await ctx.reply('💰 Покупка мячей...');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleBuyBalls: ${error}`);
        }
    }
};
exports.CasesHandler = CasesHandler;
exports.CasesHandler = CasesHandler = CasesHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_service_1.StateService,
        keyboard_service_1.KeyboardService])
], CasesHandler);
