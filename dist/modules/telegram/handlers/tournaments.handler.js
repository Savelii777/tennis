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
var TournamentsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentsHandler = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const state_service_1 = require("../services/state.service");
const keyboard_service_1 = require("../services/keyboard.service");
const users_service_1 = require("../../users/application/services/users.service");
let TournamentsHandler = TournamentsHandler_1 = class TournamentsHandler {
    constructor(stateService, keyboardService, usersService) {
        this.stateService = stateService;
        this.keyboardService = keyboardService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(TournamentsHandler_1.name);
    }
    register(bot) {
        bot.action('create_tournament', this.handleCreateTournament.bind(this));
        bot.action('find_tournament', this.handleFindTournament.bind(this));
    }
    async handleTournaments(ctx) {
        try {
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🔍 Найти турнир', 'find_tournament')],
                [telegraf_1.Markup.button.callback('🏆 Создать турнир', 'create_tournament')]
            ]);
            await ctx.reply('🏆 **Турниры**\n\nВыберите действие:', {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleTournaments: ${error}`);
            await ctx.reply('❌ Произошла ошибка при работе с турнирами');
        }
    }
    async handleCreateTournament(ctx) {
        try {
            await ctx.answerCbQuery();
            await ctx.reply('🏆 Создание турнира...');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleCreateTournament: ${error}`);
        }
    }
    async handleFindTournament(ctx) {
        try {
            await ctx.answerCbQuery();
            await ctx.reply('🔍 Поиск турниров...');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleFindTournament: ${error}`);
        }
    }
    async handleLocations(ctx) {
        try {
            await ctx.reply('📍 Корты и локации');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleLocations: ${error}`);
        }
    }
    async handleTournamentInput(ctx, text, userId) {
        // Заглушка для обработки ввода
        return false;
    }
};
exports.TournamentsHandler = TournamentsHandler;
exports.TournamentsHandler = TournamentsHandler = TournamentsHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_service_1.StateService,
        keyboard_service_1.KeyboardService,
        users_service_1.UsersService])
], TournamentsHandler);
