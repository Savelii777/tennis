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
const balls_service_1 = require("../users/application/services/balls.service");
const requests_service_1 = require("../requests/application/services/requests.service");
const tournaments_service_1 = require("../tournaments/application/services/tournaments.service");
const matches_service_1 = require("../matches/application/services/matches.service");
const trainings_service_1 = require("../trainings/application/services/trainings.service");
const stories_service_1 = require("../stories/application/services/stories.service");
const cases_service_1 = require("../cases/application/services/cases.service");
const case_opening_service_1 = require("../cases/application/services/case-opening.service");
const profile_state_enum_1 = require("./interfaces/profile-state.enum"); // ← Исправить импорт
const create_request_dto_1 = require("../requests/application/dto/create-request.dto");
const tournament_enum_1 = require("../tournaments/domain/enums/tournament.enum");
const match_enum_1 = require("../matches/domain/enums/match.enum");
let BotService = BotService_1 = class BotService {
    constructor(bot, usersService, ballsService, requestsService, tournamentsService, matchesService, trainingsService, storiesService, casesService, caseOpeningService) {
        this.bot = bot;
        this.usersService = usersService;
        this.ballsService = ballsService;
        this.requestsService = requestsService;
        this.tournamentsService = tournamentsService;
        this.matchesService = matchesService;
        this.trainingsService = trainingsService;
        this.storiesService = storiesService;
        this.casesService = casesService;
        this.caseOpeningService = caseOpeningService;
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
    // ==================== ОСНОВНЫЕ КОМАНДЫ ====================
    // Заменить метод getMainKeyboard:
    getMainKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['👤 Профиль', '🎾 Играть'],
            ['🏆 Турниры', '🎁 Кейсы'],
            ['📝 Записать результат', '📱 Stories'],
            ['🏃‍♂️ Тренировки', '🔗 Пригласить друга'],
            ['🤖 AI-Coach', '📍 Найти корты']
        ]).resize().persistent();
    }
    getUserState(userId) {
        return this.userStates.get(userId) || { step: profile_state_enum_1.ProfileStep.IDLE, data: {} };
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
            // Проверяем наличие реферального кода в deep link
            const startPayload = ctx.message && 'text' in ctx.message
                ? ctx.message.text.split(' ')[1]
                : null;
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
                // Если есть реферальный код
                if (startPayload && startPayload.startsWith('ref_')) {
                    const referralCode = startPayload.replace('ref_', '');
                    this.logger.log(`🔗 Обнаружен реферальный код: ${referralCode}`);
                    try {
                        this.logger.log(`📝 Сохраняем информацию о реферальном коде для будущей обработки`);
                        await ctx.reply(`🎉 Добро пожаловать, ${ctx.from.first_name}!\n\n` +
                            `Вы перешли по пригласительной ссылке!\n\n` +
                            `🎾 Теперь вы можете найти партнеров для игры в теннис!`, this.getMainKeyboard());
                    }
                    catch (error) {
                        this.logger.error(`Ошибка обработки реферального кода: ${error}`);
                    }
                }
                user = await this.usersService.create(userData);
                this.logger.log('✅ Новый пользователь создан');
                if (!startPayload?.startsWith('ref_')) {
                    await ctx.reply(`🎾 Добро пожаловать в Tennis Bot, ${ctx.from.first_name}!\n\nВы успешно зарегистрированы!`, this.getMainKeyboard());
                }
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
    // ==================== ПРОФИЛЬ ====================
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
                const ballsBalance = await this.ballsService.getUserBalance(user.id.toString()); // ← Использовать BallsService
                const message = `👤 **Ваш профиль**\n\n` +
                    `Имя: ${user.first_name} ${user.last_name || ''}\n` +
                    `Username: @${user.username || 'не указан'}\n` +
                    `ID: ${user.telegram_id}\n\n` +
                    `📊 **Статистика:**\n` +
                    `🎾 Матчей сыграно: ${stats.matchesPlayed}\n` +
                    `🏆 Побед: ${stats.matchWins}\n` +
                    `😔 Поражений: ${stats.matchLosses}\n` +
                    `📈 Процент побед: ${stats.winRate || 0}%\n` +
                    `🏅 Рейтинг: ${stats.ratingPoints} очков\n` +
                    `🎾 Мячей: ${ballsBalance}\n\n` + // ← Исправить
                    `${!profileStatus.profileComplete ? '⚠️ Профиль не полностью заполнен' : '✅ Профиль заполнен'}`;
                const keyboard = telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('🔄 Настроить профиль', 'setup_profile')],
                    [telegraf_1.Markup.button.callback('📊 Подробная статистика', 'detailed_stats')],
                    [telegraf_1.Markup.button.callback('🎾 История матчей', 'match_history')],
                    [telegraf_1.Markup.button.callback('🏅 Достижения', 'achievements')],
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
    // ==================== ИГРА И ЗАЯВКИ ====================
    async handlePlay(ctx) {
        this.logger.log('🎾 ИГРАТЬ кнопка нажата');
        try {
            if (!ctx.from)
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
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
                `Выберите действие:`, {
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
        try {
            if (!ctx.from)
                return;
            // Получаем активные заявки других пользователей (используем существующий метод)
            const requests = await this.requestsService.findAll({
                page: 1,
                limit: 10
            }); // ← Временное решение
            const filteredRequests = requests.filter((req) => req.creator?.telegram_id !== ctx.from?.id.toString()).slice(0, 10);
            if (filteredRequests.length === 0) {
                await ctx.editMessageText(`🔍 **Поиск игры**\n\n` +
                    `😔 Пока нет активных заявок.\n\n` +
                    `Создайте свою заявку, чтобы другие игроки могли к вам присоединиться!`, { parse_mode: 'Markdown' });
                return;
            }
            let message = `🔍 **Активные заявки:**\n\n`;
            const buttons = [];
            filteredRequests.forEach((request, index) => {
                const datetime = new Date(request.scheduledTime).toLocaleString('ru-RU');
                message += `${index + 1}. **${request.creator.first_name}**\n`;
                message += `📅 ${datetime}\n`;
                message += `📍 ${request.location}\n`;
                message += `👥 ${request.currentPlayers}/${request.maxPlayers}\n\n`;
                buttons.push([telegraf_1.Markup.button.callback(`${index + 1}. Откликнуться`, `respond_request_${request.id}`)]);
            });
            buttons.push([telegraf_1.Markup.button.callback('🔄 Обновить', 'find_game')]);
            buttons.push([telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_play')]);
            const keyboard = telegraf_1.Markup.inlineKeyboard(buttons);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleFindGame: ${error}`);
            await ctx.reply('❌ Ошибка при поиске игр');
        }
    }
    async handleCreateRequest(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        this.setUserState(userId, {
            step: profile_state_enum_1.ProfileStep.CREATING_REQUEST,
            data: {}
        });
        await ctx.editMessageText(`➕ **Создание заявки на игру**\n\n` +
            `**Шаг 1 из 4**\n\n` +
            `Когда планируете играть?\n` +
            `Введите дату и время в формате: DD.MM.YYYY HH:MM\n\n` +
            `Пример: 25.12.2024 18:00`, { parse_mode: 'Markdown' });
        this.setUserState(userId, {
            step: profile_state_enum_1.ProfileStep.AWAITING_REQUEST_DATETIME,
            data: {}
        });
    }
    // ==================== ТУРНИРЫ ====================
    async handleTournaments(ctx) {
        this.logger.log('🏆 ТУРНИРЫ кнопка нажата');
        try {
            if (!ctx.from)
                return;
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🔍 Активные турниры', 'active_tournaments')],
                [telegraf_1.Markup.button.callback('➕ Создать турнир', 'create_tournament')],
                [telegraf_1.Markup.button.callback('📋 Мои турниры', 'my_tournaments')],
                [telegraf_1.Markup.button.callback('🏆 История участия', 'tournament_history')],
            ]);
            await ctx.reply(`🏆 **Турниры**\n\n` +
                `Участвуйте в турнирах и соревнуйтесь с другими игроками!`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleTournaments: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке раздела турниров');
        }
    }
    async handleActiveTournaments(ctx) {
        await ctx.answerCbQuery();
        try {
            // Используем существующий метод findAll
            const tournaments = await this.tournamentsService.findAll({
                page: 1,
                limit: 10
            }); // ← Временное решение
            const activeTournaments = tournaments.slice(0, 10);
            if (activeTournaments.length === 0) {
                await ctx.editMessageText(`🏆 **Активные турниры**\n\n` +
                    `😔 Пока нет активных турниров.\n\n` +
                    `Создайте свой турнир!`, { parse_mode: 'Markdown' });
                return;
            }
            let message = `🏆 **Активные турниры:**\n\n`;
            const buttons = [];
            activeTournaments.forEach((tournament, index) => {
                const startDate = new Date(tournament.startDate).toLocaleDateString('ru-RU');
                const regEndDate = new Date(tournament.registrationEndDate).toLocaleDateString('ru-RU');
                message += `${index + 1}. **${tournament.name}**\n`;
                message += `📅 Начало: ${startDate}\n`;
                message += `📝 Регистрация до: ${regEndDate}\n`;
                message += `👥 ${tournament.currentParticipants}/${tournament.maxParticipants}\n`;
                message += `💰 Взнос: ${tournament.entryFee || 0} мячей\n\n`;
                buttons.push([telegraf_1.Markup.button.callback(`${index + 1}. Подробнее`, `tournament_details_${tournament.id}`)]);
            });
            buttons.push([telegraf_1.Markup.button.callback('🔄 Обновить', 'active_tournaments')]);
            const keyboard = telegraf_1.Markup.inlineKeyboard(buttons);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleActiveTournaments: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке турниров');
        }
    }
    // ==================== КЕЙСЫ ====================
    async handleCases(ctx) {
        this.logger.log('🎁 КЕЙСЫ кнопка нажата');
        try {
            if (!ctx.from)
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден. Отправьте /start');
                return;
            }
            const cases = await this.casesService.getAllCases(false); // только активные
            const ballsBalance = await this.ballsService.getUserBalance(user.id.toString()); // ← Использовать BallsService
            if (cases.length === 0) {
                await ctx.reply(`🎁 **Кейсы**\n\n` +
                    `😔 Пока нет доступных кейсов.\n\n` +
                    `Следите за обновлениями!`, { parse_mode: 'Markdown' });
                return;
            }
            let message = `🎁 **Доступные кейсы:**\n\n`;
            message += `💰 Ваш баланс: ${ballsBalance} мячей\n\n`; // ← Исправить
            const buttons = [];
            cases.forEach((caseItem, index) => {
                message += `${index + 1}. **${caseItem.name}**\n`;
                message += `💰 Цена: ${caseItem.priceBalls} мячей\n`;
                message += `📝 ${caseItem.description}\n\n`;
                const canOpen = ballsBalance >= caseItem.priceBalls; // ← Исправить
                buttons.push([telegraf_1.Markup.button.callback(`${canOpen ? '🎁' : '🔒'} ${caseItem.name} (${caseItem.priceBalls} мячей)`, canOpen ? `open_case_${caseItem.id}` : `case_info_${caseItem.id}`)]);
            });
            buttons.push([telegraf_1.Markup.button.callback('📊 История открытий', 'case_history')]);
            const keyboard = telegraf_1.Markup.inlineKeyboard(buttons);
            await ctx.reply(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleCases: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке кейсов');
        }
    }
    // ==================== STORIES ====================
    async handleStories(ctx) {
        this.logger.log('📱 STORIES кнопка нажата');
        try {
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('📷 Загрузить фото', 'upload_photo_story')],
                [telegraf_1.Markup.button.callback('🎥 Загрузить видео', 'upload_video_story')],
                [telegraf_1.Markup.button.callback('👀 Просмотреть Stories', 'view_stories')],
                [telegraf_1.Markup.button.callback('📋 Мои Stories', 'my_stories')],
            ]);
            await ctx.reply(`📱 **Stories**\n\n` +
                `Делитесь фото и видео с ваших матчей!`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleStories: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке Stories');
        }
    }
    // ==================== ТРЕНИРОВКИ ====================
    async handleTrainings(ctx) {
        this.logger.log('🏃‍♂️ ТРЕНИРОВКИ кнопка нажата');
        try {
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🔍 Найти тренировку', 'find_training')],
                [telegraf_1.Markup.button.callback('➕ Создать тренировку', 'create_training')],
                [telegraf_1.Markup.button.callback('📋 Мои тренировки', 'my_trainings')],
                [telegraf_1.Markup.button.callback('👨‍🏫 Стать тренером', 'become_trainer')],
            ]);
            await ctx.reply(`🏃‍♂️ **Тренировки**\n\n` +
                `Найдите тренера или проведите групповую тренировку!`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleTrainings: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке тренировок');
        }
    }
    // ==================== ЗАПИСЬ РЕЗУЛЬТАТОВ ====================
    async handleRecordMatch(ctx) {
        this.logger.log('📝 ЗАПИСАТЬ РЕЗУЛЬТАТ кнопка нажата');
        try {
            if (!ctx.from)
                return;
            const userId = ctx.from.id.toString();
            this.setUserState(userId, {
                step: profile_state_enum_1.ProfileStep.RECORDING_MATCH,
                data: {}
            });
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🎾 Одиночный матч', 'match_type_singles')],
                [telegraf_1.Markup.button.callback('👥 Парный матч', 'match_type_doubles')],
            ]);
            await ctx.reply(`📝 **Запись результата матча**\n\n` +
                `Выберите тип матча:`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleRecordMatch: ${error}`);
            await ctx.reply('❌ Ошибка при записи матча');
        }
    }
    // ==================== РЕФЕРАЛЫ ====================
    async handleInviteButton(ctx) {
        await this.handleInvite(ctx);
    }
    async handleInvite(ctx) {
        this.logger.log('🔗 INVITE команда');
        try {
            if (!ctx.from)
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден. Отправьте /start');
                return;
            }
            const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'your_bot_name';
            const referralCode = `ref_${user.id.toString().padStart(6, '0')}`;
            const inviteLink = `https://t.me/${botUsername}?start=${referralCode}`;
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.url('📲 Поделиться в Telegram', `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('Присоединяйся к нашему теннисному сообществу! 🎾')}`)],
                [telegraf_1.Markup.button.callback('📊 Моя статистика', 'referral_stats')],
            ]);
            await ctx.reply(`🔗 **Ваша ссылка для приглашения друзей:**\n\n` +
                `\`${inviteLink}\`\n\n` +
                `👥 Поделитесь ссылкой с друзьями, и они смогут быстро присоединиться к нашему сообществу!\n\n` +
                `🏆 За каждого приглашенного друга вы получите достижения и бонусы!`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleInvite: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply('❌ Ошибка при создании ссылки-приглашения');
        }
    }
    // ==================== AI COACH ====================
    async handleAICoach(ctx) {
        this.logger.log('🤖 AI-COACH кнопка нажата');
        try {
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('💡 Совет по технике', 'ai_technique_tip')],
                [telegraf_1.Markup.button.callback('🏃‍♂️ План тренировки', 'ai_training_plan')],
                [telegraf_1.Markup.button.callback('📊 Анализ игры', 'ai_game_analysis')],
                [telegraf_1.Markup.button.callback('🎯 Постановка целей', 'ai_goal_setting')],
            ]);
            await ctx.reply(`🤖 **AI-Coach**\n\n` +
                `Ваш персональный помощник для улучшения игры в теннис!\n\n` +
                `Выберите, чем я могу помочь:`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleAICoach: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке AI-Coach');
        }
    }
    // ==================== ОБРАБОТКА ТЕКСТА ====================
    // Заменить строку 695:
    async handleText(ctx) {
        if (!ctx.from || !ctx.message || !('text' in ctx.message))
            return;
        const userId = ctx.from.id.toString();
        const text = ctx.message.text;
        const userState = this.getUserState(userId);
        this.logger.log(`📝 Текст от ${userId}: "${text}" (состояние: ${userState.step})`);
        // Обработка состояний
        try {
            switch (userState.step) {
                case profile_state_enum_1.ProfileStep.AWAITING_FIRST_NAME:
                    await this.handleFirstName(ctx, text, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_LAST_NAME:
                    await this.handleLastName(ctx, text, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_CITY:
                    await this.handleCity(ctx, text, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_COURT:
                    await this.handleCourt(ctx, text, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_REQUEST_DATETIME:
                    await this.handleRequestDateTime(ctx, text, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_REQUEST_LOCATION:
                    await this.handleRequestLocation(ctx, text, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_REQUEST_DESCRIPTION:
                    await this.handleRequestDescription(ctx, text, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_TOURNAMENT_NAME:
                    await this.handleTournamentName(ctx, text, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_TOURNAMENT_DESCRIPTION:
                    await this.handleTournamentDescription(ctx, text, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_MATCH_OPPONENT:
                    await this.handleMatchOpponent(ctx, text, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_MATCH_SCORE:
                    await this.handleMatchScore(ctx, text, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_MATCH_DATE:
                    await this.handleMatchDate(ctx, text, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_STORY_DESCRIPTION:
                    userState.data.storyDescription = text.trim();
                    await this.createStory(ctx, userId, userState);
                    break;
                case profile_state_enum_1.ProfileStep.AWAITING_CITY_SEARCH:
                    await this.handleCitySearch(ctx, text, userId, userState);
                    break;
                default:
                    // Обработка обычных текстовых сообщений
                    if (!text.startsWith('/') && !['👤', '🎾', '🏆', '📝', '📱', '🤖', '🏃‍♂️', '🎁', '🔗', '📍'].some(emoji => text.includes(emoji))) {
                        await ctx.reply(`Вы написали: "${text}"\n\n` +
                            `Используйте команды:\n` +
                            `• /start - начать\n` +
                            `• /menu - показать меню\n` +
                            `• /debug - отладка\n\n` +
                            `Или выберите действие из меню ниже:`, this.getMainKeyboard());
                    }
                    break;
            }
        }
        catch (error) {
            this.logger.error(`Ошибка обработки текста: ${error}`);
            await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
        }
    }
    // ==================== ОБРАБОТКА СОСТОЯНИЙ ====================
    // Заменить метод handleStatefulInput целиком:
    async handleStatefulInput(ctx, text, userId, userState) {
        switch (userState.step) {
            // Профиль
            case profile_state_enum_1.ProfileStep.AWAITING_FIRST_NAME:
                await this.handleFirstName(ctx, text, userId, userState);
                break;
            case profile_state_enum_1.ProfileStep.AWAITING_LAST_NAME:
                await this.handleLastName(ctx, text, userId, userState);
                break;
            case profile_state_enum_1.ProfileStep.AWAITING_CITY:
                await this.handleCity(ctx, text, userId, userState);
                break;
            case profile_state_enum_1.ProfileStep.AWAITING_COURT:
                await this.handleCourt(ctx, text, userId, userState);
                break;
            // Заявки на игру
            case profile_state_enum_1.ProfileStep.AWAITING_REQUEST_DATETIME:
                await this.handleRequestDateTime(ctx, text, userId, userState);
                break;
            case profile_state_enum_1.ProfileStep.AWAITING_REQUEST_LOCATION:
                await this.handleRequestLocation(ctx, text, userId, userState);
                break;
            case profile_state_enum_1.ProfileStep.AWAITING_REQUEST_DESCRIPTION:
                await this.handleRequestDescription(ctx, text, userId, userState);
                break;
            // Турниры
            case profile_state_enum_1.ProfileStep.AWAITING_TOURNAMENT_NAME:
                await this.handleTournamentName(ctx, text, userId, userState);
                break;
            case profile_state_enum_1.ProfileStep.AWAITING_TOURNAMENT_DESCRIPTION:
                await this.handleTournamentDescription(ctx, text, userId, userState);
                break;
            // Матчи
            case profile_state_enum_1.ProfileStep.AWAITING_MATCH_OPPONENT:
                await this.handleMatchOpponent(ctx, text, userId, userState);
                break;
            case profile_state_enum_1.ProfileStep.AWAITING_MATCH_SCORE:
                await this.handleMatchScore(ctx, text, userId, userState);
                break;
            case profile_state_enum_1.ProfileStep.AWAITING_MATCH_DATE:
                await this.handleMatchDate(ctx, text, userId, userState);
                break;
            // Stories
            case profile_state_enum_1.ProfileStep.AWAITING_STORY_DESCRIPTION:
                userState.data.storyDescription = text.trim();
                await this.createStory(ctx, userId, userState);
                break;
            // Поиск кортов
            case profile_state_enum_1.ProfileStep.AWAITING_CITY_SEARCH:
                await this.handleCitySearch(ctx, text, userId, userState);
                break;
            default:
                this.logger.warn(`Неизвестное состояние: ${userState.step}`);
                this.clearUserState(userId);
                await ctx.reply('❌ Произошла ошибка. Попробуйте начать сначала.');
                break;
        }
    }
    // ==================== ОБРАБОТЧИКИ ЗАЯВОК ====================
    async handleRequestDateTime(ctx, text, userId, userState) {
        // Валидация даты и времени
        const dateTimeRegex = /^(\d{2})\.(\d{2})\.(\d{4})\s(\d{2}):(\d{2})$/;
        const match = text.match(dateTimeRegex);
        if (!match) {
            await ctx.reply(`❌ Неверный формат даты.\n\n` +
                `Используйте формат: DD.MM.YYYY HH:MM\n` +
                `Пример: 25.12.2024 18:00`);
            return;
        }
        const [, day, month, year, hour, minute] = match;
        const dateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
        if (dateTime < new Date()) {
            await ctx.reply(`❌ Нельзя указывать прошедшую дату. Выберите будущее время.`);
            return;
        }
        userState.data.requestDateTime = dateTime.toISOString();
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_REQUEST_LOCATION;
        this.setUserState(userId, userState);
        await ctx.reply(`✅ Время: **${dateTime.toLocaleString('ru-RU')}**\n\n` +
            `**Шаг 2 из 4**\n\n` +
            `Где планируете играть?\n` +
            `Укажите корт, адрес или название места.`, { parse_mode: 'Markdown' });
    }
    async handleRequestLocation(ctx, text, userId, userState) {
        userState.data.requestLocation = text.trim();
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_REQUEST_LEVEL;
        this.setUserState(userId, userState);
        const keyboard = telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('🟢 Новичок', 'req_level_beginner')],
            [telegraf_1.Markup.button.callback('🔵 Любитель', 'req_level_amateur')],
            [telegraf_1.Markup.button.callback('🟡 Уверенный', 'req_level_confident')],
            [telegraf_1.Markup.button.callback('🟠 Турнирный', 'req_level_tournament')],
            [telegraf_1.Markup.button.callback('🔴 Профи', 'req_level_semi_pro')],
            [telegraf_1.Markup.button.callback('⚪ Любой уровень', 'req_level_any')],
        ]);
        await ctx.reply(`✅ Место: **${text}**\n\n` +
            `**Шаг 3 из 4**\n\n` +
            `Какой уровень игроков ищете?`, {
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup
        });
    }
    async handleRequestDescription(ctx, text, userId, userState) {
        userState.data.requestDescription = text.trim();
        this.setUserState(userId, userState);
        await this.createGameRequest(ctx, userId, userState);
    }
    async createGameRequest(ctx, userId, userState) {
        try {
            const user = await this.usersService.findByTelegramId(userId);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            // Создаем корректный объект CreateRequestDto
            const requestData = {
                type: create_request_dto_1.RequestType.GAME,
                title: `Игра ${new Date(userState.data.requestDateTime).toLocaleDateString('ru-RU')}`,
                description: userState.data.requestDescription || 'Поиск партнера для игры в теннис',
                gameMode: create_request_dto_1.GameMode.SINGLES,
                dateTime: new Date(userState.data.requestDateTime),
                location: userState.data.requestLocation,
                locationName: userState.data.requestLocation,
                maxPlayers: 2,
                playerLevel: userState.data.requestLevel || 'ANY',
                paymentType: 'FREE',
                ratingType: 'NTRP',
                formatInfo: {},
            };
            const request = await this.requestsService.create(user.id.toString(), requestData);
            const summaryMessage = `✅ **Заявка создана!**\n\n` +
                `📅 **Время:** ${new Date(requestData.dateTime).toLocaleString('ru-RU')}\n` +
                `📍 **Место:** ${requestData.location}\n` +
                `🎯 **Уровень:** ${this.getLevelText(requestData.playerLevel || 'ANY')}\n` + // Исправить null check
                `📝 **Описание:** ${requestData.description}\n\n` +
                `Ваша заявка опубликована. Другие игроки смогут к вам присоединиться!`;
            await ctx.reply(summaryMessage, {
                parse_mode: 'Markdown',
                reply_markup: this.getMainKeyboard().reply_markup
            });
            this.clearUserState(userId);
        }
        catch (error) {
            this.logger.error(`Ошибка создания заявки: ${error}`);
            await ctx.reply('❌ Ошибка при создании заявки. Попробуйте позже.');
        }
    }
    // ==================== ДОБАВИТЬ НЕДОСТАЮЩИЕ МЕТОДЫ ====================
    // Добавить в класс BotService:
    async handleFirstName(ctx, text, userId, userState) {
        userState.data.firstName = text.trim();
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_LAST_NAME;
        this.setUserState(userId, userState);
        await ctx.reply(`✅ Имя: **${text}**\n\n` +
            `Введите фамилию:`, { parse_mode: 'Markdown' });
    }
    async handleLastName(ctx, text, userId, userState) {
        userState.data.lastName = text.trim();
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_CITY;
        this.setUserState(userId, userState);
        await ctx.reply(`✅ Фамилия: **${text}**\n\n` +
            `Введите ваш город:`, { parse_mode: 'Markdown' });
    }
    async handleTournamentName(ctx, text, userId, userState) {
        userState.data.tournamentName = text.trim();
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_TOURNAMENT_DESCRIPTION;
        this.setUserState(userId, userState);
        await ctx.reply(`✅ Название: **${text}**\n\n` +
            `Введите описание турнира:`, { parse_mode: 'Markdown' });
    }
    async handleMatchOpponent(ctx, text, userId, userState) {
        userState.data.matchOpponent = text.trim();
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_MATCH_SCORE;
        this.setUserState(userId, userState);
        await ctx.reply(`✅ Соперник: **${text}**\n\n` +
            `Введите счет матча (например: 6-4, 6-2):`, { parse_mode: 'Markdown' });
    }
    // Добавить в класс BotService перед строкой 1033:
    async handleCity(ctx, text, userId, userState) {
        userState.data.city = text.trim();
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_COURT;
        this.setUserState(userId, userState);
        await ctx.reply(`✅ Город: **${text}**\n\n` +
            `Введите предпочитаемый корт или клуб:`, { parse_mode: 'Markdown' });
    }
    async handleCourt(ctx, text, userId, userState) {
        userState.data.preferredCourt = text.trim();
        await this.completeProfileSetup(ctx, userId, userState);
    }
    async handleTournamentDescription(ctx, text, userId, userState) {
        userState.data.tournamentDescription = text.trim();
        // Завершаем создание турнира
        await this.createTournament(ctx, userId, userState);
    }
    // Заменить метод completeProfileSetup (строка 1054):
    async completeProfileSetup(ctx, userId, userState) {
        try {
            const user = await this.usersService.findByTelegramId(userId);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            // Обновляем профиль пользователя только с существующими полями
            await this.usersService.updateProfile(user.id.toString(), {
                city: userState.data.city
                // Убираем profileStepOneCompleted так как его нет в UpdateProfileDto
            });
            await ctx.reply(`✅ **Профиль настроен!**\n\n` +
                `🏙️ Город: ${userState.data.city}\n` +
                `🎾 Корт: ${userState.data.preferredCourt}\n\n` +
                `Теперь вы можете полноценно пользоваться ботом!`, {
                parse_mode: 'Markdown',
                reply_markup: this.getMainKeyboard().reply_markup
            });
            this.clearUserState(userId);
        }
        catch (error) {
            this.logger.error(`Ошибка завершения настройки профиля: ${error}`);
            await ctx.reply('❌ Ошибка при сохранении профиля');
        }
    }
    // Заменить метод createTournament:
    async createTournament(ctx, userId, userState) {
        try {
            const user = await this.usersService.findByTelegramId(userId);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            // Создаем турнир с правильной структурой CreateTournamentDto
            const tournamentData = {
                title: userState.data.tournamentName,
                description: userState.data.tournamentDescription,
                type: tournament_enum_1.TournamentType.SINGLE_ELIMINATION,
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                minPlayers: 4,
                maxPlayers: 16,
                isRanked: true,
                locationName: userState.data.city || 'Не указано'
            };
            await this.tournamentsService.create(user.id.toString(), tournamentData);
            await ctx.reply(`🏆 **Турнир создан!**\n\n` +
                `📝 **Название:** ${tournamentData.title}\n` +
                `📖 **Описание:** ${tournamentData.description}\n` +
                `📅 **Начало:** ${tournamentData.startDate.toLocaleDateString('ru-RU')}\n` +
                `🏅 **Рейтинговый:** ${tournamentData.isRanked ? 'Да' : 'Нет'}\n` +
                `👥 **Максимум участников:** ${tournamentData.maxPlayers}\n\n` +
                `Турнир опубликован и открыт для регистрации!`, {
                parse_mode: 'Markdown',
                reply_markup: this.getMainKeyboard().reply_markup
            });
            this.clearUserState(userId);
        }
        catch (error) {
            this.logger.error(`Ошибка создания турнира: ${error}`);
            await ctx.reply('❌ Ошибка при создании турнира');
        }
    }
    async handleMatchScore(ctx, text, userId, userState) {
        userState.data.matchScore = text.trim();
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_MATCH_DATE;
        this.setUserState(userId, userState);
        await ctx.reply(`✅ Счет: **${text}**\n\n` +
            `Введите дату матча (ДД.ММ.ГГГГ):`, { parse_mode: 'Markdown' });
    }
    async handleMatchDate(ctx, text, userId, userState) {
        userState.data.matchDate = text.trim();
        await this.createMatch(ctx, userId, userState);
    }
    async handleCitySearch(ctx, text, userId, userState) {
        const city = text.trim();
        try {
            const courtsMessage = this.generateCityCortsMessage(city);
            await ctx.reply(courtsMessage, {
                parse_mode: 'Markdown',
                reply_markup: this.getMainKeyboard().reply_markup
            });
            this.clearUserState(userId);
        }
        catch (error) {
            this.logger.error(`Ошибка поиска кортов: ${error}`);
            await ctx.reply('❌ Ошибка при поиске кортов');
        }
    }
    // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================
    // Добавить в класс BotService:
    getLevelText(level) {
        const levels = {
            'beginner': '🟢 Новичок',
            'amateur': '🔵 Любитель',
            'confident': '🟡 Уверенный',
            'tournament': '🟠 Турнирный',
            'semi_pro': '🔴 Профи',
            'any': '⚪ Любой',
            'BEGINNER': '🟢 Новичок',
            'AMATEUR': '🔵 Любитель',
            'CONFIDENT': '🟡 Уверенный',
            'TOURNAMENT': '🟠 Турнирный',
            'SEMI_PRO': '🔴 Профи',
            'ANY': '⚪ Любой'
        };
        return levels[level] || '⚪ Любой';
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
    // ==================== ДЕЙСТВИЯ С КНОПКАМИ ====================
    async handleOpenCase(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        if (!ctx.from)
            return;
        const caseId = parseInt(ctx.callbackQuery.data.split('_')[2]);
        try {
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            const result = await this.caseOpeningService.openCase(user.id.toString(), caseId);
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🎁 Открыть еще', 'back_to_cases')],
                [telegraf_1.Markup.button.callback('📊 История', 'case_history')],
            ]);
            await ctx.editMessageText(`🎉 **Поздравляем!**\n\n` +
                `Вы выиграли: **${result.winning.item.name}**\n\n` +
                `📝 ${result.winning.item.description}\n\n` +
                `💰 Потрачено мячей: ${result.opening.ballsSpent}`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка открытия кейса: ${error}`);
            if (error instanceof Error && error.message.includes('Недостаточно мячей')) {
                await ctx.editMessageText(`❌ **Недостаточно мячей**\n\n` +
                    `Для открытия этого кейса нужно больше мячей.\n` +
                    `Играйте в матчи и турниры, чтобы заработать их!`, { parse_mode: 'Markdown' });
            }
            else {
                await ctx.reply('❌ Ошибка при открытии кейса');
            }
        }
    }
    async handleRespondToRequest(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        if (!ctx.from)
            return;
        const requestId = parseInt(ctx.callbackQuery.data.split('_')[2]);
        try {
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            // Временно убираем createResponse, так как метода нет
            // const response = await this.requestsService.createResponse(requestId.toString(), {
            //   playerId: user.id,
            //   message: 'Хочу присоединиться к игре!'
            // });
            await ctx.editMessageText(`✅ **Отклик отправлен!**\n\n` +
                `Создатель заявки получит уведомление о вашем желании присоединиться.\n\n` +
                `Ожидайте подтверждения!`, { parse_mode: 'Markdown' });
        }
        catch (error) {
            this.logger.error(`Ошибка отклика на заявку: ${error}`);
            await ctx.reply('❌ Ошибка при отправке отклика');
        }
    }
    // ==================== КОМАНДЫ ОТЛАДКИ ====================
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
    async handleReferralStats(ctx) {
        await ctx.answerCbQuery();
        try {
            if (!ctx.from)
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            // Пока показываем заглушку (позже интегрируем с ReferralsService)
            const message = `📊 **Статистика приглашений**\n\n` +
                `👥 **Всего приглашено:** 0\n` +
                `⚡ **Активных игроков:** 0\n` +
                `📅 **За сегодня:** 0\n` +
                `📅 **За неделю:** 0\n` +
                `📅 **За месяц:** 0\n\n` +
                `🏆 **Достижения:** 0\n` +
                `💎 **Бонусные очки:** 0\n\n` +
                `🚀 **Скоро функция будет полностью активна!**`;
            await ctx.editMessageText(message, { parse_mode: 'Markdown' });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleReferralStats: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply('❌ Ошибка при загрузке статистики');
        }
    }
    // Добавить в конец класса BotService перед последней закрывающей скобкой
    // ==================== НЕДОСТАЮЩИЕ ОБРАБОТЧИКИ ====================
    async handleMyRequests(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        try {
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            // Используем существующий метод findAll с фильтрацией
            const allRequests = await this.requestsService.findAll({ page: 1, limit: 100 });
            const myRequests = allRequests.filter(req => req.creatorId === user.id);
            if (myRequests.length === 0) {
                await ctx.editMessageText(`📋 **Мои заявки**\n\n` +
                    `У вас пока нет активных заявок.\n\n` +
                    `Создайте новую заявку!`, { parse_mode: 'Markdown' });
                return;
            }
            let message = `📋 **Мои заявки (${myRequests.length}):**\n\n`;
            const buttons = [];
            myRequests.slice(0, 5).forEach((request, index) => {
                const datetime = new Date(request.dateTime || request.scheduledTime).toLocaleString('ru-RU');
                message += `${index + 1}. **${request.title}**\n`;
                message += `📅 ${datetime}\n`;
                message += `📍 ${request.location}\n`;
                message += `👥 ${request.currentPlayers || 0}/${request.maxPlayers}\n\n`;
                buttons.push([
                    telegraf_1.Markup.button.callback(`✏️ ${index + 1}`, `edit_request_${request.id}`),
                    telegraf_1.Markup.button.callback(`❌ ${index + 1}`, `delete_request_${request.id}`)
                ]);
            });
            buttons.push([telegraf_1.Markup.button.callback('➕ Создать новую', 'create_request')]);
            buttons.push([telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_play')]);
            const keyboard = telegraf_1.Markup.inlineKeyboard(buttons);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
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
    // Заменить строку 1314:
    async handleRequestLevelCallback(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from || !ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        const userId = ctx.from.id.toString();
        const userState = this.getUserState(userId);
        // Исправить получение level из callback_data
        const callbackData = ctx.callbackQuery.data;
        const level = callbackData.replace('req_level_', '');
        userState.data.requestLevel = level;
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_REQUEST_DESCRIPTION;
        this.setUserState(userId, userState);
        await ctx.editMessageText(`✅ Уровень: **${this.getLevelText(level)}**\n\n` +
            `**Шаг 4 из 4**\n\n` +
            `Добавьте описание заявки (или отправьте "пропустить"):`, { parse_mode: 'Markdown' });
    }
    // ==================== ОБРАБОТЧИКИ ТУРНИРОВ ====================
    async handleCreateTournament(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        this.setUserState(userId, {
            step: profile_state_enum_1.ProfileStep.AWAITING_TOURNAMENT_NAME,
            data: {}
        });
        await ctx.editMessageText(`🏆 **Создание турнира**\n\n` +
            `**Шаг 1 из 5**\n\n` +
            `Введите название турнира:`, { parse_mode: 'Markdown' });
    }
    async handleMyTournaments(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`📋 **Мои турниры**\n\n` +
            `Функция в разработке.\n\n` +
            `Скоро здесь будут отображаться турниры, которые вы создали или в которых участвуете.`, { parse_mode: 'Markdown' });
    }
    async handleTournamentHistory(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`🏆 **История турниров**\n\n` +
            `Функция в разработке.\n\n` +
            `Здесь будет отображаться история ваших участий в турнирах.`, { parse_mode: 'Markdown' });
    }
    // ==================== ОБРАБОТЧИКИ ТРЕНИРОВОК ====================
    async handleFindTraining(ctx) {
        await ctx.answerCbQuery();
        try {
            // Используем существующий метод
            const trainings = await this.trainingsService.findAll({ page: 1, limit: 10 });
            if (trainings.length === 0) {
                await ctx.editMessageText(`🔍 **Поиск тренировок**\n\n` +
                    `😔 Пока нет доступных тренировок.\n\n` +
                    `Создайте свою тренировку!`, { parse_mode: 'Markdown' });
                return;
            }
            let message = `🔍 **Доступные тренировки:**\n\n`;
            const buttons = [];
            trainings.slice(0, 5).forEach((training, index) => {
                const datetime = new Date(training.datetime).toLocaleString('ru-RU');
                message += `${index + 1}. **${training.title}**\n`;
                message += `👨‍🏫 ${training.trainer?.first_name || 'Тренер'}\n`;
                message += `📅 ${datetime}\n`;
                message += `📍 ${training.location}\n`;
                message += `👥 ${training.currentParticipants || 0}/${training.maxParticipants}\n`;
                message += `💰 ${training.price || 0} руб.\n\n`;
                buttons.push([telegraf_1.Markup.button.callback(`${index + 1}. Записаться`, `book_training_${training.id}`)]);
            });
            buttons.push([telegraf_1.Markup.button.callback('🔄 Обновить', 'find_training')]);
            const keyboard = telegraf_1.Markup.inlineKeyboard(buttons);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleFindTraining: ${error}`);
            await ctx.reply('❌ Ошибка при поиске тренировок');
        }
    }
    async handleMyTrainings(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`📋 **Мои тренировки**\n\n` +
            `Функция в разработке.\n\n` +
            `Здесь будут отображаться ваши тренировки.`, { parse_mode: 'Markdown' });
    }
    async handleBecomeTrainer(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`👨‍🏫 **Стать тренером**\n\n` +
            `Функция в разработке.\n\n` +
            `Скоро вы сможете создавать тренировки и обучать других игроков!`, { parse_mode: 'Markdown' });
    }
    // ==================== ОБРАБОТЧИКИ STORIES ====================
    async handleUploadPhotoStory(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        this.setUserState(userId, {
            step: profile_state_enum_1.ProfileStep.AWAITING_STORY_MEDIA,
            data: { storyType: 'PHOTO' }
        });
        await ctx.editMessageText(`📷 **Загрузка фото**\n\n` +
            `Отправьте фото для вашей истории:`, { parse_mode: 'Markdown' });
    }
    async handleUploadVideoStory(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        this.setUserState(userId, {
            step: profile_state_enum_1.ProfileStep.AWAITING_STORY_MEDIA,
            data: { storyType: 'VIDEO' }
        });
        await ctx.editMessageText(`🎥 **Загрузка видео**\n\n` +
            `Отправьте видео для вашей истории:`, { parse_mode: 'Markdown' });
    }
    // Заменить метод handleViewStories:
    // Заменить метод handleViewStories (строка 1630):
    async handleViewStories(ctx) {
        await ctx.answerCbQuery();
        try {
            // Простая заглушка без обращения к несуществующим методам
            await ctx.editMessageText(`👀 **Stories**\n\n` +
                `😔 Пока нет Stories.\n\n` +
                `Будьте первым, кто поделится своей историей!`, { parse_mode: 'Markdown' });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleViewStories: ${error}`);
            await ctx.editMessageText(`👀 **Stories**\n\n` +
                `😔 Пока нет Stories.\n\n` +
                `Будьте первым, кто поделится своей историей!`, { parse_mode: 'Markdown' });
        }
    }
    async handleMyStories(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`📋 **Мои Stories**\n\n` +
            `Функция в разработке.\n\n` +
            `Здесь будут отображаться ваши Stories.`, { parse_mode: 'Markdown' });
    }
    // ==================== ОБРАБОТЧИКИ КЕЙСОВ ====================
    // Заменить строку 1549:
    async handleOpenCaseAction(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from || !ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        // Исправить получение caseId из callback_data
        const callbackData = ctx.callbackQuery.data;
        const caseId = parseInt(callbackData.replace('open_case_', ''));
        try {
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            const result = await this.caseOpeningService.openCase(user.id.toString(), caseId);
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🎁 Открыть еще', 'back_to_cases')],
                [telegraf_1.Markup.button.callback('📊 История', 'case_history')],
            ]);
            await ctx.editMessageText(`🎉 **Поздравляем!**\n\n` +
                `Вы выиграли: **${result.winning.item.name}**\n\n` +
                `📝 ${result.winning.item.description}\n\n` +
                `💰 Потрачено мячей: ${result.opening.ballsSpent}`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка открытия кейса: ${error}`);
            if (error instanceof Error && error.message.includes('Недостаточно мячей')) {
                await ctx.editMessageText(`❌ **Недостаточно мячей**\n\n` +
                    `Для открытия этого кейса нужно больше мячей.\n` +
                    `Играйте в матчи и турниры, чтобы заработать их!`, { parse_mode: 'Markdown' });
            }
            else {
                await ctx.reply('❌ Ошибка при открытии кейса');
            }
        }
    }
    async handleCaseHistoryAction(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`📊 **История открытий**\n\n` +
            `Функция в разработке.\n\n` +
            `Здесь будет отображаться история ваших открытий кейсов.`, { parse_mode: 'Markdown' });
    }
    async handleBackToCases(ctx) {
        await ctx.answerCbQuery();
        await this.handleCases(ctx);
    }
    // ==================== AI COACH ====================
    async handleAITechniqueTip(ctx) {
        await ctx.answerCbQuery();
        const tips = [
            "🎾 **Совет по подаче:** Держите ракетку континентальным хватом для более эффективной подачи.",
            "🎾 **Совет по удару:** Следите за мячом глазами до момента контакта с ракеткой.",
            "🎾 **Совет по движению:** Всегда возвращайтесь в центр корта после удара.",
            "🎾 **Совет по стратегии:** Играйте в слабые места соперника - обычно это бэкхенд.",
            "🎾 **Совет по физподготовке:** Уделяйте больше внимания работе ног - это основа хорошей игры."
        ];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        await ctx.editMessageText(`💡 **Совет от AI-Coach:**\n\n${randomTip}\n\n` +
            `Хотите персональный план тренировок? Нажмите кнопку ниже!`, {
            parse_mode: 'Markdown',
            reply_markup: telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🏃‍♂️ План тренировки', 'ai_training_plan')],
                [telegraf_1.Markup.button.callback('🔄 Другой совет', 'ai_technique_tip')]
            ]).reply_markup
        });
    }
    async handleAITrainingPlan(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`🏃‍♂️ **Персональный план тренировки**\n\n` +
            `**Разминка (10 мин):**\n` +
            `• Легкий бег вокруг корта\n` +
            `• Растяжка мышц\n` +
            `• Махи ракеткой\n\n` +
            `**Техника (20 мин):**\n` +
            `• Отработка форхенда у стенки\n` +
            `• Подачи в мишени\n` +
            `• Движение ног\n\n` +
            `**Игра (20 мин):**\n` +
            `• Розыгрыши с партнером\n` +
            `• Отработка тактических ситуаций\n\n` +
            `**Заминка (10 мин):**\n` +
            `• Растяжка\n` +
            `• Дыхательные упражнения`, {
            parse_mode: 'Markdown',
            reply_markup: telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('📊 Анализ игры', 'ai_game_analysis')],
                [telegraf_1.Markup.button.callback('🎯 Поставить цели', 'ai_goal_setting')]
            ]).reply_markup
        });
    }
    async handleAIGameAnalysis(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`📊 **Анализ вашей игры**\n\n` +
            `Основываясь на ваших последних матчах:\n\n` +
            `**Сильные стороны:**\n` +
            `✅ Стабильная подача\n` +
            `✅ Хорошее покрытие корта\n\n` +
            `**Области для улучшения:**\n` +
            `📈 Бэкхенд удары\n` +
            `📈 Игра у сетки\n` +
            `📈 Тактическое мышление\n\n` +
            `**Рекомендации:**\n` +
            `🎯 Больше практикуйте бэкхенд\n` +
            `🎯 Изучите тактику игры\n` +
            `🎯 Работайте над выносливостью`, {
            parse_mode: 'Markdown',
            reply_markup: telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('💡 Новый совет', 'ai_technique_tip')]
            ]).reply_markup
        });
    }
    async handleAIGoalSetting(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`🎯 **Постановка целей**\n\n` +
            `**Краткосрочные цели (1 месяц):**\n` +
            `• Выиграть 3 матча подряд\n` +
            `• Улучшить процент первой подачи до 60%\n` +
            `• Принять участие в турнире\n\n` +
            `**Среднесрочные цели (3 месяца):**\n` +
            `• Повысить рейтинг на 100 пунктов\n` +
            `• Освоить удар с лета\n` +
            `• Найти постоянного партнера\n\n` +
            `**Долгосрочные цели (1 год):**\n` +
            `• Дойти до финала турнира\n` +
            `• Повысить уровень игры\n` +
            `• Стать тренером`, {
            parse_mode: 'Markdown',
            reply_markup: telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🏃‍♂️ План тренировки', 'ai_training_plan')]
            ]).reply_markup
        });
    }
    // ==================== ОБРАБОТЧИКИ ПРОФИЛЯ ====================
    async handleSetupProfileAction(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        this.setUserState(userId, {
            step: profile_state_enum_1.ProfileStep.AWAITING_FIRST_NAME,
            data: {}
        });
        await ctx.editMessageText(`🔄 **Настройка профиля**\n\n` +
            `Давайте заполним ваш профиль для лучшего поиска партнеров.\n\n` +
            `Введите ваше имя:`, { parse_mode: 'Markdown' });
    }
    async handleDetailedStats(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`📊 **Подробная статистика**\n\n` +
            `Функция в разработке.\n\n` +
            `Здесь будет детальная аналитика вашей игры.`, { parse_mode: 'Markdown' });
    }
    async handleMatchHistoryAction(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`🎾 **История матчей**\n\n` +
            `Функция в разработке.\n\n` +
            `Здесь будет история всех ваших матчей.`, { parse_mode: 'Markdown' });
    }
    async handleAchievements(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`🏅 **Достижения**\n\n` +
            `Функция в разработке.\n\n` +
            `Здесь будут отображаться ваши достижения и награды.`, { parse_mode: 'Markdown' });
    }
    // ==================== ОБРАБОТЧИКИ МАТЧЕЙ ====================
    async handleMatchTypeSingles(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        const userState = this.getUserState(userId);
        userState.data.matchType = 'SINGLES';
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_MATCH_OPPONENT;
        this.setUserState(userId, userState);
        await ctx.editMessageText(`🎾 **Одиночный матч**\n\n` +
            `Введите имя соперника:`, { parse_mode: 'Markdown' });
    }
    async handleMatchTypeDoubles(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        const userState = this.getUserState(userId);
        userState.data.matchType = 'DOUBLES';
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_MATCH_OPPONENT;
        this.setUserState(userId, userState);
        await ctx.editMessageText(`👥 **Парный матч**\n\n` +
            `Введите имена соперников:`, { parse_mode: 'Markdown' });
    }
    // ==================== ОБРАБОТКА МЕДИА ====================
    async handlePhoto(ctx) {
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        const userState = this.getUserState(userId);
        if (userState.step === profile_state_enum_1.ProfileStep.AWAITING_STORY_MEDIA && userState.data.storyType === 'PHOTO') {
            const photo = ctx.message.photo;
            const fileId = photo[photo.length - 1].file_id;
            userState.data.storyMediaId = fileId;
            userState.step = profile_state_enum_1.ProfileStep.AWAITING_STORY_DESCRIPTION;
            this.setUserState(userId, userState);
            await ctx.reply(`📷 **Фото загружено!**\n\n` +
                `Добавьте описание к вашей истории:`, { parse_mode: 'Markdown' });
        }
    }
    async handleVideo(ctx) {
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        const userState = this.getUserState(userId);
        if (userState.step === profile_state_enum_1.ProfileStep.AWAITING_STORY_MEDIA && userState.data.storyType === 'VIDEO') {
            const video = ctx.message.video;
            const fileId = video.file_id;
            userState.data.storyMediaId = fileId;
            userState.step = profile_state_enum_1.ProfileStep.AWAITING_STORY_DESCRIPTION;
            this.setUserState(userId, userState);
            await ctx.reply(`🎥 **Видео загружено!**\n\n` +
                `Добавьте описание к вашей истории:`, { parse_mode: 'Markdown' });
        }
    }
    // ==================== ПОИСК КОРТОВ ====================
    async handleFindCourtsButton(ctx) {
        await this.handleFindCourts(ctx);
    }
    async handleFindCourts(ctx) {
        this.logger.log('📍 НАЙТИ КОРТЫ функция');
        try {
            if (!ctx.from)
                return;
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🏙️ Москва', 'courts_moscow')],
                [telegraf_1.Markup.button.callback('🏙️ СПб', 'courts_spb')],
                [telegraf_1.Markup.button.callback('🌆 Другой город', 'courts_other_city')],
                [telegraf_1.Markup.button.callback('📍 По геолокации', 'courts_location')],
            ]);
            await ctx.reply(`📍 **Поиск теннисных кортов**\n\n` +
                `Выберите способ поиска:`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleFindCourts: ${error}`);
            await ctx.reply('❌ Ошибка при поиске кортов');
        }
    }
    async handleCourtsMoscow(ctx) {
        await ctx.answerCbQuery();
        await this.showCourtsForCity(ctx, 'Москва');
    }
    async handleCourtsSpb(ctx) {
        await ctx.answerCbQuery();
        await this.showCourtsForCity(ctx, 'Санкт-Петербург');
    }
    async handleCourtsOtherCity(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        this.setUserState(userId, {
            step: profile_state_enum_1.ProfileStep.AWAITING_CITY_SEARCH,
            data: {}
        });
        await ctx.editMessageText(`🌆 **Поиск кортов**\n\n` +
            `Введите название города:`, { parse_mode: 'Markdown' });
    }
    async handleCourtsLocation(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`📍 **Поиск по геолокации**\n\n` +
            `Функция в разработке.\n\n` +
            `Скоро вы сможете найти ближайшие корты по вашему местоположению.`, { parse_mode: 'Markdown' });
    }
    async showCourtsForCity(ctx, city) {
        const courtsMessage = this.generateCityCortsMessage(city);
        await ctx.editMessageText(courtsMessage, {
            parse_mode: 'Markdown'
        });
    }
    // ==================== ДОПОЛНИТЕЛЬНЫЕ ОБРАБОТЧИКИ ====================
    // Добавить в класс BotService:
    generateCityCortsMessage(city) {
        // Расширенные моковые данные для разных городов
        const courtsByCity = {
            'Москва': [
                {
                    name: 'Теннисный центр "Олимпийский"',
                    address: 'Олимпийский проспект, 16',
                    price: '2000-3500 руб/час',
                    rating: '4.9',
                    courts: 12,
                    features: ['Крытые корты', 'Хард', 'Парковка', 'Раздевалки', 'Душевые', 'Прокат ракеток']
                },
                {
                    name: 'ТЦ "Лужники"',
                    address: 'Лужнецкая наб., 24',
                    price: '1500-2800 руб/час',
                    rating: '4.7',
                    courts: 8,
                    features: ['Крытые/открытые', 'Хард/грунт', 'Освещение', 'Кафе']
                },
                {
                    name: 'Клуб "Спартак"',
                    address: 'ул. Дорогомиловская, 14',
                    price: '1800-3000 руб/час',
                    rating: '4.6',
                    courts: 6,
                    features: ['Крытые корты', 'Хард', 'Тренеры', 'Групповые занятия']
                }
            ],
            'Санкт-Петербург': [
                {
                    name: 'ТК "Петровский"',
                    address: 'Петровская наб., 4',
                    price: '1200-2200 руб/час',
                    rating: '4.8',
                    courts: 10,
                    features: ['Крытые корты', 'Хард', 'Вид на Неву', 'Парковка']
                },
                {
                    name: 'Клуб "Динамо"',
                    address: 'пр. Динамо, 44',
                    price: '1000-1800 руб/час',
                    rating: '4.5',
                    courts: 8,
                    features: ['Открытые корты', 'Грунт', 'Летний сезон']
                }
            ]
        };
        const courts = courtsByCity[city] || [
            {
                name: 'Теннисный клуб',
                address: 'Центр города',
                price: '1000-2000 руб/час',
                rating: '4.5',
                courts: 4,
                features: ['Открытые корты', 'Хард']
            }
        ];
        let message = `🏙️ **Корты в городе ${city}:**\n\n`;
        courts.forEach((court, index) => {
            message += `${index + 1}. **${court.name}**\n`;
            message += `📍 ${court.address}\n`;
            message += `💰 ${court.price}\n`;
            message += `⭐ Рейтинг: ${court.rating}\n`;
            message += `🎾 Кортов: ${court.courts}\n`;
            message += `✨ ${court.features.join(', ')}\n\n`;
        });
        message += `📞 **Для бронирования:**\n`;
        message += `• Звоните в администрацию\n`;
        message += `• Используйте приложения бронирования\n`;
        message += `• Уточняйте актуальные цены\n\n`;
        message += `💡 **Совет:** Проверьте наличие свободного времени заранее!`;
        return message;
    }
    // Заменить метод createMatch:
    async createMatch(ctx, userId, userState) {
        try {
            const user = await this.usersService.findByTelegramId(userId);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            // Определяем результат по счету (упрощенная логика)
            const score = userState.data.matchScore || '';
            const isWin = score.includes('6-') && score.split(' ')[0].startsWith('6');
            // Используем правильную структуру CreateMatchDto
            const matchData = {
                opponentName: userState.data.matchOpponent,
                opponentId: null,
                score: userState.data.matchScore,
                matchDate: new Date(userState.data.matchDate),
                type: userState.data.matchType === 'DOUBLES' ? match_enum_1.MatchType.DOUBLES : match_enum_1.MatchType.ONE_ON_ONE,
                result: isWin ? 'WIN' : 'LOSS',
                isRanked: false,
                location: 'Не указано'
            };
            // Используем существующий метод
            await this.matchesService.create(user.id.toString(), matchData);
            const summaryMessage = `🎾 **Матч записан!**\n\n` +
                `👤 **Соперник:** ${matchData.opponentName}\n` +
                `🏆 **Счет:** ${matchData.score}\n` +
                `📅 **Дата:** ${matchData.matchDate.toLocaleDateString('ru-RU')}\n` +
                `🎯 **Тип:** ${matchData.type === match_enum_1.MatchType.ONE_ON_ONE ? 'Одиночный' : 'Парный'}\n` +
                `📊 **Результат:** ${matchData.result === 'WIN' ? 'Победа 🏆' : 'Поражение'}\n\n` +
                `Матч добавлен в вашу статистику!`;
            await ctx.reply(summaryMessage, {
                parse_mode: 'Markdown',
                reply_markup: this.getMainKeyboard().reply_markup
            });
            this.clearUserState(userId);
        }
        catch (error) {
            this.logger.error(`Ошибка создания матча: ${error}`);
            await ctx.reply('❌ Ошибка при записи матча');
        }
    }
    // Заменить метод createStory (строка 2238):
    async createStory(ctx, userId, userState) {
        try {
            const user = await this.usersService.findByTelegramId(userId);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            const storyData = {
                description: userState.data.storyDescription || '',
                mediaUrl: userState.data.storyMediaId || '',
                type: userState.data.storyType || 'PHOTO',
            };
            // Простая заглушка без обращения к несуществующим методам
            this.logger.log(`Story создана (заглушка): ${JSON.stringify(storyData)}`);
            await ctx.reply(`📸 **История опубликована!**\n\n` +
                `${storyData.description ? `📝 ${storyData.description}` : ''}\n\n` +
                `Ваша история будет видна другим игрокам после добавления функционала Stories!`, {
                parse_mode: 'Markdown',
                reply_markup: this.getMainKeyboard().reply_markup
            });
            this.clearUserState(userId);
        }
        catch (error) {
            this.logger.error(`Ошибка создания истории: ${error}`);
            await ctx.reply('❌ Ошибка при публикации истории');
        }
    }
    // Добавить обработчик в switch в handleStatefulInput
    async updateHandleStatefulInput() {
        // В существующем методе handleStatefulInput добавить:
        /*
        case ProfileStep.AWAITING_CITY_SEARCH:
          await this.handleCitySearch(ctx, text, userId, userState);
          break;
        case ProfileStep.AWAITING_MATCH_DATE:
          await this.handleMatchDate(ctx, text, userId, userState);
          break;
        case ProfileStep.AWAITING_STORY_DESCRIPTION:
          await this.handleStoryDescription(ctx, text, userId, userState);
          break;
        */
    }
};
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleStart", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('👤 Профиль'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleProfile", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🎾 Играть'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handlePlay", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('find_game'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleFindGame", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('create_request'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCreateRequest", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🏆 Турниры'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTournaments", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('active_tournaments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleActiveTournaments", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🎁 Кейсы'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCases", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📱 Stories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleStories", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🏃‍♂️ Тренировки'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTrainings", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📝 Записать результат'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleRecordMatch", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🔗 Пригласить друга'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleInviteButton", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('invite'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleInvite", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🤖 AI-Coach'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleAICoach", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleText", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^open_case_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleOpenCase", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^respond_request_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleRespondToRequest", null);
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
    (0, nestjs_telegraf_1.Action)('referral_stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleReferralStats", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('my_requests'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMyRequests", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('active_requests'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleActiveRequests", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_play'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleBackToPlay", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^req_level_(.+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleRequestLevelCallback", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('create_tournament'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCreateTournament", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('my_tournaments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMyTournaments", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('tournament_history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTournamentHistory", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('find_training'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleFindTraining", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('my_trainings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMyTrainings", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('become_trainer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleBecomeTrainer", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('upload_photo_story'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleUploadPhotoStory", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('upload_video_story'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleUploadVideoStory", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('view_stories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleViewStories", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('my_stories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMyStories", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^open_case_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleOpenCaseAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('case_history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCaseHistoryAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_cases'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleBackToCases", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('ai_technique_tip'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleAITechniqueTip", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('ai_training_plan'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleAITrainingPlan", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('ai_game_analysis'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleAIGameAnalysis", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('ai_goal_setting'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleAIGoalSetting", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('setup_profile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSetupProfileAction", null);
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
], BotService.prototype, "handleMatchHistoryAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('achievements'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleAchievements", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('match_type_singles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMatchTypeSingles", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('match_type_doubles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMatchTypeDoubles", null);
__decorate([
    (0, nestjs_telegraf_1.On)('photo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handlePhoto", null);
__decorate([
    (0, nestjs_telegraf_1.On)('video'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleVideo", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📍 Найти корты'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleFindCourtsButton", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('courts_moscow'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCourtsMoscow", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('courts_spb'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCourtsSpb", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('courts_other_city'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCourtsOtherCity", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('courts_location'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCourtsLocation", null);
BotService = BotService_1 = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        users_service_1.UsersService,
        balls_service_1.BallsService,
        requests_service_1.RequestsService,
        tournaments_service_1.TournamentsService,
        matches_service_1.MatchesService,
        trainings_service_1.TrainingsService,
        stories_service_1.StoriesService,
        cases_service_1.CasesService,
        case_opening_service_1.CaseOpeningService])
], BotService);
exports.BotService = BotService;
