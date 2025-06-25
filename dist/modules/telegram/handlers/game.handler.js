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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameHandler = void 0;
// src/modules/telegram/handlers/game.handler.ts
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const base_bot_handler_1 = require("./base-bot.handler");
const requests_service_1 = require("../../requests/application/services/requests.service");
const profile_state_enum_1 = require("../interfaces/profile-state.enum");
const create_request_dto_1 = require("../../requests/application/dto/create-request.dto");
let GameHandler = class GameHandler extends base_bot_handler_1.BaseBotHandler {
    constructor(usersService, ballsService, requestsService) {
        super(usersService, ballsService);
        this.requestsService = requestsService;
    }
    async handlePlay(ctx) {
        this.logger.log('🎾 ИГРАТЬ кнопка нажата');
        try {
            const user = await this.getUser(ctx);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден. Отправьте /start');
                return;
            }
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🔍 Найти игру', 'find_game')],
                [telegraf_1.Markup.button.callback('➕ Создать заявку', 'create_request')],
                [telegraf_1.Markup.button.callback('📋 Мои заявки', 'my_requests')],
                [telegraf_1.Markup.button.callback('💫 Активные заявки', 'active_requests')],
            ]);
            await ctx.reply(`🎾 **Поиск игры**\n\n` +
                `Найдите партнера для игры или создайте заявку!\n\n` +
                `Что вас интересует?`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handlePlay: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке раздела игры');
        }
    }
    async handleFindGame(ctx) {
        await ctx.answerCbQuery();
        this.logger.log('🔍 Поиск игры');
        try {
            const requests = await this.requestsService.findAll({
                page: 1,
                limit: 10
            });
            const filteredRequests = requests.filter((req) => {
                const creatorTelegramId = req.creator?.telegramId ||
                    req.creator?.telegram_id ||
                    req.creatorId?.toString();
                return creatorTelegramId && creatorTelegramId !== ctx.from?.id.toString();
            }).slice(0, 10);
            if (filteredRequests.length === 0) {
                await ctx.editMessageText(`🔍 **Поиск игры**\n\n` +
                    `😔 Пока нет активных заявок.\n\n` +
                    `Создайте свою заявку, чтобы другие игроки могли к вам присоединиться!`, {
                    parse_mode: 'Markdown',
                    reply_markup: telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('➕ Создать заявку', 'create_request')],
                        [telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_play')]
                    ]).reply_markup
                });
                return;
            }
            let message = `🔍 **Активные заявки:**\n\n`;
            const buttons = [];
            filteredRequests.forEach((request, index) => {
                const datetime = request.dateTime || request.scheduledTime
                    ? new Date(request.dateTime || request.scheduledTime).toLocaleString('ru-RU')
                    : 'Время не указано';
                const creatorName = request.creator?.firstName ||
                    request.creator?.first_name ||
                    request.creatorName ||
                    'Игрок';
                const location = request.locationName ||
                    request.location ||
                    'Место не указано';
                const currentPlayers = request.currentPlayers || 0;
                const maxPlayers = request.maxPlayers || 2;
                message += `${index + 1}. **${creatorName}**\n`;
                message += `📅 ${datetime}\n`;
                message += `📍 ${location}\n`;
                message += `👥 ${currentPlayers}/${maxPlayers}\n`;
                if (request.description && request.description !== 'Поиск партнера для игры в теннис') {
                    message += `📝 ${request.description}\n`;
                }
                message += `\n`;
                buttons.push([telegraf_1.Markup.button.callback(`${index + 1}. Откликнуться`, `respond_request_${request.id}`)]);
            });
            buttons.push([telegraf_1.Markup.button.callback('🔄 Обновить', 'find_game')]);
            buttons.push([telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_play')]);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleFindGame: ${error}`);
            await ctx.editMessageText(`🔍 **Поиск игры**\n\n` +
                `😔 Временная ошибка при загрузке заявок.\n\n` +
                `Попробуйте позже или создайте свою заявку!`, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('➕ Создать заявку', 'create_request')],
                    [telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_play')]
                ]).reply_markup
            });
        }
    }
    async handleCreateRequest(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        this.setUserState(userId, {
            step: profile_state_enum_1.ProfileStep.AWAITING_REQUEST_DESCRIPTION,
            data: {}
        });
        await ctx.editMessageText(`➕ **Создание заявки**\n\n` +
            `**Шаг 1 из 3**\n\n` +
            `Опишите заявку на игру:\n` +
            `• Уровень игры\n` +
            `• Предпочтения по игре\n` +
            `• Дополнительная информация\n\n` +
            `Введите описание:`, { parse_mode: 'Markdown' });
    }
    async handleMyRequests(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        try {
            const user = await this.getUser(ctx);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            const allRequests = await this.requestsService.findAll({ page: 1, limit: 100 });
            const myRequests = allRequests.filter((req) => {
                const creatorId = req.creatorId || req.creator?.id;
                return creatorId && creatorId.toString() === user.id.toString();
            });
            if (myRequests.length === 0) {
                await ctx.editMessageText(`📋 **Мои заявки**\n\n` +
                    `У вас пока нет активных заявок.\n\n` +
                    `Создайте новую заявку!`, {
                    parse_mode: 'Markdown',
                    reply_markup: telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('➕ Создать заявку', 'create_request')],
                        [telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_play')]
                    ]).reply_markup
                });
                return;
            }
            let message = `📋 **Мои заявки (${myRequests.length}):**\n\n`;
            const buttons = [];
            myRequests.forEach((request, index) => {
                const datetime = request.dateTime
                    ? new Date(request.dateTime).toLocaleString('ru-RU')
                    : 'Время не указано';
                const location = request.locationName || request.location || 'Место не указано';
                const currentPlayers = request.currentPlayers || 0;
                const maxPlayers = request.maxPlayers || 2;
                message += `${index + 1}. **${request.title || 'Заявка'}**\n`;
                message += `📅 ${datetime}\n`;
                message += `📍 ${location}\n`;
                message += `👥 ${currentPlayers}/${maxPlayers}\n\n`;
                buttons.push([telegraf_1.Markup.button.callback(`${index + 1}. Подробнее`, `request_details_${request.id}`)]);
            });
            buttons.push([telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_play')]);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleMyRequests: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке заявок');
        }
    }
    async handleActiveRequests(ctx) {
        await ctx.answerCbQuery();
        await this.handleFindGame(ctx);
    }
    async handleBackToPlay(ctx) {
        await ctx.answerCbQuery();
        await this.handlePlay(ctx);
    }
    async handleRespondToRequest(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        const requestId = ctx.callbackQuery.data.split('_')[2];
        try {
            const user = await this.getUser(ctx);
            if (!user)
                return;
            // Здесь должна быть логика отклика на заявку
            await ctx.editMessageText(`✅ **Отклик отправлен!**\n\n` +
                `Ваш отклик на заявку был отправлен создателю.\n\n` +
                `Ожидайте подтверждения!`, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('🔍 Другие заявки', 'find_game')],
                    [telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_play')]
                ]).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка отклика на заявку: ${error}`);
            await ctx.reply('❌ Ошибка при отправке отклика');
        }
    }
    async handleRequestDetails(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        const requestId = ctx.callbackQuery.data.split('_')[2];
        try {
            // Здесь должна быть логика получения деталей заявки
            await ctx.editMessageText(`📋 **Детали заявки**\n\n` +
                `Функция в разработке!\n\n` +
                `Здесь будут отображаться:\n` +
                `• Подробная информация\n` +
                `• Список откликов\n` +
                `• Возможность редактирования`, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('✏️ Редактировать', `edit_request_${requestId}`)],
                    [telegraf_1.Markup.button.callback('🗑️ Удалить', `delete_request_${requestId}`)],
                    [telegraf_1.Markup.button.callback('⬅️ Назад', 'my_requests')]
                ]).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка получения деталей заявки: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке заявки');
        }
    }
    // Метод для создания заявки (вызывается из обработчика текста)
    async createGameRequest(ctx, userId, userState) {
        try {
            const user = await this.usersService.findByTelegramId(userId);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            const requestData = {
                type: create_request_dto_1.RequestType.GAME,
                title: `Игра ${new Date(userState.data.requestDateTime).toLocaleDateString('ru-RU')}`,
                description: userState.data.requestDescription || 'Поиск партнера для игры в теннис',
                gameMode: create_request_dto_1.GameMode.SINGLES,
                dateTime: new Date(userState.data.requestDateTime),
                location: userState.data.requestLocation,
                maxPlayers: 2,
                locationName: userState.data.requestLocation,
            };
            const request = await this.requestsService.create(user.id.toString(), requestData);
            await ctx.reply(`✅ **Заявка создана!**\n\n` +
                `📅 **Дата:** ${new Date(request.dateTime).toLocaleString('ru-RU')}\n` +
                `📍 **Место:** ${request.locationName}\n` +
                `📝 **Описание:** ${request.description}\n\n` +
                `Теперь другие игроки смогут откликнуться на вашу заявку!`, {
                parse_mode: 'Markdown',
                reply_markup: this.getMainKeyboard().reply_markup
            });
            this.clearUserState(userId);
        }
        catch (error) {
            this.logger.error(`Ошибка создания заявки: ${error}`);
            await ctx.reply('❌ Ошибка при создании заявки');
        }
    }
    getMainKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['👤 Профиль', '🎾 Играть'],
            ['🏆 Турниры', '🏃‍♂️ Тренировки'],
            ['📱 Stories', '🎁 Кейсы'],
            ['📍 Корты', '⚙️ Настройки'],
            ['🔗 Пригласить друга', '📝 Записать результат']
        ]).resize();
    }
};
__decorate([
    (0, nestjs_telegraf_1.Action)('find_game'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], GameHandler.prototype, "handleFindGame", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('create_request'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], GameHandler.prototype, "handleCreateRequest", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('my_requests'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], GameHandler.prototype, "handleMyRequests", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('active_requests'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], GameHandler.prototype, "handleActiveRequests", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_play'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], GameHandler.prototype, "handleBackToPlay", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^respond_request_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], GameHandler.prototype, "handleRespondToRequest", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^request_details_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], GameHandler.prototype, "handleRequestDetails", null);
GameHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object, requests_service_1.RequestsService])
], GameHandler);
exports.GameHandler = GameHandler;
