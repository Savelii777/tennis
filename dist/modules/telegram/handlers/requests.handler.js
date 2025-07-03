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
var RequestsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsHandler = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const state_service_1 = require("../services/state.service");
const keyboard_service_1 = require("../services/keyboard.service");
const users_service_1 = require("../../users/application/services/users.service");
let RequestsHandler = RequestsHandler_1 = class RequestsHandler {
    constructor(stateService, keyboardService, usersService) {
        this.stateService = stateService;
        this.keyboardService = keyboardService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(RequestsHandler_1.name);
    }
    register(bot) {
        bot.action('find_game', this.handleFindGame.bind(this));
        bot.action('create_request', this.handleCreateRequest.bind(this));
    }
    async handlePlay(ctx) {
        try {
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🔍 Найти игру', 'find_game')],
                [telegraf_1.Markup.button.callback('➕ Создать заявку', 'create_request')]
            ]);
            await ctx.reply('🎾 **Игра**\n\nВыберите действие:', {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handlePlay: ${error}`);
            await ctx.reply('❌ Произошла ошибка при обработке запроса');
        }
    }
    async handleFindGame(ctx) {
        try {
            await ctx.answerCbQuery();
            await ctx.reply('🔍 Поиск игры...');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleFindGame: ${error}`);
        }
    }
    async handleCreateRequest(ctx) {
        try {
            await ctx.answerCbQuery();
            await ctx.reply('➕ Создание заявки...');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleCreateRequest: ${error}`);
        }
    }
    async handleRequestInput(ctx, text, userId) {
        // Заглушка для обработки ввода
        return false;
    }
};
exports.RequestsHandler = RequestsHandler;
exports.RequestsHandler = RequestsHandler = RequestsHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_service_1.StateService,
        keyboard_service_1.KeyboardService,
        users_service_1.UsersService])
], RequestsHandler);
