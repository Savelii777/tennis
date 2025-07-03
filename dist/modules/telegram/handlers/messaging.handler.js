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
var MessagingHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingHandler = void 0;
const common_1 = require("@nestjs/common");
const state_service_1 = require("../services/state.service");
const users_service_1 = require("../../users/application/services/users.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
const profile_state_enum_1 = require("../interfaces/profile-state.enum");
let MessagingHandler = MessagingHandler_1 = class MessagingHandler {
    constructor(stateService, usersService, prisma) {
        this.stateService = stateService;
        this.usersService = usersService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(MessagingHandler_1.name);
    }
    register(bot) {
        bot.action('cancel_message', this.handleCancelMessage.bind(this));
        bot.action(/^reply_message_(\d+)$/, this.handleReplyMessage.bind(this));
        bot.action(/^view_profile_(\d+)$/, this.handleViewProfile.bind(this));
    }
    /**
     * Обработка запроса на отправку сообщения другому пользователю
     */
    async handleMessageRequest(ctx, senderId, targetUserId) {
        try {
            // Проверяем, существует ли целевой пользователь
            const targetUser = await this.usersService.findById(targetUserId);
            if (!targetUser) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            // Проверяем, разрешены ли прямые сообщения
            const userSettings = await this.prisma.userSettings.findFirst({
                where: { userId: parseInt(targetUserId) }
            });
            if (userSettings && !userSettings.allowDirectMessages) {
                await ctx.reply('❌ Пользователь не принимает прямые сообщения');
                return;
            }
            // Сохраняем состояние для отправки сообщения
            const userId = ctx.from?.id.toString();
            if (!userId)
                return;
            const userState = this.stateService.getUserState(userId);
            const updatedState = {
                ...userState,
                step: profile_state_enum_1.ProfileStep.AWAITING_MESSAGE_TEXT,
                data: {
                    ...userState.data,
                    targetUserId: targetUserId,
                    targetUserName: `${targetUser.first_name} ${targetUser.last_name || ''}`.trim()
                }
            };
            this.stateService.setUserState(userId, updatedState);
            // Отправляем инструкцию
            await ctx.reply(`💬 Отправка сообщения пользователю **${targetUser.first_name} ${targetUser.last_name || ''}**\n\n` +
                `✍️ Напишите ваше сообщение, и я передам его получателю:\n\n` +
                `_Например: "Привет! Хочешь сыграть в теннис завтра?"_`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                            { text: '❌ Отмена', callback_data: 'cancel_message' }
                        ]]
                }
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleMessageRequest: ${error}`);
            await ctx.reply('❌ Произошла ошибка при обработке запроса');
        }
    }
    /**
     * Обработка отправки сообщения (вызывается из текстового обработчика)
     */
    async handleMessageSend(ctx, messageText, userId) {
        try {
            const userState = this.stateService.getUserState(userId);
            if (userState.step === profile_state_enum_1.ProfileStep.AWAITING_MESSAGE_TEXT && userState.data?.targetUserId) {
                const targetUserId = userState.data.targetUserId;
                const targetUserName = userState.data.targetUserName;
                // Получаем данные отправителя
                const sender = await this.usersService.findByTelegramId(userId);
                if (!sender) {
                    await ctx.reply('❌ Ошибка: данные отправителя не найдены');
                    return true;
                }
                // Получаем данные получателя
                const recipient = await this.usersService.findById(targetUserId);
                if (!recipient || !recipient.telegramChatId) {
                    await ctx.reply('❌ Получатель недоступен для отправки сообщений');
                    return true;
                }
                // Отправляем сообщение получателю
                const messageToRecipient = `💬 **Новое сообщение от игрока:**\n\n` +
                    `👤 **От:** ${sender.first_name} ${sender.last_name || ''}\n` +
                    `📍 **Город:** ${sender.profile?.city || 'Не указан'}\n` +
                    `🎾 **Рейтинг:** ${sender.profile?.ntrp_rating || 'Не указан'}\n\n` +
                    `**Сообщение:**\n_"${messageText}"_\n\n` +
                    `💡 Вы можете ответить через профиль отправителя или найти его в поиске.`;
                try {
                    await ctx.telegram.sendMessage(recipient.telegramChatId.toString(), messageToRecipient, {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [[
                                    { text: '👤 Открыть профиль', callback_data: `view_profile_${sender.id}` },
                                    { text: '💬 Ответить', callback_data: `reply_message_${sender.id}` }
                                ]]
                        }
                    });
                    // Подтверждение отправителю
                    await ctx.reply(`✅ Сообщение успешно отправлено игроку **${targetUserName}**!\n\n` +
                        `📤 Отправлено: _"${messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText}"_\n\n` +
                        `Получатель увидит ваше сообщение в Telegram и сможет ответить.`, {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [[
                                    { text: '🔙 Вернуться в меню', callback_data: 'main_menu' }
                                ]]
                        }
                    });
                    // Логируем успешную отправку
                    this.logger.log(`✅ Сообщение отправлено от ${sender.id} к ${targetUserId}`);
                }
                catch (sendError) {
                    this.logger.error(`Ошибка отправки сообщения: ${sendError}`);
                    await ctx.reply('❌ Не удалось доставить сообщение. Возможно, получатель заблокировал бота.');
                }
                // Сбрасываем состояние
                this.stateService.setUserState(userId, {
                    ...userState,
                    step: profile_state_enum_1.ProfileStep.IDLE,
                    data: {}
                });
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Ошибка в handleMessageSend: ${error}`);
            await ctx.reply('❌ Произошла ошибка при отправке сообщения');
            return true;
        }
    }
    async handleCancelMessage(ctx) {
        try {
            await ctx.answerCbQuery();
            const userId = ctx.from?.id.toString();
            if (!userId)
                return;
            // Сбрасываем состояние
            const userState = this.stateService.getUserState(userId);
            this.stateService.setUserState(userId, {
                ...userState,
                step: profile_state_enum_1.ProfileStep.IDLE,
                data: {}
            });
            await ctx.reply('❌ Отправка сообщения отменена', {
                reply_markup: {
                    inline_keyboard: [[
                            { text: '🔙 Вернуться в меню', callback_data: 'main_menu' }
                        ]]
                }
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleCancelMessage: ${error}`);
        }
    }
    async handleReplyMessage(ctx) {
        try {
            await ctx.answerCbQuery();
            const data = ctx.callbackQuery?.data;
            const match = data?.match(/^reply_message_(\d+)$/);
            if (!match)
                return;
            const targetUserId = match[1];
            const userId = ctx.from?.id.toString();
            if (!userId)
                return;
            // Инициируем процесс отправки сообщения
            await this.handleMessageRequest(ctx, userId, targetUserId);
        }
        catch (error) {
            this.logger.error(`Ошибка в handleReplyMessage: ${error}`);
        }
    }
    async handleViewProfile(ctx) {
        try {
            await ctx.answerCbQuery();
            const data = ctx.callbackQuery?.data;
            const match = data?.match(/^view_profile_(\d+)$/);
            if (!match)
                return;
            const targetUserId = match[1];
            // Получаем данные пользователя
            const user = await this.usersService.findById(targetUserId);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            // Отображаем краткий профиль
            const profileMessage = `👤 **Профиль игрока**\n\n` +
                `**Имя:** ${user.first_name} ${user.last_name || ''}\n` +
                `**Город:** ${user.profile?.city || 'Не указан'}\n` +
                `**Рейтинг:** ${user.profile?.ntrp_rating || 'Не указан'}\n` +
                `**Матчей сыграно:** ${user.profile?.matches_played || 0}\n` +
                `**Побед:** ${user.profile?.match_wins || 0}`;
            await ctx.reply(profileMessage, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                            { text: '💬 Написать сообщение', callback_data: `reply_message_${user.id}` },
                            { text: '🔙 Назад', callback_data: 'main_menu' }
                        ]]
                }
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleViewProfile: ${error}`);
        }
    }
};
exports.MessagingHandler = MessagingHandler;
exports.MessagingHandler = MessagingHandler = MessagingHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_service_1.StateService,
        users_service_1.UsersService,
        prisma_service_1.PrismaService])
], MessagingHandler);
