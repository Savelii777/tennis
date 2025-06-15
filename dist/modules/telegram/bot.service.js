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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const users_service_1 = require("../users/application/services/users.service");
const user_state_interface_1 = require("./interfaces/user-state.interface");
let BotService = BotService_1 = class BotService {
    constructor(bot, usersService) {
        this.bot = bot;
        this.usersService = usersService;
        this.logger = new common_1.Logger(BotService_1.name);
        // Храним состояния пользователей в памяти (в продакшене лучше использовать Redis)
        this.userStates = new Map();
    }
    async onModuleInit() {
        this.logger.log('🚀 BotService инициализирован');
        this.logger.log(`Bot instance: ${!!this.bot}`);
        // Middleware для логирования
        this.bot.use(async (ctx, next) => {
            this.logger.log(`📨 Получено: ${ctx.updateType} от ${ctx.from?.id}`);
            if (ctx.message && 'text' in ctx.message) {
                this.logger.log(`📝 Текст: "${ctx.message.text}"`);
            }
            await next();
        });
        this.logger.log('✅ Middleware добавлен');
    }
    getMainKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['👤 Профиль', '🎾 Играть'],
            ['🏆 Турниры', '📝 Записать результат'],
            ['📱 Stories', '🤖 AI-Coach']
        ]).resize().persistent();
    }
    getUserState(userId) {
        return this.userStates.get(userId) || { step: user_state_interface_1.ProfileStep.IDLE, data: {} };
    }
    setUserState(userId, state) {
        this.userStates.set(userId, state);
    }
    clearUserState(userId) {
        this.userStates.delete(userId);
    }
    async handleStart(ctx) {
        this.logger.log(`🌟 START от пользователя: ${ctx.from?.id} (${ctx.from?.first_name})`);
        try {
            if (!ctx.from) {
                this.logger.warn('Нет from field');
                return;
            }
            await ctx.reply('🎾 Запускаю Tennis Bot...');
            let user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                this.logger.log('Создаем нового пользователя...');
                const userData = {
                    telegram_id: ctx.from.id.toString(),
                    username: ctx.from.username || `user_${ctx.from.id}`,
                    first_name: ctx.from.first_name,
                    last_name: ctx.from.last_name || undefined,
                    photo_url: ''
                };
                user = await this.usersService.create(userData);
                this.logger.log('✅ Новый пользователь создан');
                await ctx.reply(`🎾 Добро пожаловать в Tennis Bot, ${ctx.from.first_name}!\n\nВы успешно зарегистрированы!`, this.getMainKeyboard());
            }
            else {
                this.logger.log('Пользователь уже существует');
                await ctx.reply(`👋 С возвращением, ${user.first_name}!\n\nВыберите действие:`, this.getMainKeyboard());
            }
        }
        catch (error) {
            this.logger.error(`Ошибка в handleStart: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
        }
    }
    async handleDebug(ctx) {
        this.logger.log('🐛 DEBUG команда');
        const userId = ctx.from?.id.toString();
        const userState = userId ? this.getUserState(userId) : null;
        const debugInfo = {
            userId: ctx.from?.id,
            chatId: ctx.chat?.id,
            updateType: ctx.updateType,
            text: ctx.message && 'text' in ctx.message ? ctx.message.text : 'no text',
            userState: userState
        };
        await ctx.reply(`🐛 **Debug Info:**\n` +
            `User ID: ${debugInfo.userId}\n` +
            `Chat ID: ${debugInfo.chatId}\n` +
            `Update: ${debugInfo.updateType}\n` +
            `Text: ${debugInfo.text}\n` +
            `State: ${JSON.stringify(debugInfo.userState)}`, { parse_mode: 'Markdown' });
    }
    async handleMenu(ctx) {
        this.logger.log('📋 MENU команда');
        await ctx.reply('📋 Главное меню:', this.getMainKeyboard());
    }
    async handleProfile(ctx) {
        this.logger.log('👤 ПРОФИЛЬ кнопка нажата');
        try {
            if (!ctx.from)
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден. Отправьте /start');
                return;
            }
            try {
                const stats = await this.usersService.getProfileStatistics(user.id.toString());
                const profileStatus = await this.usersService.getProfileCompletionStatus(user.id.toString());
                const message = `👤 **Ваш профиль**\n\n` +
                    `Имя: ${user.first_name} ${user.last_name || ''}\n` +
                    `Username: @${user.username || 'не указан'}\n` +
                    `ID: ${user.telegram_id}\n\n` +
                    `📊 **Статистика:**\n` +
                    `🎾 Матчей сыграно: ${stats.matchesPlayed}\n` +
                    `🏆 Побед: ${stats.matchWins}\n` +
                    `😔 Поражений: ${stats.matchLosses}\n` +
                    `📈 Процент побед: ${stats.winRate || 0}%\n` +
                    `🏅 Рейтинг: ${stats.ratingPoints} очков\n\n` +
                    `${!profileStatus.profileComplete ? '⚠️ Профиль не полностью заполнен' : '✅ Профиль заполнен'}`;
                const keyboard = telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('🔄 Настроить профиль', 'setup_profile')],
                    [telegraf_1.Markup.button.callback('📊 Подробная статистика', 'detailed_stats')],
                    [telegraf_1.Markup.button.callback('🎾 История матчей', 'match_history')],
                ]);
                await ctx.reply(message, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard.reply_markup
                });
            }
            catch (statsError) {
                this.logger.error(`Ошибка получения статистики: ${statsError instanceof Error ? statsError.message : String(statsError)}`);
                const keyboard = telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('🔄 Настроить профиль', 'setup_profile')],
                ]);
                await ctx.reply(`👤 **Ваш профиль**\n\n` +
                    `Имя: ${user.first_name} ${user.last_name || ''}\n` +
                    `Username: @${user.username || 'не указан'}\n` +
                    `ID: ${user.telegram_id}\n\n` +
                    `⚠️ Для получения статистики заполните профиль.`, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard.reply_markup
                });
            }
        }
        catch (error) {
            this.logger.error(`Ошибка в handleProfile: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply('❌ Ошибка при загрузке профиля');
        }
    }
    async handleSetupProfile(ctx) {
        this.logger.log('🔄 Настройка профиля начата');
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        // Сбрасываем состояние и начинаем заново
        this.setUserState(userId, {
            step: user_state_interface_1.ProfileStep.AWAITING_FIRST_NAME,
            data: {}
        });
        await ctx.reply(`👋 **Настройка профиля**\n\n` +
            `Давайте заполним ваш профиль для лучшего подбора партнёров!\n\n` +
            `**Шаг 1 из 8: Основная информация**\n\n` +
            `Как вас зовут? Введите ваше **имя**:`, { parse_mode: 'Markdown' });
    }
    async handleDetailedStats(ctx) {
        this.logger.log('📊 Подробная статистика запрошена');
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        try {
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            const stats = await this.usersService.getProfileStatistics(user.id.toString());
            const achievements = await this.usersService.getUserAchievements(user.id.toString());
            const statsMessage = `📊 **Подробная статистика**\n\n` +
                `🎾 **Матчи:**\n` +
                `• Всего сыграно: ${stats.matchesPlayed}\n` +
                `• Побед: ${stats.matchWins}\n` +
                `• Поражений: ${stats.matchLosses}\n` +
                `• Процент побед: ${stats.winRate || 0}%\n\n` +
                `🏆 **Турниры:**\n` +
                `• Участие: ${stats.tournamentsPlayed}\n` +
                `• Побед: ${stats.tournamentsWon}\n\n` +
                `🏅 **Рейтинг:**\n` +
                `• Текущий рейтинг: ${stats.ratingPoints} очков\n` +
                `• NTRP: ${user.profile?.ntrp_rating || 'Не определен'}\n\n` +
                `🏅 **Достижения:** ${Object.keys(achievements).length > 0 ? Object.keys(achievements).join(', ') : 'Пока нет'}\n\n` +
                `📅 **Последняя активность:** ${stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'Не зафиксирована'}`;
            await ctx.reply(statsMessage, { parse_mode: 'Markdown' });
        }
        catch (error) {
            this.logger.error(`Ошибка получения подробной статистики: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply('❌ Ошибка при загрузке статистики');
        }
    }
    async handleMatchHistory(ctx) {
        this.logger.log('🎾 История матчей запрошена');
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        try {
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            const recentMatches = await this.usersService.getRecentMatches(user.id.toString(), 5);
            if (recentMatches.length === 0) {
                await ctx.reply('📭 У вас пока нет истории матчей');
                return;
            }
            let historyMessage = `🎾 **Последние матчи:**\n\n`;
            recentMatches.forEach((match, index) => {
                historyMessage += `${index + 1}. ${match.result || 'Не завершен'}\n`;
                historyMessage += `   📅 ${new Date(match.scheduledTime).toLocaleDateString()}\n`;
                historyMessage += `   👥 Соперник: ${match.opponentName || 'Неизвестно'}\n\n`;
            });
            await ctx.reply(historyMessage, { parse_mode: 'Markdown' });
        }
        catch (error) {
            this.logger.error(`Ошибка получения истории матчей: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply('❌ Ошибка при загрузке истории матчей');
        }
    }
    async handlePlay(ctx) {
        this.logger.log('🎾 ИГРАТЬ кнопка нажата');
        await ctx.reply('🎾 **Поиск игры**\n\nЭта функция будет доступна после настройки профиля.', { parse_mode: 'Markdown' });
    }
    async handleTournaments(ctx) {
        this.logger.log('🏆 ТУРНИРЫ кнопка нажата');
        await ctx.reply('🏆 **Турниры**\n\nСписок доступных турниров будет здесь.', { parse_mode: 'Markdown' });
    }
    async handleText(ctx) {
        if (!ctx.message || !('text' in ctx.message))
            return;
        const text = ctx.message.text;
        const userId = ctx.from?.id.toString();
        if (!userId)
            return;
        const userState = this.getUserState(userId);
        this.logger.log(`💬 Текст от ${userId}, состояние: ${userState.step}, текст: "${text}"`);
        // Обрабатываем процесс настройки профиля
        if (userState.step !== user_state_interface_1.ProfileStep.IDLE) {
            await this.handleProfileSetup(ctx, text, userId, userState);
            return;
        }
        // Обычные сообщения вне настройки профиля
        if (!text.startsWith('/') && !['👤', '🎾', '🏆', '📝', '📱', '🤖'].some(emoji => text.includes(emoji))) {
            await ctx.reply(`Вы написали: "${text}"\n\n` +
                `Используйте команды:\n` +
                `• /start - начать\n` +
                `• /menu - показать меню\n` +
                `• /debug - отладка\n\n` +
                `Или выберите действие из меню ниже:`, this.getMainKeyboard());
        }
    }
    async handleProfileSetup(ctx, text, userId, userState) {
        switch (userState.step) {
            case user_state_interface_1.ProfileStep.AWAITING_FIRST_NAME:
                await this.handleFirstName(ctx, text, userId, userState);
                break;
            case user_state_interface_1.ProfileStep.AWAITING_LAST_NAME:
                await this.handleLastName(ctx, text, userId, userState);
                break;
            case user_state_interface_1.ProfileStep.AWAITING_CITY:
                await this.handleCity(ctx, text, userId, userState);
                break;
            case user_state_interface_1.ProfileStep.AWAITING_COURT:
                await this.handleCourt(ctx, text, userId, userState);
                break;
            default:
                this.logger.warn(`Неизвестное состояние: ${userState.step}`);
                break;
        }
    }
    async handleFirstName(ctx, text, userId, userState) {
        userState.data.firstName = text.trim();
        userState.step = user_state_interface_1.ProfileStep.AWAITING_LAST_NAME;
        this.setUserState(userId, userState);
        await ctx.reply(`✅ Имя: **${text}**\n\n` +
            `**Шаг 2 из 8**\n\n` +
            `Теперь введите вашу **фамилию**:`, { parse_mode: 'Markdown' });
    }
    async handleLastName(ctx, text, userId, userState) {
        userState.data.lastName = text.trim();
        userState.step = user_state_interface_1.ProfileStep.AWAITING_CITY;
        this.setUserState(userId, userState);
        await ctx.reply(`✅ Фамилия: **${text}**\n\n` +
            `**Шаг 3 из 8**\n\n` +
            `В каком **городе** вы играете в теннис?`, { parse_mode: 'Markdown' });
    }
    async handleCity(ctx, text, userId, userState) {
        userState.data.city = text.trim();
        userState.step = user_state_interface_1.ProfileStep.AWAITING_COURT;
        this.setUserState(userId, userState);
        await ctx.reply(`✅ Город: **${text}**\n\n` +
            `**Шаг 4 из 8**\n\n` +
            `На каком **корте** вы чаще всего играете? (можно указать название корта или "любой")`, { parse_mode: 'Markdown' });
    }
    async handleCourt(ctx, text, userId, userState) {
        userState.data.preferredCourt = text.trim();
        userState.step = user_state_interface_1.ProfileStep.AWAITING_HAND;
        this.setUserState(userId, userState);
        const keyboard = telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('🤚 Правша', 'hand_right')],
            [telegraf_1.Markup.button.callback('🤚 Левша', 'hand_left')],
        ]);
        await ctx.reply(`✅ Корт: **${text}**\n\n` +
            `**Шаг 5 из 8**\n\n` +
            `Какой рукой вы играете?`, {
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup
        });
    }
    async handleHand(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        const userState = this.getUserState(userId);
        const hand = ctx.callbackQuery.data === 'hand_right' ? 'RIGHT' : 'LEFT';
        const handText = hand === 'RIGHT' ? 'Правша' : 'Левша';
        userState.data.dominantHand = hand;
        userState.step = user_state_interface_1.ProfileStep.AWAITING_FREQUENCY;
        this.setUserState(userId, userState);
        const keyboard = telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('1 раз в неделю', 'freq_once')],
            [telegraf_1.Markup.button.callback('2 раза в неделю', 'freq_twice')],
            [telegraf_1.Markup.button.callback('3 раза в неделю', 'freq_three')],
            [telegraf_1.Markup.button.callback('4+ раз в неделю', 'freq_four_plus')],
        ]);
        await ctx.editMessageText(`✅ Игровая рука: **${handText}**\n\n` +
            `**Шаг 6 из 8**\n\n` +
            `Как часто вы играете в теннис?`, {
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup
        });
    }
    async handleFrequency(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        const userState = this.getUserState(userId);
        const freqMap = {
            'freq_once': { value: 'ONCE', text: '1 раз в неделю' },
            'freq_twice': { value: 'TWICE', text: '2 раза в неделю' },
            'freq_three': { value: 'THREE_TIMES', text: '3 раза в неделю' },
            'freq_four_plus': { value: 'FOUR_PLUS', text: '4+ раз в неделю' }
        };
        const freq = freqMap[ctx.callbackQuery.data];
        userState.data.weeklyPlayFrequency = freq.value;
        userState.step = user_state_interface_1.ProfileStep.AWAITING_TOURNAMENTS;
        this.setUserState(userId, userState);
        const keyboard = telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('✅ Да, участвую', 'tournaments_yes')],
            [telegraf_1.Markup.button.callback('❌ Нет, не участвую', 'tournaments_no')],
        ]);
        await ctx.editMessageText(`✅ Частота игры: **${freq.text}**\n\n` +
            `**Шаг 7 из 8**\n\n` +
            `Участвуете ли вы в турнирах?`, {
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup
        });
    }
    async handleTournamentsChoice(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        const userState = this.getUserState(userId);
        const playsInTournaments = ctx.callbackQuery.data === 'tournaments_yes';
        const tournamentsText = playsInTournaments ? 'Да, участвую' : 'Нет, не участвую';
        userState.data.playsInTournaments = playsInTournaments;
        userState.step = user_state_interface_1.ProfileStep.AWAITING_LEVEL;
        this.setUserState(userId, userState);
        const keyboard = telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('🟢 Новичок (1.0-2.0)', 'level_beginner')],
            [telegraf_1.Markup.button.callback('🔵 Любитель (2.5-3.5)', 'level_amateur')],
            [telegraf_1.Markup.button.callback('🟡 Уверенный игрок (4.0-4.5)', 'level_confident')],
            [telegraf_1.Markup.button.callback('🟠 Турнирный уровень (5.0-6.0)', 'level_tournament')],
            [telegraf_1.Markup.button.callback('🔴 Полупрофи / тренер', 'level_semipro')],
        ]);
        await ctx.editMessageText(`✅ Турниры: **${tournamentsText}**\n\n` +
            `**Шаг 8 из 8**\n\n` +
            `Какой у вас уровень игры?`, {
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup
        });
    }
    async handleLevel(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        const userState = this.getUserState(userId);
        const levelMap = {
            'level_beginner': { value: 'BEGINNER', text: 'Новичок (1.0-2.0)' },
            'level_amateur': { value: 'AMATEUR', text: 'Любитель (2.5-3.5)' },
            'level_confident': { value: 'CONFIDENT', text: 'Уверенный игрок (4.0-4.5)' },
            'level_tournament': { value: 'TOURNAMENT', text: 'Турнирный уровень (5.0-6.0)' },
            'level_semipro': { value: 'SEMI_PRO', text: 'Полупрофи / тренер' }
        };
        const level = levelMap[ctx.callbackQuery.data];
        userState.data.selfAssessedLevel = level.value;
        this.setUserState(userId, userState);
        await ctx.editMessageText(`✅ Уровень игры: **${level.text}**\n\n` +
            `🔄 Сохраняю ваш профиль...`, { parse_mode: 'Markdown' });
        // Сохраняем профиль
        await this.saveProfile(ctx, userId, userState);
    }
    async saveProfile(ctx, userId, userState) {
        try {
            const user = await this.usersService.findByTelegramId(userId);
            if (!user) {
                await ctx.reply('❌ Ошибка: пользователь не найден');
                return;
            }
            const profileData = userState.data;
            // Сохраняем первый шаг профиля
            const stepOneData = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                city: profileData.city,
                preferredCourt: profileData.preferredCourt,
                dominantHand: profileData.dominantHand,
                preferredPlayTime: ['EVENING'],
                playsInTournaments: profileData.playsInTournaments,
                weeklyPlayFrequency: profileData.weeklyPlayFrequency,
            };
            await this.usersService.completeProfileStepOne(user.id.toString(), stepOneData);
            // Сохраняем второй шаг профиля
            const stepTwoData = {
                selfAssessedLevel: profileData.selfAssessedLevel,
                ntrpRating: this.getNtrpRating(profileData.selfAssessedLevel),
                backhandType: 'TWO_HANDED',
                preferredSurface: 'HARD',
                playingStyle: 'UNIVERSAL',
                favoriteShot: 'FOREHAND',
                opponentPreference: 'ANY' // Значение по умолчанию
            };
            await this.usersService.completeProfileStepTwo(user.id.toString(), stepTwoData);
            const summaryMessage = `✅ **Профиль успешно настроен!**\n\n` +
                `👤 **Ваши данные:**\n` +
                `• Имя: ${profileData.firstName} ${profileData.lastName}\n` +
                `• Город: ${profileData.city}\n` +
                `• Корт: ${profileData.preferredCourt || 'Любой'}\n` +
                `• Игровая рука: ${profileData.dominantHand === 'RIGHT' ? 'Правша' : 'Левша'}\n` +
                `• Частота игры: ${this.getFrequencyText(profileData.weeklyPlayFrequency)}\n` +
                `• Турниры: ${profileData.playsInTournaments ? 'Участвую' : 'Не участвую'}\n` +
                `• Уровень: ${this.getLevelText(profileData.selfAssessedLevel)}\n\n` +
                `Теперь вы можете искать партнёров для игры! 🎾`;
            await ctx.editMessageText(summaryMessage, { parse_mode: 'Markdown' });
            // Показываем главное меню
            await ctx.reply('Главное меню:', this.getMainKeyboard());
            // Очищаем состояние пользователя
            this.clearUserState(userId);
        }
        catch (error) {
            this.logger.error(`Ошибка сохранения профиля: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply('❌ Произошла ошибка при сохранении профиля. Попробуйте позже.');
        }
    }
    getNtrpRating(level) {
        const ratingMap = {
            'BEGINNER': 2.0,
            'AMATEUR': 3.0,
            'CONFIDENT': 4.0,
            'TOURNAMENT': 5.0,
            'SEMI_PRO': 5.5
        };
        return ratingMap[level] || 3.0;
    }
    getFrequencyText(frequency) {
        const freqMap = {
            'ONCE': '1 раз в неделю',
            'TWICE': '2 раза в неделю',
            'THREE_TIMES': '3 раза в неделю',
            'FOUR_PLUS': '4+ раз в неделю'
        };
        return freqMap[frequency] || frequency;
    }
    getLevelText(level) {
        const levelMap = {
            'BEGINNER': 'Новичок (1.0-2.0)',
            'AMATEUR': 'Любитель (2.5-3.5)',
            'CONFIDENT': 'Уверенный игрок (4.0-4.5)',
            'TOURNAMENT': 'Турнирный уровень (5.0-6.0)',
            'SEMI_PRO': 'Полупрофи / тренер'
        };
        return levelMap[level] || level;
    }
};
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleStart", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('debug'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleDebug", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('menu'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMenu", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('👤 Профиль'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleProfile", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('setup_profile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSetupProfile", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('detailed_stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleDetailedStats", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('match_history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMatchHistory", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🎾 Играть'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handlePlay", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🏆 Турниры'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTournaments", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleText", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(['hand_right', 'hand_left']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleHand", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(['freq_once', 'freq_twice', 'freq_three', 'freq_four_plus']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleFrequency", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(['tournaments_yes', 'tournaments_no']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTournamentsChoice", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(['level_beginner', 'level_amateur', 'level_confident', 'level_tournament', 'level_semipro']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevel", null);
BotService = BotService_1 = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        users_service_1.UsersService])
], BotService);
exports.BotService = BotService;
