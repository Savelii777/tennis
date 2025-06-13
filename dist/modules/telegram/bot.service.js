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
// src/modules/telegram/bot.service.ts
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const auth_service_1 = require("../auth/application/services/auth.service");
const users_service_1 = require("../users/application/services/users.service");
const requests_service_1 = require("../requests/application/services/requests.service");
const tournaments_service_1 = require("../tournaments/application/services/tournaments.service");
const trainings_service_1 = require("../trainings/application/services/trainings.service");
const telegraf_2 = require("telegraf");
let BotService = BotService_1 = class BotService {
    constructor(bot, authService, usersService, requestsService, tournamentsService, trainingsService) {
        this.bot = bot;
        this.authService = authService;
        this.usersService = usersService;
        this.requestsService = requestsService;
        this.tournamentsService = tournamentsService;
        this.trainingsService = trainingsService;
        this.logger = new common_1.Logger(BotService_1.name);
        this.mainKeyboard = telegraf_2.Markup.keyboard([
            ['👤 Профиль', '🎾 Играть'],
            ['🏆 Турниры', '📝 Записать результат'],
            ['📱 Stories', '🤖 AI-Coach', '📦 Кейсы']
        ]).resize();
        this.setupBot();
    }
    setupBot() {
        // Регистрируем обработчики команд
        this.bot.command('start', this.handleStart.bind(this));
        this.bot.command('profile', this.handleProfile.bind(this));
        this.bot.command('games', this.handleGames.bind(this));
        this.bot.command('results', this.handleResults.bind(this));
        this.bot.command('tournaments', this.handleTournaments.bind(this));
        this.bot.command('training', this.handleTraining.bind(this));
        this.bot.command('stories', this.handleStories.bind(this));
        this.bot.command('aicoach', this.handleAiCoach.bind(this));
        this.bot.command('cases', this.handleCases.bind(this));
        // Обработчики текстовых сообщений по кнопкам
        this.bot.hears('👤 Профиль', this.handleProfile.bind(this));
        this.bot.hears('🎾 Играть', this.handlePlay.bind(this));
        this.bot.hears('🏆 Турниры', this.handleTournaments.bind(this));
        this.bot.hears('📝 Записать результат', this.handleResults.bind(this));
        this.bot.hears('📱 Stories', this.handleStories.bind(this));
        this.bot.hears('🤖 AI-Coach', this.handleAiCoach.bind(this));
        this.bot.hears('📦 Кейсы', this.handleCases.bind(this));
        this.logger.log('Telegram bot setup completed');
    }
    // Обработчик для команды start
    async handleStart(ctx) {
        try {
            if (!ctx.message || !('from' in ctx.message))
                return;
            const from = ctx.message.from;
            if (!from)
                return;
            // Безопасно доступаемся к данным пользователя
            try {
                // Пытаемся найти пользователя
                const user = await this.usersService.findByTelegramId(from.id.toString());
                if (!user) {
                    // Регистрируем нового пользователя
                    const userData = {
                        telegram_id: from.id.toString(),
                        username: from.username || `user_${from.id}`,
                        first_name: from.first_name,
                        last_name: from.last_name || undefined,
                        photo_url: ''
                    };
                    await this.usersService.create(userData);
                    await ctx.reply(`Добро пожаловать, ${from.first_name}! Вы успешно зарегистрированы.
Теперь заполним ваш профиль, чтобы подбирать вам подходящие матчи.`, { reply_markup: this.mainKeyboard });
                    // Запускаем сцену заполнения профиля
                    if (ctx.scene) {
                        await ctx.scene.enter('profile-setup');
                    }
                }
                else {
                    // Если пользователь уже зарегистрирован
                    await ctx.reply(`С возвращением, ${user.first_name || from.first_name}!
Что хотите сделать сегодня?`, { reply_markup: this.mainKeyboard });
                }
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                this.logger.error(`Error in handleStart: ${errorMsg}`);
                await ctx.reply('Произошла ошибка при запуске бота. Пожалуйста, попробуйте позже.');
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`General error in handleStart: ${errorMsg}`);
            await ctx.reply('Произошла ошибка.');
        }
    }
    // Обработчик для профиля
    async handleProfile(ctx) {
        try {
            if (!ctx.message || !('from' in ctx.message))
                return;
            const from = ctx.message.from;
            if (!from)
                return;
            const user = await this.usersService.findByTelegramId(from.id.toString());
            if (!user) {
                return ctx.reply('Пожалуйста, сначала зарегистрируйтесь с помощью команды /start');
            }
            // Получаем статистику профиля
            const stats = await this.usersService.getProfileStatistics(user.id.toString());
            const profileStatus = await this.usersService.getProfileCompletionStatus(user.id.toString());
            // Формируем сообщение с информацией о профиле
            const message = `
👤 *Ваш профиль*
Имя: ${user.first_name} ${user.last_name || ''}
Рейтинг: ${stats.ratingPoints} очков (NTRP: ${user.profile?.ntrp_rating || 'Не определен'})

📊 *Статистика*
Матчей сыграно: ${stats.matchesPlayed}
Побед: ${stats.matchWins}
Поражений: ${stats.matchLosses}
Процент побед: ${stats.winRate || 0}%

🏆 *Турниры*
Участие: ${stats.tournamentsPlayed}
Побед: ${stats.tournamentsWon}

${!profileStatus.profileComplete ? '⚠️ Ваш профиль не полностью заполнен. Нажмите кнопку "Заполнить профиль"' : ''}`;
            // Создаем клавиатуру для профиля
            const keyboard = {
                inline_keyboard: [
                    [{ text: "🔄 Заполнить профиль", callback_data: "profile_setup" }],
                    [{ text: "📈 История рейтинга", callback_data: "rating_history" }],
                    [{ text: "📱 Мои Stories", callback_data: "my_stories" }],
                    [{ text: "🎾 Мои матчи", callback_data: "my_matches" }],
                ]
            };
            await ctx.reply(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in handleProfile: ${errorMsg}`);
            await ctx.reply('Произошла ошибка при загрузке профиля. Пожалуйста, попробуйте позже.');
        }
    }
    // Обработчик для игр
    async handleGames(ctx) {
        try {
            await ctx.reply('Поиск активных игр...');
            // Реализация будет добавлена позже
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in handleGames: ${errorMsg}`);
            await ctx.reply('Произошла ошибка при поиске игр.');
        }
    }
    // Обработчик для кнопки "Играть"
    async handlePlay(ctx) {
        try {
            const keyboard = {
                inline_keyboard: [
                    [{ text: "🎾 Создать матч", callback_data: "create_match" }],
                    [{ text: "📅 Создать тренировку", callback_data: "create_training" }],
                    [{ text: "🏆 Организовать турнир", callback_data: "create_tournament" }]
                ]
            };
            await ctx.reply('Выберите тип активности:', { reply_markup: keyboard });
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in handlePlay: ${errorMsg}`);
            await ctx.reply('Произошла ошибка.');
        }
    }
    // Обработчик для результатов
    async handleResults(ctx) {
        try {
            await ctx.reply('Запись результатов матча...');
            // Реализация будет добавлена позже
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in handleResults: ${errorMsg}`);
            await ctx.reply('Произошла ошибка при записи результатов.');
        }
    }
    // Обработчик для турниров
    async handleTournaments(ctx) {
        try {
            await ctx.reply('Поиск активных турниров...');
            // Реализация будет добавлена позже
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in handleTournaments: ${errorMsg}`);
            await ctx.reply('Произошла ошибка при поиске турниров.');
        }
    }
    // Обработчик для тренировок
    async handleTraining(ctx) {
        try {
            await ctx.reply('Поиск тренировок...');
            // Реализация будет добавлена позже
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in handleTraining: ${errorMsg}`);
            await ctx.reply('Произошла ошибка при поиске тренировок.');
        }
    }
    // Обработчик для stories
    async handleStories(ctx) {
        try {
            await ctx.reply('Просмотр stories...');
            // Реализация будет добавлена позже
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in handleStories: ${errorMsg}`);
            await ctx.reply('Произошла ошибка при загрузке stories.');
        }
    }
    // Обработчик для AI-Coach
    async handleAiCoach(ctx) {
        try {
            await ctx.reply('AI-Coach готов помочь вам! Расскажите, что вас интересует?');
            // Реализация будет добавлена позже
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in handleAiCoach: ${errorMsg}`);
            await ctx.reply('Произошла ошибка при запуске AI-Coach.');
        }
    }
    // Обработчик для кейсов
    async handleCases(ctx) {
        try {
            await ctx.reply('Доступные кейсы...');
            // Реализация будет добавлена позже
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in handleCases: ${errorMsg}`);
            await ctx.reply('Произошла ошибка при загрузке кейсов.');
        }
    }
};
BotService = BotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        auth_service_1.AuthService,
        users_service_1.UsersService,
        requests_service_1.RequestsService,
        tournaments_service_1.TournamentsService,
        trainings_service_1.TrainingsService])
], BotService);
exports.BotService = BotService;
