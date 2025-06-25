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
var TrainingsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingsHandler = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const state_service_1 = require("../services/state.service");
const keyboard_service_1 = require("../services/keyboard.service");
let TrainingsHandler = TrainingsHandler_1 = class TrainingsHandler {
    constructor(stateService, keyboardService) {
        this.stateService = stateService;
        this.keyboardService = keyboardService;
        this.logger = new common_1.Logger(TrainingsHandler_1.name);
    }
    register(bot) {
        bot.action('create_training', this.handleCreateTraining.bind(this));
        bot.action('find_training', this.handleFindTraining.bind(this));
    }
    async handleTrainings(ctx) {
        try {
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🔍 Найти тренировку', 'find_training')],
                [telegraf_1.Markup.button.callback('➕ Создать тренировку', 'create_training')]
            ]);
            await ctx.reply('🏃‍♂️ **Тренировки**\n\nВыберите действие:', {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleTrainings: ${error}`);
            await ctx.reply('❌ Произошла ошибка при работе с тренировками');
        }
    }
    async handleCreateTraining(ctx) {
        try {
            await ctx.answerCbQuery();
            await ctx.reply('➕ Создание тренировки...');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleCreateTraining: ${error}`);
        }
    }
    async handleFindTraining(ctx) {
        try {
            await ctx.answerCbQuery();
            await ctx.reply('🔍 Поиск тренировок...');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleFindTraining: ${error}`);
        }
    }
    async handleTrainingInput(ctx, text, userId) {
        // Заглушка для обработки ввода
        return false;
    }
};
TrainingsHandler = TrainingsHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_service_1.StateService,
        keyboard_service_1.KeyboardService])
], TrainingsHandler);
exports.TrainingsHandler = TrainingsHandler;
