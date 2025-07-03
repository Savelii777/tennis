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
const telegraf_1 = require("telegraf");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const profile_handler_1 = require("./handlers/profile.handler");
const matches_handler_1 = require("./handlers/matches.handler");
const requests_handler_1 = require("./handlers/requests.handler");
const tournaments_handler_1 = require("./handlers/tournaments.handler");
const trainings_handler_1 = require("./handlers/trainings.handler");
const stories_handler_1 = require("./handlers/stories.handler");
const cases_handler_1 = require("./handlers/cases.handler");
const ai_coach_handler_1 = require("./handlers/ai-coach.handler");
const common_handler_1 = require("./handlers/common.handler");
const messaging_handler_1 = require("./handlers/messaging.handler");
const state_service_1 = require("./services/state.service");
let BotService = BotService_1 = class BotService {
    constructor(bot, profileHandler, matchesHandler, requestsHandler, tournamentsHandler, trainingHandler, storiesHandler, casesHandler, aiCoachHandler, commonHandler, messagingHandler, stateService) {
        this.bot = bot;
        this.profileHandler = profileHandler;
        this.matchesHandler = matchesHandler;
        this.requestsHandler = requestsHandler;
        this.tournamentsHandler = tournamentsHandler;
        this.trainingHandler = trainingHandler;
        this.storiesHandler = storiesHandler;
        this.casesHandler = casesHandler;
        this.aiCoachHandler = aiCoachHandler;
        this.commonHandler = commonHandler;
        this.messagingHandler = messagingHandler;
        this.stateService = stateService;
        this.logger = new common_1.Logger(BotService_1.name);
    }
    async onModuleInit() {
        this.logger.debug('🔧 BotService.onModuleInit() запущен');
        this.logger.log('Инициализация Telegram бота...');
        try {
            // Проверяем информацию о боте
            this.logger.debug('🔍 Получение информации о боте...');
            const botInfo = await this.bot.telegram.getMe();
            this.logger.log(`🤖 Бот подключен: @${botInfo.username} (${botInfo.first_name})`);
            this.logger.debug(`📊 Полная информация о боте: ${JSON.stringify(botInfo)}`);
            // Удаляем webhook если он есть, чтобы включить polling
            this.logger.debug('🔄 Удаление webhook...');
            await this.bot.telegram.deleteWebhook();
            this.logger.log('🔄 Webhook удален для активации polling');
            // НЕ РЕГИСТРИРУЕМ ОБРАБОТЧИКИ ВРУЧНУЮ! Используем только декораторы
            this.logger.debug('🔧 Обработчики будут управляться через декораторы nestjs-telegraf');
            // Добавляем обработчик ошибок
            this.logger.debug('🔧 Установка обработчика ошибок...');
            this.bot.catch((err, ctx) => {
                this.logger.error('❌ Ошибка в боте:', err);
                this.logger.error('📊 Контекст ошибки:', JSON.stringify(ctx.update));
                console.error('Полная ошибка:', err);
                console.error('Полный контекст:', ctx);
            });
            this.logger.log('Бот успешно инициализирован');
            this.logger.debug('✅ BotService.onModuleInit() завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при инициализации бота:', error);
            this.logger.error('📊 Детали ошибки:', JSON.stringify(error));
        }
    }
    // Общий обработчик для всех обновлений - ОТКЛЮЧЕН для тестирования декораторов
    // @On('message')
    async onMessage_DISABLED(ctx) {
        this.logger.debug('🔍 DECORATOR @On("message") вызван');
        this.logger.log(`📨 Получено сообщение: ${JSON.stringify(ctx.message)}`);
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username}, ID: ${ctx.from?.id})`);
        this.logger.debug(`💬 В чате: ${ctx.chat?.id} (тип: ${ctx.chat?.type})`);
        // Добавляем проверку на текстовое сообщение
        if (ctx.message && 'text' in ctx.message) {
            const text = ctx.message.text;
            this.logger.log(`📝 Текст сообщения: "${text}"`);
            this.logger.debug(`📝 Длина текста: ${text.length} символов`);
            // Проверяем, не является ли это командой
            if (text.startsWith('/')) {
                this.logger.log(`🔧 Обнаружена команда: ${text}`);
                this.logger.debug('🔄 Передача команды специальным декораторам...');
                return; // Команды обрабатываются отдельными декораторами
            }
            // Обрабатываем как текст
            this.logger.debug('📝 Обработка как обычный текст...');
            await this.handleText(ctx);
        }
        else {
            this.logger.debug('📨 Сообщение не содержит текста');
            if (ctx.message && 'photo' in ctx.message) {
                this.logger.debug('📷 Получено фото');
            }
            if (ctx.message && 'document' in ctx.message) {
                this.logger.debug('📄 Получен документ');
            }
            if (ctx.message && 'voice' in ctx.message) {
                this.logger.debug('🎤 Получено голосовое сообщение');
            }
        }
        this.logger.debug('✅ onMessage завершен');
    }
    // Обработка callback_query через Action декораторы
    // @On('callback_query') - ОТКЛЮЧЕН, чтобы Action декораторы могли работать
    async onCallbackQuery_DISABLED(ctx) {
        this.logger.debug('� DECORATOR @On("callback_query") вызван - ОТКЛЮЧЕН');
        // Этот обработчик отключен, чтобы @Action декораторы могли работать
    }
    // Основные точки входа
    async handleStart(ctx) {
        this.logger.debug('🔍 DECORATOR @Start() вызван');
        this.logger.log('📨 Получена команда /start');
        this.logger.log(`👤 Пользователь: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        this.logger.log(`💬 Chat ID: ${ctx.chat?.id}`);
        this.logger.debug(`📊 Полная информация о пользователе: ${JSON.stringify(ctx.from)}`);
        this.logger.debug(`📊 Полная информация о чате: ${JSON.stringify(ctx.chat)}`);
        try {
            this.logger.debug('🔄 Вызов commonHandler.handleStart...');
            await this.commonHandler.handleStart(ctx);
            this.logger.log('✅ Команда /start обработана успешно');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке /start:', error);
            this.logger.error('📊 Детали ошибки:', JSON.stringify(error));
            await ctx.reply('❌ Произошла ошибка при обработке команды');
        }
    }
    async handleHelp(ctx) {
        this.logger.debug('🔍 DECORATOR @Command("help") вызван');
        this.logger.log('📨 Получена команда /help');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            await ctx.reply('📖 Справка по командам:\n\n/start - Начать работу с ботом\n/help - Показать эту справку\n/profile - Мой профиль');
            this.logger.log('✅ Команда /help обработана успешно');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке /help:', error);
        }
    }
    async handleProfile(ctx) {
        this.logger.debug('🔍 DECORATOR @Hears("👤 Профиль") вызван');
        this.logger.log('📨 Нажата кнопка: Профиль');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            const result = await this.profileHandler.handleProfile(ctx);
            this.logger.debug('✅ handleProfile завершен успешно');
            return result;
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке кнопки Профиль:', error);
            throw error;
        }
    }
    async handlePlay(ctx) {
        this.logger.debug('🔍 DECORATOR @Hears("🎾 Играть") вызван');
        this.logger.log('📨 Нажата кнопка: Играть');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            const result = await this.requestsHandler.handlePlay(ctx);
            this.logger.debug('✅ handlePlay завершен успешно');
            return result;
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке кнопки Играть:', error);
            throw error;
        }
    }
    async handleTournaments(ctx) {
        this.logger.debug('🔍 DECORATOR @Hears("🏆 Турниры") вызван');
        this.logger.log('📨 Нажата кнопка: Турниры');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            const result = await this.tournamentsHandler.handleTournaments(ctx);
            this.logger.debug('✅ handleTournaments завершен успешно');
            return result;
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке кнопки Турниры:', error);
            throw error;
        }
    }
    async handleTrainings(ctx) {
        this.logger.debug('🔍 DECORATOR @Hears("🏃‍♂️ Тренировки") вызван');
        this.logger.log('📨 Нажата кнопка: Тренировки');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            const result = await this.trainingHandler.handleTrainings(ctx);
            this.logger.debug('✅ handleTrainings завершен успешно');
            return result;
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке кнопки Тренировки:', error);
            throw error;
        }
    }
    // Дополнительные обработчики кнопок меню
    async handleStories(ctx) {
        this.logger.debug('🔍 DECORATOR @Hears("📱 Stories") вызван');
        this.logger.log('📱 Нажата кнопка: Stories');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            await this.storiesHandler.handleStories(ctx);
            this.logger.debug('✅ handleStories завершен успешно');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке Stories:', error);
            throw error;
        }
    }
    async handleCases(ctx) {
        this.logger.debug('🔍 DECORATOR @Hears("🎁 Кейсы") вызван');
        this.logger.log('🎁 Нажата кнопка: Кейсы');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            await this.casesHandler.handleCases(ctx);
            this.logger.debug('✅ handleCases завершен успешно');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке Кейсов:', error);
            throw error;
        }
    }
    async handleRecordResult(ctx) {
        this.logger.debug('🔍 DECORATOR @Hears("📝 Записать результат") вызван');
        this.logger.log('📝 Нажата кнопка: Записать результат');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            await this.matchesHandler.handleRecordMatch(ctx);
            this.logger.debug('✅ handleRecordMatch завершен успешно');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при записи результата:', error);
            throw error;
        }
    }
    async handleInviteFriend(ctx) {
        this.logger.debug('🔍 DECORATOR @Hears("🔗 Пригласить друга") вызван');
        this.logger.log('🔗 Нажата кнопка: Пригласить друга');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            await this.commonHandler.handleInviteButton(ctx);
            this.logger.debug('✅ handleInviteButton завершен успешно');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при приглашении друга:', error);
            throw error;
        }
    }
    async handleAiCoach(ctx) {
        this.logger.debug('🔍 DECORATOR @Hears("🤖 AI-Coach") вызван');
        this.logger.log('🤖 Нажата кнопка: AI-Coach');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            await this.aiCoachHandler.handleAICoach(ctx);
            this.logger.debug('✅ handleAICoach завершен успешно');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке AI-Coach:', error);
            throw error;
        }
    }
    async handleCourts(ctx) {
        this.logger.debug('🔍 DECORATOR @Hears("📍 Корты") вызван');
        this.logger.log('📍 Нажата кнопка: Корты');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            await ctx.reply('📍 Раздел "Корты" пока в разработке...');
            this.logger.debug('✅ handleCourts завершен успешно');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке Кортов:', error);
            throw error;
        }
    }
    async handleSettings(ctx) {
        this.logger.debug('🔍 DECORATOR @Hears("⚙️ Настройки") вызван');
        this.logger.log('⚙️ Нажата кнопка: Настройки');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            await ctx.reply('⚙️ Раздел "Настройки" пока в разработке...');
            this.logger.debug('✅ handleSettings завершен успешно');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке Настроек:', error);
            throw error;
        }
    }
    // Обработка текстовых сообщений
    async handleText(ctx) {
        this.logger.debug('🔍 DECORATOR @On("text") вызван');
        if (!ctx.from || !ctx.message || !('text' in ctx.message)) {
            this.logger.debug('❌ Невалидные данные для обработки текста');
            return;
        }
        const userId = ctx.from.id.toString();
        const text = ctx.message.text;
        this.logger.debug(`👤 Пользователь ID: ${userId}`);
        this.logger.debug(`📝 Текст для обработки: "${text}"`);
        // Проверка состояния пользователя
        const userState = this.stateService.getUserState(userId);
        this.logger.log(`📝 Получено сообщение: ${text}, состояние: ${userState.step}`);
        this.logger.debug(`🔍 Полное состояние пользователя: ${JSON.stringify(userState)}`);
        // Перенаправляем в соответствующий обработчик в зависимости от состояния
        try {
            this.logger.debug('🔄 Попытка обработки через ProfileHandler...');
            // Профиль
            if (await this.profileHandler.handleProfileInput(ctx, text, userId)) {
                this.logger.debug('✅ Обработано ProfileHandler');
                return;
            }
            this.logger.debug('🔄 Попытка обработки через MatchesHandler...');
            // Матчи
            if (await this.matchesHandler.handleMatchInput(ctx, text, userId)) {
                this.logger.debug('✅ Обработано MatchesHandler');
                return;
            }
            this.logger.debug('🔄 Попытка обработки через RequestsHandler...');
            // Заявки
            if (await this.requestsHandler.handleRequestInput(ctx, text, userId)) {
                this.logger.debug('✅ Обработано RequestsHandler');
                return;
            }
            this.logger.debug('🔄 Попытка обработки через TournamentsHandler...');
            // Турниры
            if (await this.tournamentsHandler.handleTournamentInput(ctx, text, userId)) {
                this.logger.debug('✅ Обработано TournamentsHandler');
                return;
            }
            this.logger.debug('🔄 Попытка обработки через TrainingsHandler...');
            // Тренировки
            if (await this.trainingHandler.handleTrainingInput(ctx, text, userId)) {
                this.logger.debug('✅ Обработано TrainingsHandler');
                return;
            }
            this.logger.debug('🔄 Попытка обработки через StoriesHandler...');
            // Stories
            if (await this.storiesHandler.handleStoryInput(ctx, text, userId)) {
                this.logger.debug('✅ Обработано StoriesHandler');
                return;
            }
            this.logger.debug('🔄 Попытка обработки через AiCoachHandler...');
            // AI Coach
            if (await this.aiCoachHandler.handleAIInput(ctx, text, userId)) {
                this.logger.debug('✅ Обработано AiCoachHandler');
                return;
            }
            this.logger.debug('❓ Текст не обработан ни одним обработчиком');
            // Если сообщение не обработано, показываем подсказку
            await ctx.reply(`🤔 Я не понимаю эту команду.\n\n` +
                `Используйте кнопки меню для навигации:`, {
                reply_markup: {
                    keyboard: [
                        ['👤 Профиль', '🎾 Играть'],
                        ['🏆 Турниры', '🏃‍♂️ Тренировки'],
                        ['📍 Корты', '🤖 AI-Coach'],
                        ['⚙️ Настройки']
                    ],
                    resize_keyboard: true
                }
            });
            this.logger.debug('✅ Отправлено сообщение с подсказкой');
        }
        catch (error) {
            this.logger.error(`❌ Ошибка при обработке текста: ${error}`);
            this.logger.error(`📊 Детали ошибки: ${JSON.stringify(error)}`);
            await ctx.reply('❌ Произошла ошибка при обработке вашего сообщения');
        }
        this.logger.debug('✅ handleText завершен');
    }
    // Обработка фото для Stories
    async handlePhoto(ctx) {
        this.logger.debug('🔍 DECORATOR @On("photo") вызван');
        this.logger.log('📸 Получено фото');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            const result = await this.storiesHandler.handlePhoto(ctx);
            this.logger.debug('✅ handlePhoto завершен успешно');
            return result;
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке фото:', error);
            throw error;
        }
    }
    // Обработка видео для Stories
    async handleVideo(ctx) {
        this.logger.debug('🔍 DECORATOR @On("video") вызван');
        this.logger.log('🎥 Получено видео');
        this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
        try {
            const result = await this.storiesHandler.handleVideo(ctx);
            this.logger.debug('✅ handleVideo завершен успешно');
            return result;
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке видео:', error);
            throw error;
        }
    }
    // Обработка команд для отладки
    async handleDebug(ctx) {
        this.logger.debug('🔍 DECORATOR @Command("debug") вызван');
        this.logger.log('📨 Получена команда /debug');
        if (!ctx.from) {
            this.logger.debug('❌ Нет информации о пользователе');
            return;
        }
        const userId = ctx.from.id.toString();
        const userState = this.stateService.getUserState(userId);
        this.logger.debug(`👤 Запрос отладочной информации от пользователя: ${userId}`);
        await ctx.reply(`🔍 **Отладочная информация**\n\n` +
            `User ID: ${userId}\n` +
            `State: ${userState.step}\n` +
            `Data: ${JSON.stringify(userState.data, null, 2)}`, { parse_mode: 'Markdown' });
        this.logger.debug('✅ Отладочная информация отправлена');
    }
    // Методы для внешнего использования
    async processUpdate(update) {
        this.logger.debug('🔍 processUpdate вызван');
        this.logger.log('📥 Обработка входящего обновления');
        this.logger.debug(`📊 Данные обновления: ${JSON.stringify(update)}`);
        try {
            await this.bot.handleUpdate(update);
            this.logger.debug('✅ processUpdate завершен успешно');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обработке обновления:', error);
            this.logger.error(`📊 Детали ошибки: ${JSON.stringify(error)}`);
            throw error;
        }
    }
    async getBotInfo() {
        return this.bot.telegram.getMe();
    }
    // Action декораторы для callback кнопок
    async handleMainMenuAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("main_menu") вызван');
        this.logger.log('🏠 Возврат в главное меню');
        try {
            await ctx.answerCbQuery();
            await this.commonHandler.handleStart(ctx);
            this.logger.debug('✅ Возврат в главное меню завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при возврате в главное меню:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleMyTournamentsAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("my_tournaments") вызван');
        this.logger.log('📋 Показ моих турниров');
        try {
            await ctx.answerCbQuery();
            await this.tournamentsHandler.handleMyTournaments(ctx);
            this.logger.debug('✅ Показ моих турниров завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при показе моих турниров:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleFindTournamentAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("find_tournament") вызван');
        this.logger.log('🔍 Поиск турниров');
        try {
            await ctx.answerCbQuery();
            await this.tournamentsHandler.handleFindTournament(ctx);
            this.logger.debug('✅ Поиск турниров завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при поиске турниров:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleCreateTournamentAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("create_tournament") вызван');
        this.logger.log('🏆 Создание турнира');
        try {
            await ctx.answerCbQuery();
            await this.tournamentsHandler.handleCreateTournament(ctx);
            this.logger.debug('✅ Создание турнира завершено');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при создании турнира:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Action декораторы для callback кнопок профиля
    async handleDetailedStatsAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("detailed_stats") вызван');
        this.logger.log('📊 Показ подробной статистики');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleDetailedStats(ctx);
            this.logger.debug('✅ Подробная статистика показана');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при показе подробной статистики:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleUserAchievementsAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("user_achievements") вызван');
        this.logger.log('🏆 Показ достижений пользователя');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleUserAchievements(ctx);
            this.logger.debug('✅ Достижения показаны');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при показе достижений:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleSetupProfileAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("setup_profile") вызван');
        this.logger.log('🔄 Обновление профиля');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleSetupProfileAction(ctx);
            this.logger.debug('✅ Обновление профиля завершено');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при обновлении профиля:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleUserGoalsAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("user_goals") вызван');
        this.logger.log('🎯 Показ целей пользователя');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleUserGoals(ctx);
            this.logger.debug('✅ Цели показаны');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при показе целей:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleMatchHistoryAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("match_history") вызван');
        this.logger.log('📜 Показ истории матчей');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleMatchHistory(ctx);
            this.logger.debug('✅ История матчей показана');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при показе истории:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Action декораторы для callback кнопок игры
    async handleFindGameAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("find_game") вызван');
        this.logger.log('🔍 Поиск игры');
        try {
            await ctx.answerCbQuery();
            await this.requestsHandler.handleFindGame(ctx);
            this.logger.debug('✅ Поиск игры завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при поиске игры:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleCreateRequestAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("create_request") вызван');
        this.logger.log('➕ Создание заявки');
        try {
            await ctx.answerCbQuery();
            await this.requestsHandler.handleCreateRequest(ctx);
            this.logger.debug('✅ Создание заявки завершено');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при создании заявки:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Дополнительные Action декораторы для полной поддержки всех кнопок
    async handleBackToProfileAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("back_to_profile") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleBackToProfile(ctx);
            this.logger.debug('✅ Возврат к профилю завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при возврате к профилю:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleBackToTournamentsAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("back_to_tournaments") вызван');
        try {
            await ctx.answerCbQuery();
            await this.tournamentsHandler.handleBackToTournaments(ctx);
            this.logger.debug('✅ Возврат к турнирам завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при возврате к турнирам:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Обработчики для выбора уровня игры
    async handleLevelBeginner(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("req_level_BEGINNER") вызван');
        try {
            await ctx.answerCbQuery();
            // Уровень игры - пока просто показываем сообщение
            await ctx.editMessageText('🟢 Вы выбрали уровень: Начинающий');
            this.logger.debug('✅ Выбор уровня BEGINNER завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelAmateur(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("req_level_AMATEUR") вызван');
        try {
            await ctx.answerCbQuery();
            await ctx.editMessageText('🔵 Вы выбрали уровень: Любитель');
            this.logger.debug('✅ Выбор уровня AMATEUR завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelConfident(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("req_level_CONFIDENT") вызван');
        try {
            await ctx.answerCbQuery();
            await ctx.editMessageText('🟡 Вы выбрали уровень: Уверенный');
            this.logger.debug('✅ Выбор уровня CONFIDENT завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelTournament(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("req_level_TOURNAMENT") вызван');
        try {
            await ctx.answerCbQuery();
            await ctx.editMessageText('🟠 Вы выбрали уровень: Турнирный');
            this.logger.debug('✅ Выбор уровня TOURNAMENT завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelSemiPro(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("req_level_SEMI_PRO") вызван');
        try {
            await ctx.answerCbQuery();
            await ctx.editMessageText('🔴 Вы выбрали уровень: Полупрофессионал');
            this.logger.debug('✅ Выбор уровня SEMI_PRO завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelAny(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("req_level_ANY") вызван');
        try {
            await ctx.answerCbQuery();
            await ctx.editMessageText('👥 Вы выбрали уровень: Любой уровень');
            this.logger.debug('✅ Выбор уровня ANY завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Обработчики для выбора руки в профиле
    async handleHandLeft(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("hand_LEFT") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleHandSelection('LEFT', ctx);
            this.logger.debug('✅ Выбор руки LEFT завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе руки:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleHandRight(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("hand_RIGHT") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleHandSelection('RIGHT', ctx);
            this.logger.debug('✅ Выбор руки RIGHT завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе руки:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Обработчики для сообщений (messaging)
    async handleCancelMessage(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("cancel_message") вызван');
        try {
            await ctx.answerCbQuery();
            await this.messagingHandler.handleCancelMessage(ctx);
            this.logger.debug('✅ Отмена сообщения завершена');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при отмене сообщения:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Обработчики для динамических callback_data (с ID)
    async handleJoinTournament(ctx) {
        this.logger.debug('🔍 DECORATOR @Action(join_tournament_) вызван');
        try {
            await ctx.answerCbQuery();
            await this.tournamentsHandler.handleJoinTournament(ctx);
            this.logger.debug('✅ Присоединение к турниру завершено');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при присоединении к турниру:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLeaveTournament(ctx) {
        this.logger.debug('🔍 DECORATOR @Action(leave_tournament_) вызван');
        try {
            await ctx.answerCbQuery();
            await this.tournamentsHandler.handleLeaveTournament(ctx);
            this.logger.debug('✅ Покидание турнира завершено');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при покидании турнира:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleViewProfile(ctx) {
        this.logger.debug('🔍 DECORATOR @Action(view_profile_) вызван');
        try {
            await ctx.answerCbQuery();
            await this.messagingHandler.handleViewProfile(ctx);
            this.logger.debug('✅ Просмотр профиля завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при просмотре профиля:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleReplyMessage(ctx) {
        this.logger.debug('🔍 DECORATOR @Action(reply_message_) вызван');
        try {
            await ctx.answerCbQuery();
            await this.messagingHandler.handleReplyMessage(ctx);
            this.logger.debug('✅ Ответ на сообщение завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при ответе на сообщение:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Полные Action декораторы для профиля и анкеты
    async handleProfileAction(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("profile") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleProfile(ctx);
            this.logger.debug('✅ Профиль отображен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при отображении профиля:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Выбор спорта
    async handleSportTennis(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("sport_TENNIS") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleSportSelection('TENNIS', ctx);
            this.logger.debug('✅ Выбор спорта TENNIS завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе спорта TENNIS:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleSportPadel(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("sport_PADEL") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleSportSelection('PADEL', ctx);
            this.logger.debug('✅ Выбор спорта PADEL завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе спорта PADEL:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Переход к шагу 2
    async handleStartStepTwo(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("start_step_two") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleStartStepTwo(ctx);
            this.logger.debug('✅ Переход к шагу 2 завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при переходе к шагу 2:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Участие в турнирах
    async handleTournamentsYes(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("tournaments_YES") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleTournamentsSelection(true, ctx);
            this.logger.debug('✅ Выбор турниров YES завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе турниров YES:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleTournamentsNo(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("tournaments_NO") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleTournamentsSelection(false, ctx);
            this.logger.debug('✅ Выбор турниров NO завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе турниров NO:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Уровень игры
    async handleLevelBeginnerProfile(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("level_BEGINNER") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleLevelSelection('BEGINNER', ctx);
            this.logger.debug('✅ Выбор уровня BEGINNER завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня BEGINNER:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelAmateurProfile(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("level_AMATEUR") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleLevelSelection('AMATEUR', ctx);
            this.logger.debug('✅ Выбор уровня AMATEUR завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня AMATEUR:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelConfidentProfile(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("level_CONFIDENT") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleLevelSelection('CONFIDENT', ctx);
            this.logger.debug('✅ Выбор уровня CONFIDENT завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня CONFIDENT:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelAdvancedProfile(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("level_ADVANCED") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleLevelSelection('ADVANCED', ctx);
            this.logger.debug('✅ Выбор уровня ADVANCED завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня ADVANCED:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelTournamentProfile(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("level_TOURNAMENT") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleLevelSelection('TOURNAMENT', ctx);
            this.logger.debug('✅ Выбор уровня TOURNAMENT завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня TOURNAMENT:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelSemiProProfile(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("level_SEMI_PRO") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleLevelSelection('SEMI_PRO', ctx);
            this.logger.debug('✅ Выбор уровня SEMI_PRO завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня SEMI_PRO:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Дополнительные уровни с NTRP
    async handleLevelBeginnerNtrp(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("level_BEGINNER_1_2") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleLevelSelection('BEGINNER', ctx);
            this.logger.debug('✅ Выбор уровня BEGINNER_1_2 завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня BEGINNER_1_2:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelAmateurNtrp(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("level_AMATEUR_2_3") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleLevelSelection('AMATEUR', ctx);
            this.logger.debug('✅ Выбор уровня AMATEUR_2_3 завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня AMATEUR_2_3:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelConfidentNtrp(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("level_CONFIDENT_4") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleLevelSelection('CONFIDENT', ctx);
            this.logger.debug('✅ Выбор уровня CONFIDENT_4 завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня CONFIDENT_4:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleLevelTournamentNtrp(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("level_TOURNAMENT_5") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleLevelSelection('TOURNAMENT', ctx);
            this.logger.debug('✅ Выбор уровня TOURNAMENT_5 завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе уровня TOURNAMENT_5:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Частота игр
    async handleFrequency1(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("frequency_1") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleFrequencySelection('1_PER_WEEK', ctx);
            this.logger.debug('✅ Выбор частоты 1 раз в неделю завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе частоты 1 раз в неделю:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleFrequency2(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("frequency_2") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleFrequencySelection('2_3_PER_WEEK', ctx);
            this.logger.debug('✅ Выбор частоты 2-3 раза в неделю завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе частоты 2-3 раза в неделю:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleFrequency3(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("frequency_3") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleFrequencySelection('4_PLUS_PER_WEEK', ctx);
            this.logger.debug('✅ Выбор частоты 4+ раза в неделю завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе частоты 4+ раза в неделю:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Время игры
    async handleTimeMorning(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("time_MORNING") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handlePlayTimeSelection('MORNING', ctx);
            this.logger.debug('✅ Выбор времени MORNING завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе времени MORNING:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleTimeDay(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("time_DAY") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handlePlayTimeSelection('DAY', ctx);
            this.logger.debug('✅ Выбор времени DAY завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе времени DAY:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleTimeEvening(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("time_EVENING") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handlePlayTimeSelection('EVENING', ctx);
            this.logger.debug('✅ Выбор времени EVENING завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе времени EVENING:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleTimeNight(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("time_NIGHT") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handlePlayTimeSelection('NIGHT', ctx);
            this.logger.debug('✅ Выбор времени NIGHT завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе времени NIGHT:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleContinueToFrequency(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("continue_to_frequency") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleContinueToFrequency(ctx);
            this.logger.debug('✅ Переход к частоте завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при переходе к частоте:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Выбор бэкхенда
    async handleBackhandOne(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("backhand_ONE") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleBackhandSelection('ONE_HANDED', ctx);
            this.logger.debug('✅ Выбор одноручного бэкхенда завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе одноручного бэкхенда:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleBackhandTwo(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("backhand_TWO") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleBackhandSelection('TWO_HANDED', ctx);
            this.logger.debug('✅ Выбор двуручного бэкхенда завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе двуручного бэкхенда:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Выбор покрытия
    async handleSurfaceHard(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("surface_HARD") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleSurfaceSelection('HARD', ctx);
            this.logger.debug('✅ Выбор покрытия HARD завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе покрытия HARD:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleSurfaceClay(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("surface_CLAY") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleSurfaceSelection('CLAY', ctx);
            this.logger.debug('✅ Выбор покрытия CLAY завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе покрытия CLAY:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleSurfaceGrass(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("surface_GRASS") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleSurfaceSelection('GRASS', ctx);
            this.logger.debug('✅ Выбор покрытия GRASS завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе покрытия GRASS:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleSurfaceCarpet(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("surface_CARPET") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleSurfaceSelection('CARPET', ctx);
            this.logger.debug('✅ Выбор покрытия CARPET завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе покрытия CARPET:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Выбор стиля игры
    async handleStyleUniversal(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("style_UNIVERSAL") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleStyleSelection('UNIVERSAL', ctx);
            this.logger.debug('✅ Выбор стиля UNIVERSAL завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе стиля UNIVERSAL:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleStyleDefensive(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("style_DEFENSIVE") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleStyleSelection('DEFENSIVE', ctx);
            this.logger.debug('✅ Выбор стиля DEFENSIVE завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе стиля DEFENSIVE:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleStyleAggressive(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("style_AGGRESSIVE") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleStyleSelection('AGGRESSIVE', ctx);
            this.logger.debug('✅ Выбор стиля AGGRESSIVE завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе стиля AGGRESSIVE:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleStyleNetPlayer(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("style_NET_PLAYER") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleStyleSelection('NET_PLAYER', ctx);
            this.logger.debug('✅ Выбор стиля NET_PLAYER завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе стиля NET_PLAYER:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleStyleBasic(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("style_BASIC") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleStyleSelection('BASIC', ctx);
            this.logger.debug('✅ Выбор стиля BASIC завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе стиля BASIC:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Выбор любимого удара
    async handleShotServe(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("shot_SERVE") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleShotSelection('SERVE', ctx);
            this.logger.debug('✅ Выбор удара SERVE завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе удара SERVE:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleShotForehand(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("shot_FOREHAND") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleShotSelection('FOREHAND', ctx);
            this.logger.debug('✅ Выбор удара FOREHAND завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе удара FOREHAND:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleShotBackhand(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("shot_BACKHAND") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleShotSelection('BACKHAND', ctx);
            this.logger.debug('✅ Выбор удара BACKHAND завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе удара BACKHAND:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleShotVolley(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("shot_VOLLEY") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleShotSelection('VOLLEY', ctx);
            this.logger.debug('✅ Выбор удара VOLLEY завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе удара VOLLEY:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleShotSmash(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("shot_SMASH") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleShotSelection('SMASH', ctx);
            this.logger.debug('✅ Выбор удара SMASH завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе удара SMASH:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    // Выбор предпочтений по сопернику
    async handleOpponentAny(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("opponent_ANY") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleOpponentSelection('ANY', ctx);
            this.logger.debug('✅ Выбор соперника ANY завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе соперника ANY:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleOpponentMen(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("opponent_MEN") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleOpponentSelection('MEN', ctx);
            this.logger.debug('✅ Выбор соперника MEN завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе соперника MEN:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleOpponentWomen(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("opponent_WOMEN") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleOpponentSelection('WOMEN', ctx);
            this.logger.debug('✅ Выбор соперника WOMEN завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе соперника WOMEN:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleOpponentSameLevel(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("opponent_SAME_LEVEL") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleOpponentSelection('SAME_LEVEL', ctx);
            this.logger.debug('✅ Выбор соперника SAME_LEVEL завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе соперника SAME_LEVEL:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleOpponentStronger(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("opponent_STRONGER") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleOpponentSelection('STRONGER', ctx);
            this.logger.debug('✅ Выбор соперника STRONGER завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе соперника STRONGER:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
    async handleOpponentWeaker(ctx) {
        this.logger.debug('🔍 DECORATOR @Action("opponent_WEAKER") вызван');
        try {
            await ctx.answerCbQuery();
            await this.profileHandler.handleOpponentSelection('WEAKER', ctx);
            this.logger.debug('✅ Выбор соперника WEAKER завершен');
        }
        catch (error) {
            this.logger.error('❌ Ошибка при выборе соперника WEAKER:', error);
            await ctx.answerCbQuery('❌ Произошла ошибка');
        }
    }
};
exports.BotService = BotService;
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleStart", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('help'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleHelp", null);
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
    (0, nestjs_telegraf_1.Hears)('🏆 Турниры'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTournaments", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🏃‍♂️ Тренировки'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTrainings", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📱 Stories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleStories", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🎁 Кейсы'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCases", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📝 Записать результат'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleRecordResult", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🔗 Пригласить друга'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleInviteFriend", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🤖 AI-Coach'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleAiCoach", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📍 Корты'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCourts", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('⚙️ Настройки'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSettings", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleText", null);
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
    (0, nestjs_telegraf_1.Command)('debug'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleDebug", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('main_menu'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMainMenuAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('my_tournaments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMyTournamentsAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('find_tournament'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleFindTournamentAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('create_tournament'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCreateTournamentAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('detailed_stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleDetailedStatsAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('user_achievements'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleUserAchievementsAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('setup_profile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSetupProfileAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('user_goals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleUserGoalsAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('match_history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMatchHistoryAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('find_game'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleFindGameAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('create_request'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCreateRequestAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_profile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleBackToProfileAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_tournaments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleBackToTournamentsAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('req_level_BEGINNER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelBeginner", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('req_level_AMATEUR'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelAmateur", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('req_level_CONFIDENT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelConfident", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('req_level_TOURNAMENT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelTournament", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('req_level_SEMI_PRO'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelSemiPro", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('req_level_ANY'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelAny", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('hand_LEFT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleHandLeft", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('hand_RIGHT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleHandRight", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('cancel_message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCancelMessage", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^join_tournament_(.+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleJoinTournament", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^leave_tournament_(.+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLeaveTournament", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^view_profile_(.+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleViewProfile", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^reply_message_(.+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleReplyMessage", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('profile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleProfileAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('sport_TENNIS'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSportTennis", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('sport_PADEL'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSportPadel", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('start_step_two'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleStartStepTwo", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('tournaments_YES'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTournamentsYes", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('tournaments_NO'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTournamentsNo", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('level_BEGINNER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelBeginnerProfile", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('level_AMATEUR'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelAmateurProfile", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('level_CONFIDENT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelConfidentProfile", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('level_ADVANCED'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelAdvancedProfile", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('level_TOURNAMENT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelTournamentProfile", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('level_SEMI_PRO'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelSemiProProfile", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('level_BEGINNER_1_2'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelBeginnerNtrp", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('level_AMATEUR_2_3'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelAmateurNtrp", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('level_CONFIDENT_4'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelConfidentNtrp", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('level_TOURNAMENT_5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLevelTournamentNtrp", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('frequency_1'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleFrequency1", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('frequency_2'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleFrequency2", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('frequency_3'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleFrequency3", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('time_MORNING'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTimeMorning", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('time_DAY'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTimeDay", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('time_EVENING'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTimeEvening", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('time_NIGHT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTimeNight", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('continue_to_frequency'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleContinueToFrequency", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('backhand_ONE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleBackhandOne", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('backhand_TWO'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleBackhandTwo", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('surface_HARD'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSurfaceHard", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('surface_CLAY'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSurfaceClay", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('surface_GRASS'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSurfaceGrass", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('surface_CARPET'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSurfaceCarpet", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('style_UNIVERSAL'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleStyleUniversal", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('style_DEFENSIVE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleStyleDefensive", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('style_AGGRESSIVE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleStyleAggressive", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('style_NET_PLAYER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleStyleNetPlayer", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('style_BASIC'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleStyleBasic", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('shot_SERVE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleShotServe", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('shot_FOREHAND'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleShotForehand", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('shot_BACKHAND'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleShotBackhand", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('shot_VOLLEY'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleShotVolley", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('shot_SMASH'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleShotSmash", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('opponent_ANY'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleOpponentAny", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('opponent_MEN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleOpponentMen", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('opponent_WOMEN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleOpponentWomen", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('opponent_SAME_LEVEL'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleOpponentSameLevel", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('opponent_STRONGER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleOpponentStronger", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('opponent_WEAKER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleOpponentWeaker", null);
exports.BotService = BotService = BotService_1 = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        profile_handler_1.ProfileHandler,
        matches_handler_1.MatchesHandler,
        requests_handler_1.RequestsHandler,
        tournaments_handler_1.TournamentsHandler,
        trainings_handler_1.TrainingsHandler,
        stories_handler_1.StoriesHandler,
        cases_handler_1.CasesHandler,
        ai_coach_handler_1.AiCoachHandler,
        common_handler_1.CommonHandler,
        messaging_handler_1.MessagingHandler,
        state_service_1.StateService])
], BotService);
