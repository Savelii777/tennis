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
const state_service_1 = require("./services/state.service");
let BotService = BotService_1 = class BotService {
    constructor(bot, profileHandler, matchesHandler, requestsHandler, tournamentsHandler, trainingHandler, storiesHandler, casesHandler, aiCoachHandler, commonHandler, stateService) {
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
        this.stateService = stateService;
        this.logger = new common_1.Logger(BotService_1.name);
    }
    async onModuleInit() {
        this.logger.log('Инициализация Telegram бота...');
        // Регистрация обработчиков
        this.profileHandler.register(this.bot);
        this.matchesHandler.register(this.bot);
        this.requestsHandler.register(this.bot);
        this.tournamentsHandler.register(this.bot);
        this.trainingHandler.register(this.bot);
        this.storiesHandler.register(this.bot);
        this.casesHandler.register(this.bot);
        this.aiCoachHandler.register(this.bot);
        this.commonHandler.register(this.bot);
        this.logger.log('Бот успешно инициализирован');
    }
    // Основные точки входа
    async handleStart(ctx) {
        return this.commonHandler.handleStart(ctx);
    }
    async handleProfile(ctx) {
        return this.profileHandler.handleProfile(ctx);
    }
    async handlePlay(ctx) {
        return this.requestsHandler.handlePlay(ctx);
    }
    async handleTournaments(ctx) {
        return this.tournamentsHandler.handleTournaments(ctx);
    }
    async handleTrainings(ctx) {
        return this.trainingHandler.handleTrainings(ctx);
    }
    async handleStories(ctx) {
        return this.storiesHandler.handleStories(ctx);
    }
    async handleCases(ctx) {
        return this.casesHandler.handleCases(ctx);
    }
    async handleRecordMatch(ctx) {
        return this.matchesHandler.handleRecordMatch(ctx);
    }
    async handleInviteButton(ctx) {
        return this.commonHandler.handleInviteButton(ctx);
    }
    async handleAICoach(ctx) {
        return this.aiCoachHandler.handleAICoach(ctx);
    }
    async handleLocations(ctx) {
        return this.tournamentsHandler.handleLocations(ctx);
    }
    async handleSettings(ctx) {
        return this.profileHandler.handleSettings(ctx);
    }
    // Обработка текстовых сообщений
    async handleText(ctx) {
        if (!ctx.from || !ctx.message || !('text' in ctx.message))
            return;
        const userId = ctx.from.id.toString();
        const text = ctx.message.text;
        // Проверка состояния пользователя
        const userState = this.stateService.getUserState(userId);
        this.logger.log(`Получено сообщение: ${text}, состояние: ${userState.step}`);
        // Перенаправляем в соответствующий обработчик в зависимости от состояния
        try {
            // Профиль
            if (await this.profileHandler.handleProfileInput(ctx, text, userId)) {
                return;
            }
            // Матчи
            if (await this.matchesHandler.handleMatchInput(ctx, text, userId)) {
                return;
            }
            // Заявки
            if (await this.requestsHandler.handleRequestInput(ctx, text, userId)) {
                return;
            }
            // Турниры
            if (await this.tournamentsHandler.handleTournamentInput(ctx, text, userId)) {
                return;
            }
            // Тренировки
            if (await this.trainingHandler.handleTrainingInput(ctx, text, userId)) {
                return;
            }
            // Stories
            if (await this.storiesHandler.handleStoryInput(ctx, text, userId)) {
                return;
            }
            // AI Coach
            if (await this.aiCoachHandler.handleAIInput(ctx, text, userId)) {
                return;
            }
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
        }
        catch (error) {
            this.logger.error(`Ошибка при обработке текста: ${error}`);
            await ctx.reply('❌ Произошла ошибка при обработке вашего сообщения');
        }
    }
    // Обработка фото для Stories
    async handlePhoto(ctx) {
        return this.storiesHandler.handlePhoto(ctx);
    }
    // Обработка видео для Stories
    async handleVideo(ctx) {
        return this.storiesHandler.handleVideo(ctx);
    }
    // Обработка команд для отладки
    async handleDebug(ctx) {
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        const userState = this.stateService.getUserState(userId);
        await ctx.reply(`🔍 **Отладочная информация**\n\n` +
            `User ID: ${userId}\n` +
            `State: ${userState.step}\n` +
            `Data: ${JSON.stringify(userState.data, null, 2)}`, { parse_mode: 'Markdown' });
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
], BotService.prototype, "handleRecordMatch", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🔗 Пригласить друга'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleInviteButton", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🤖 AI-Coach'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleAICoach", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📍 Корты'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLocations", null);
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
        state_service_1.StateService])
], BotService);
