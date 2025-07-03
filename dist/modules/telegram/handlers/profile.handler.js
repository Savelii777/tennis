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
var ProfileHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileHandler = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const state_service_1 = require("../services/state.service");
const keyboard_service_1 = require("../services/keyboard.service");
const profile_state_enum_1 = require("../interfaces/profile-state.enum");
const users_service_1 = require("../../users/application/services/users.service");
const ratings_service_1 = require("../../ratings/ratings.service");
const balls_service_1 = require("../../users/application/services/balls.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ProfileHandler = ProfileHandler_1 = class ProfileHandler {
    constructor(stateService, keyboardService, usersService, ratingsService, ballsService, prisma) {
        this.stateService = stateService;
        this.keyboardService = keyboardService;
        this.usersService = usersService;
        this.ratingsService = ratingsService;
        this.ballsService = ballsService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(ProfileHandler_1.name);
    }
    // Метод register - регистрация всех обработчиков
    register(bot) {
        // Существующие обработчики
        bot.command('profile', this.handleProfileCommand.bind(this));
        bot.action('profile', this.handleProfile.bind(this));
        bot.action('detailed_stats', this.handleDetailedStats.bind(this));
        bot.action('user_achievements', this.handleUserAchievements.bind(this));
        bot.action('setup_profile', this.handleSetupProfileAction.bind(this));
        bot.action('match_history', this.handleMatchHistory.bind(this));
        bot.action('user_goals', this.handleUserGoals.bind(this));
        bot.action('back_to_profile', this.handleBackToProfile.bind(this));
        // Обработчики для выбора руки
        bot.action('hand_LEFT', async (ctx) => this.handleHandSelection('LEFT', ctx));
        bot.action('hand_RIGHT', async (ctx) => this.handleHandSelection('RIGHT', ctx));
        // Обработчики для частоты игр
        bot.action('frequency_1', async (ctx) => this.handleFrequencySelection('1_PER_WEEK', ctx));
        bot.action('frequency_2', async (ctx) => this.handleFrequencySelection('2_3_PER_WEEK', ctx));
        bot.action('frequency_3', async (ctx) => this.handleFrequencySelection('4_PLUS_PER_WEEK', ctx));
        // Обработчики для турниров
        bot.action('tournaments_YES', async (ctx) => this.handleTournamentsSelection(true, ctx));
        bot.action('tournaments_NO', async (ctx) => this.handleTournamentsSelection(false, ctx));
        // Обработчики для уровня игры
        bot.action('level_BEGINNER', async (ctx) => this.handleLevelSelection('BEGINNER', ctx));
        bot.action('level_AMATEUR', async (ctx) => this.handleLevelSelection('AMATEUR', ctx));
        bot.action('level_CONFIDENT', async (ctx) => this.handleLevelSelection('CONFIDENT', ctx));
        bot.action('level_ADVANCED', async (ctx) => this.handleLevelSelection('ADVANCED', ctx));
        bot.action('level_TOURNAMENT', async (ctx) => this.handleLevelSelection('TOURNAMENT', ctx));
    }
    async handleProfile(ctx) {
        this.logger.log('👤 ПРОФИЛЬ кнопка нажата');
        try {
            if (!ctx.from)
                return;
            const userId = ctx.from.id.toString();
            const user = await this.usersService.findByTelegramId(userId);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден. Отправьте /start');
                return;
            }
            // Получаем полный профиль пользователя с профилем
            const userWithProfile = await this.prisma.user.findUnique({
                where: { id: parseInt(user.id.toString()) },
                include: { profile: true }
            });
            // Получаем рейтинг пользователя
            let ratingInfo = '';
            try {
                const rating = await this.ratingsService.getRatingForUser(user.id);
                if (rating) {
                    ratingInfo = `🎯 **NTRP рейтинг:** ${rating.skillRating?.toFixed(1) || '?'}\n` +
                        `⚡ **Очки силы:** ${rating.skillPoints || 0}\n` +
                        `⭐ **Очки активности:** ${rating.pointsRating || 0}\n`;
                }
                else {
                    ratingInfo = `🏆 **Рейтинг:** Пройдите первый матч для расчета!\n`;
                }
            }
            catch (error) {
                this.logger.error(`Ошибка получения рейтинга: ${error}`);
                ratingInfo = `🏆 **Рейтинг:** Временно недоступен\n`;
            }
            // Получаем статистику профиля
            try {
                const stats = await this.usersService.getProfileStatistics(user.id.toString());
                const profileCompletion = await this.usersService.getProfileCompletionStatus(user.id.toString());
                const ballsBalance = await this.ballsService.getUserBalance(user.id.toString());
                const completionPercentage = Math.round(((profileCompletion.stepOneCompleted ? 50 : 0) +
                    (profileCompletion.stepTwoCompleted ? 50 : 0)));
                `🧩 Заполненность профиля: ${completionPercentage}%`;
                const message = `👤 **Профиль ${user.first_name} ${user.last_name || ''}**\n\n` +
                    `${ratingInfo}\n` +
                    `🏙️ **Город:** ${userWithProfile?.profile?.city || 'Не указан'}\n` +
                    `👋 **Рука:** ${this.getDominantHandText(userWithProfile?.profile?.dominantHand)}\n` +
                    `🏆 **Уровень:** ${this.getLevelText(userWithProfile?.profile?.selfAssessedLevel || '')}\n\n` +
                    `📊 **Статистика:**\n` +
                    `📈 Матчей сыграно: ${stats.matchesPlayed || 0}\n` +
                    `🥇 Побед: ${stats.matchWins || 0}\n` +
                    `🎾 Мячей: ${ballsBalance}\n` +
                    `🧩 Заполненность профиля: ${completionPercentage}%`;
                await ctx.reply(message, {
                    parse_mode: 'Markdown',
                    reply_markup: this.keyboardService.getProfileKeyboard().reply_markup
                });
            }
            catch (error) {
                this.logger.error(`Ошибка получения статистики профиля: ${error}`);
                await ctx.reply('❌ Ошибка при загрузке профиля');
            }
        }
        catch (error) {
            this.logger.error(`Ошибка в handleProfile: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке профиля');
        }
    }
    async handleDetailedStats(ctx) {
        try {
            await ctx.answerCbQuery();
            if (!ctx.from)
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user)
                return;
            // Получаем детальную статистику
            const [stats, rating] = await Promise.all([
                this.usersService.getProfileStatistics(user.id.toString()),
                this.ratingsService.getRatingForUser(user.id)
            ]);
            // Добавляем метод getUserMatches в UsersService
            const matches = await this.usersService.getUserMatches(user.id.toString());
            let message = `📊 **Детальная статистика**\n\n`;
            // Рейтинги
            if (rating) {
                message += `🏆 **Рейтинговая система:**\n`;
                message += `🎯 **NTRP уровень:** ${rating.skillRating?.toFixed(1) || 'N/A'}\n`;
                message += `⚡ **Очки силы:** ${rating.skillPoints || 0}\n`;
                message += `⭐ **Очки активности:** ${rating.pointsRating || 0}\n\n`;
            }
            // Статистика матчей
            message += `🎾 **Матчи:**\n`;
            message += `✅ Всего: ${stats.matchesPlayed || 0}\n`;
            message += `🏆 Побед: ${stats.matchWins || 0}\n`;
            message += `😔 Поражений: ${stats.matchLosses || 0}\n`;
            message += `📈 Процент побед: ${stats.winRate || 0}%\n\n`;
            // Турниры
            message += `🏆 **Турниры:**\n`;
            message += `🎯 Участие: ${stats.tournamentsPlayed || 0}\n`;
            message += `🥇 Победы: ${stats.tournamentsWon || 0}\n\n`;
            // Последние матчи
            message += `📋 **Последние матчи:**\n`;
            if (matches && matches.length > 0) {
                matches.slice(0, 3).forEach((match, index) => {
                    const date = new Date(match.date || match.matchDate).toLocaleDateString('ru-RU');
                    const opponent = match.opponent?.name || match.opponentName || 'Неизвестно';
                    const result = match.result === 'WIN' ? '✅' : '❌';
                    message += `${index + 1}. ${date} vs ${opponent} ${result} ${match.score || ''}\n`;
                });
            }
            else {
                message += `Пока нет записанных матчей\n`;
            }
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('⬅️ Назад к профилю', 'back_to_profile')]
                ]).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка получения детальной статистики: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке статистики');
        }
    }
    async handleUserAchievements(ctx) {
        try {
            await ctx.answerCbQuery();
            if (!ctx.from)
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user)
                return;
            // Заглушка для достижений, которую нужно заменить на реальный запрос
            const achievements = [];
            let message = `🏆 **Достижения**\n\n`;
            if (achievements && achievements.length > 0) {
                achievements.forEach((achievement, index) => {
                    message += `${index + 1}. ${achievement.title} - ${achievement.description}\n`;
                });
            }
            else {
                message += `Пока нет достижений. Играйте матчи и участвуйте в турнирах, чтобы получить их!\n\n`;
                message += `🎯 Доступные достижения:\n`;
                message += `• Новичок - Сыграйте первый матч\n`;
                message += `• Победитель - Выиграйте 5 матчей\n`;
                message += `• Турнирный игрок - Участвуйте в турнире\n`;
            }
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('⬅️ Назад к профилю', 'back_to_profile')]
                ]).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка получения достижений: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке достижений');
        }
    }
    async handleSetupProfileAction(ctx) {
        try {
            if (!ctx.from)
                return;
            const userId = ctx.from.id.toString();
            // Инициализируем состояние для настройки профиля
            this.stateService.setUserState(userId, {
                step: profile_state_enum_1.ProfileStep.AWAITING_CITY,
                data: {}
            });
            // Запрашиваем город
            await ctx.reply('В каком городе вы играете?');
        }
        catch (error) {
            this.logger.error(`Ошибка при настройке профиля: ${error}`);
            await ctx.reply('❌ Произошла ошибка. Пожалуйста, попробуйте позже.');
        }
    }
    async handleTournamentsSelection(participates, ctx) {
        try {
            await ctx.answerCbQuery(); // Подтверждаем нажатие
            if (!ctx.from)
                return;
            const userId = ctx.from.id.toString();
            const userState = this.stateService.getUserState(userId);
            // Проверяем, что находимся в правильном состоянии
            if (userState.step !== profile_state_enum_1.ProfileStep.AWAITING_TOURNAMENTS) {
                return;
            }
            // Сохраняем информацию об участии в турнирах
            userState.data.playsInTournaments = participates;
            // Переходим к следующему шагу
            userState.step = profile_state_enum_1.ProfileStep.AWAITING_LEVEL;
            this.stateService.setUserState(userId, userState);
            this.logger.log(`Участие в турнирах: ${participates} для пользователя ${userId}`);
            // Отображаем выбор уровня игры
            await ctx.reply('Как бы вы оценили свой уровень игры?', telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('Начинающий', 'level_BEGINNER')],
                [telegraf_1.Markup.button.callback('Любитель', 'level_AMATEUR')],
                [telegraf_1.Markup.button.callback('Уверенный игрок', 'level_CONFIDENT')],
                [telegraf_1.Markup.button.callback('Продвинутый', 'level_ADVANCED')],
                [telegraf_1.Markup.button.callback('Турнирный игрок', 'level_TOURNAMENT')]
            ]));
        }
        catch (error) {
            this.logger.error(`Ошибка при выборе участия в турнирах: ${error}`);
            await ctx.reply('❌ Произошла ошибка. Пожалуйста, попробуйте ещё раз.');
        }
    }
    async handleLevelSelection(level, ctx) {
        try {
            await ctx.answerCbQuery(); // Подтверждаем нажатие
            if (!ctx.from)
                return;
            const userId = ctx.from.id.toString();
            const userState = this.stateService.getUserState(userId);
            // Проверяем, что находимся в правильном состоянии
            if (userState.step !== profile_state_enum_1.ProfileStep.AWAITING_LEVEL) {
                return;
            }
            // Сохраняем выбор уровня в данных пользователя с правильным типом
            userState.data.selfAssessedLevel = level;
            // Заполнение профиля завершено
            userState.step = profile_state_enum_1.ProfileStep.COMPLETE;
            this.stateService.setUserState(userId, userState);
            this.logger.log(`Установлен уровень ${level} для пользователя ${userId}`);
            // Сохраняем данные профиля в базе данных
            await this.completeProfileSetup(userId, userState.data);
            // Отображаем сообщение об успешном завершении
            await ctx.reply('✅ Профиль успешно настроен!\n\nТеперь вы можете пользоваться всеми функциями приложения.', telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('Перейти в профиль', 'profile')],
                [telegraf_1.Markup.button.callback('🎮 Главное меню', 'main_menu')]
            ]));
        }
        catch (error) {
            this.logger.error(`Ошибка при выборе уровня игры: ${error}`);
            await ctx.reply('❌ Произошла ошибка при сохранении профиля. Пожалуйста, попробуйте ещё раз.');
        }
    }
    /**
     * Метод для сохранения данных профиля
     */
    async completeProfileSetup(telegramUserId, profileData) {
        try {
            this.logger.log(`Сохранение профиля для Telegram ID: ${telegramUserId}`);
            // Находим пользователя по telegramId, а не по id
            const user = await this.prisma.user.findUnique({
                where: { telegramId: telegramUserId }
            });
            if (!user) {
                throw new common_1.NotFoundException(`Пользователь с Telegram ID ${telegramUserId} не найден`);
            }
            const userId = user.id; // Получаем настоящий ID пользователя из базы данных
            this.logger.log(`Найден пользователь в БД с ID: ${userId}`);
            // Шаг 1: создаем объект для API
            const profileStepOneDto = {
                city: profileData.city,
                preferredCourt: profileData.preferredCourt,
                dominantHand: profileData.dominantHand,
                preferredPlayTime: ['EVENING'], // По умолчанию
                playsInTournaments: profileData.playsInTournaments || false,
                weeklyPlayFrequency: profileData.weeklyPlayFrequency || '1_PER_WEEK',
                firstName: user.firstName, // Берем из существующей записи
                lastName: user.lastName || undefined // Конвертируем null в undefined
            };
            // Вызываем API для сохранения данных шага 1
            await this.usersService.completeProfileStepOne(userId.toString(), profileStepOneDto);
            // Шаг 2: создаем объект для следующего API
            const profileStepTwoDto = {
                selfAssessedLevel: profileData.selfAssessedLevel || 'BEGINNER',
                backhandType: 'TWO_HANDED', // По умолчанию
                preferredSurface: 'HARD', // По умолчанию
                playingStyle: 'UNIVERSAL', // По умолчанию
                favoriteShot: 'FOREHAND', // По умолчанию
                racket: 'Любая', // По умолчанию
                opponentPreference: 'ANY' // По умолчанию
            };
            // Вызываем API для сохранения данных шага 2
            await this.usersService.completeProfileStepTwo(userId.toString(), profileStepTwoDto);
            this.logger.log(`✅ Профиль успешно сохранен для пользователя ${userId}`);
        }
        catch (error) {
            this.logger.error(`Ошибка при сохранении профиля: ${error}`);
            throw error;
        }
    }
    async handleMatchHistory(ctx) {
        try {
            await ctx.answerCbQuery();
            if (!ctx.from)
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user)
                return;
            const matches = await this.usersService.getUserMatches(user.id.toString());
            let message = `📋 **История матчей**\n\n`;
            if (matches && matches.length > 0) {
                matches.slice(0, 10).forEach((match, index) => {
                    const date = new Date(match.date || match.matchDate).toLocaleDateString('ru-RU');
                    const opponent = match.opponent?.name || match.opponentName || 'Неизвестно';
                    const result = match.result === 'WIN' ? '✅ Победа' : '❌ Поражение';
                    message += `${index + 1}. ${date} vs ${opponent}\n`;
                    message += `   ${result} ${match.score || ''}\n\n`;
                });
            }
            else {
                message += `У вас пока нет записанных матчей.\n\n`;
                message += `Используйте кнопку "📝 Записать результат" в главном меню, чтобы добавить свой первый матч!`;
            }
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('⬅️ Назад к профилю', 'back_to_profile')]
                ]).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка получения истории матчей: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке истории матчей');
        }
    }
    async handleUserGoals(ctx) {
        try {
            await ctx.answerCbQuery();
            const message = `🎯 **Цели**\n\n` +
                `• Сыграть 10 матчей - Прогресс: 3/10\n` +
                `• Победить в турнире - Не выполнено\n` +
                `• Повысить NTRP на 0.5 пункта - В процессе\n\n` +
                `Добавление персональных целей будет доступно в следующих обновлениях!`;
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('⬅️ Назад к профилю', 'back_to_profile')]
                ]).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка получения целей: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке целей');
        }
    }
    async handleBackToProfile(ctx) {
        try {
            await ctx.answerCbQuery();
            await this.handleProfile(ctx);
        }
        catch (error) {
            this.logger.error(`Ошибка в handleBackToProfile: ${error}`);
            await ctx.reply('❌ Ошибка при возврате к профилю');
        }
    }
    async handleSettings(ctx) {
        try {
            if (!ctx.from)
                return;
            const userId = ctx.from.id.toString();
            const user = await this.usersService.findByTelegramId(userId);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            // В реальном приложении здесь будет загрузка настроек из сервиса
            const settings = {
                notificationsEnabled: true,
                language: 'ru'
            };
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🔔 Уведомления', 'toggle_notifications')],
                [
                    telegraf_1.Markup.button.callback('🇷🇺 Русский', 'lang_ru'),
                    telegraf_1.Markup.button.callback('🇬🇧 English', 'lang_en')
                ],
                [telegraf_1.Markup.button.callback('⬅️ Назад в меню', 'back_to_menu')]
            ]);
            await ctx.reply(`⚙️ **Настройки**\n\n` +
                `🔔 Уведомления: ${settings.notificationsEnabled ? 'Включены' : 'Выключены'}\n` +
                `🌐 Язык: ${settings.language === 'ru' ? 'Русский' : 'English'}`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleSettings: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке настроек');
        }
    }
    // Вспомогательные методы
    getLevelText(level) {
        const levels = {
            'BEGINNER': 'Начинающий',
            'AMATEUR': 'Любитель',
            'CONFIDENT': 'Уверенный',
            'TOURNAMENT': 'Турнирный',
            'SEMI_PRO': 'Полупрофессионал',
            'ANY': 'Любой'
        };
        return levels[level] || 'Не указан';
    }
    getDominantHandText(hand) {
        if (hand === 'LEFT')
            return 'Левая';
        if (hand === 'RIGHT')
            return 'Правая';
        return 'Не указана';
    }
    async handleFrequencySelection(frequency, ctx) {
        try {
            await ctx.answerCbQuery(); // Подтверждаем нажатие
            if (!ctx.from)
                return;
            const userId = ctx.from.id.toString();
            const userState = this.stateService.getUserState(userId);
            // Проверяем, что находимся в правильном состоянии
            if (userState.step !== profile_state_enum_1.ProfileStep.AWAITING_FREQUENCY) {
                return;
            }
            // Преобразуем строковое значение в соответствующий тип
            let typedFrequency;
            switch (frequency) {
                case '1_PER_WEEK':
                    typedFrequency = "ONCE";
                    break;
                case '2_3_PER_WEEK':
                    typedFrequency = "TWICE";
                    break;
                case '4_PLUS_PER_WEEK':
                    typedFrequency = "FOUR_PLUS";
                    break;
                default:
                    typedFrequency = "ONCE";
            }
            // Сохраняем выбор частоты в данных пользователя
            userState.data.weeklyPlayFrequency = typedFrequency;
            // Переходим к следующему шагу
            userState.step = profile_state_enum_1.ProfileStep.AWAITING_TOURNAMENTS;
            this.stateService.setUserState(userId, userState);
            this.logger.log(`Установлена частота игр ${frequency} для пользователя ${userId}`);
            // Отображаем вопрос о турнирах
            await ctx.reply('Вы участвуете в турнирах?', telegraf_1.Markup.inlineKeyboard([
                [
                    telegraf_1.Markup.button.callback('Да', 'tournaments_YES'),
                    telegraf_1.Markup.button.callback('Нет', 'tournaments_NO')
                ]
            ]));
        }
        catch (error) {
            this.logger.error(`Ошибка при выборе частоты игр: ${error}`);
            await ctx.reply('❌ Произошла ошибка. Пожалуйста, попробуйте ещё раз.');
        }
    }
    async handleProfileInput(ctx, text, userId) {
        const userState = this.stateService.getUserState(userId);
        this.logger.log(`Обработка ввода для профиля: ${text}, текущий шаг: ${userState.step}`);
        switch (userState.step) {
            case profile_state_enum_1.ProfileStep.AWAITING_CITY:
                return await this.handleCity(ctx, text, userId, userState);
            case profile_state_enum_1.ProfileStep.AWAITING_COURT:
                return await this.handleCourt(ctx, text, userId, userState);
            case profile_state_enum_1.ProfileStep.AWAITING_HAND:
                // Для шага выбора руки используем инлайн кнопки
                await ctx.reply("Пожалуйста, выберите руку, используя кнопки выше", telegraf_1.Markup.inlineKeyboard([
                    [
                        telegraf_1.Markup.button.callback('👈 Левая', 'hand_LEFT'),
                        telegraf_1.Markup.button.callback('👉 Правая', 'hand_RIGHT')
                    ]
                ]));
                return true;
            case profile_state_enum_1.ProfileStep.AWAITING_FREQUENCY:
                // Обработка текста для частоты игр без дублирования инлайн-кнопок
                if (text.includes("1 раз")) {
                    return await this.processFrequencySelection("1_PER_WEEK", ctx, userId, userState);
                }
                else if (text.includes("2-3")) {
                    return await this.processFrequencySelection("2_3_PER_WEEK", ctx, userId, userState);
                }
                else if (text.includes("4+")) {
                    return await this.processFrequencySelection("4_PLUS_PER_WEEK", ctx, userId, userState);
                }
                else {
                    await ctx.reply("Пожалуйста, выберите частоту игр, используя кнопки ниже");
                    return true;
                }
            case profile_state_enum_1.ProfileStep.AWAITING_TOURNAMENTS:
                // Для шага выбора участия в турнирах используем инлайн кнопки
                await ctx.reply("Участвуете ли вы в турнирах? Выберите ответ ниже", telegraf_1.Markup.inlineKeyboard([
                    [
                        telegraf_1.Markup.button.callback('Да', 'tournaments_YES'),
                        telegraf_1.Markup.button.callback('Нет', 'tournaments_NO')
                    ]
                ]));
                return true;
            case profile_state_enum_1.ProfileStep.AWAITING_LEVEL:
                // Для шага выбора уровня используем инлайн кнопки
                await ctx.reply("Как бы вы оценили свой уровень игры?", telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('Начинающий', 'level_BEGINNER')],
                    [telegraf_1.Markup.button.callback('Любитель', 'level_AMATEUR')],
                    [telegraf_1.Markup.button.callback('Уверенный игрок', 'level_CONFIDENT')],
                    [telegraf_1.Markup.button.callback('Продвинутый', 'level_ADVANCED')],
                    [telegraf_1.Markup.button.callback('Турнирный игрок', 'level_TOURNAMENT')]
                ]));
                return true;
        }
        return false;
    }
    // Добавляем вспомогательный метод для обработки выбора частоты
    async processFrequencySelection(frequency, ctx, userId, userState) {
        // Сохраняем выбор частоты в данных пользователя
        userState.data.weeklyPlayFrequency = frequency;
        // Переходим к следующему шагу
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_TOURNAMENTS;
        this.stateService.setUserState(userId, userState);
        this.logger.log(`Установлена частота игр ${frequency} для пользователя ${userId}`);
        // Отображаем вопрос о турнирах
        await ctx.reply('Вы участвуете в турнирах?', telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('Да', 'tournaments_YES'),
                telegraf_1.Markup.button.callback('Нет', 'tournaments_NO')
            ]
        ]));
        return true;
    }
    async handleCity(ctx, text, userId, userState) {
        // Сохраняем город
        userState.data.city = text;
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_COURT;
        this.stateService.setUserState(userId, userState);
        this.logger.log(`Сохранен город: ${text} для пользователя ${userId}`);
        // Запрашиваем корт
        await ctx.reply('На каком корте вы предпочитаете играть?');
        return true;
    }
    async handleCourt(ctx, text, userId, userState) {
        // Сохраняем предпочитаемый корт
        userState.data.preferredCourt = text;
        userState.step = profile_state_enum_1.ProfileStep.AWAITING_HAND;
        this.stateService.setUserState(userId, userState);
        this.logger.log(`Сохранен корт: ${text} для пользователя ${userId}`);
        // Запрашиваем выбор руки через инлайн-кнопки
        await ctx.reply('Какой рукой вы играете?', telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('👈 Левая', 'hand_LEFT'),
                telegraf_1.Markup.button.callback('👉 Правая', 'hand_RIGHT')
            ]
        ]));
        return true;
    }
    async handleHandSelection(hand, ctx) {
        try {
            await ctx.answerCbQuery(); // Подтверждаем нажатие
            if (!ctx.from)
                return;
            const userId = ctx.from.id.toString();
            const userState = this.stateService.getUserState(userId);
            // Проверяем, что находимся в правильном состоянии
            if (userState.step !== profile_state_enum_1.ProfileStep.AWAITING_HAND) {
                return;
            }
            // Сохраняем выбор руки в данных пользователя
            userState.data.dominantHand = hand;
            // Переходим к следующему шагу
            userState.step = profile_state_enum_1.ProfileStep.AWAITING_FREQUENCY;
            this.stateService.setUserState(userId, userState);
            // Отображаем ТОЛЬКО клавиатуру выбора частоты игры (убираем инлайн-кнопки)
            const keyboard = telegraf_1.Markup.keyboard([
                ['1 раз в неделю'],
                ['2-3 раза в неделю'],
                ['4+ раза в неделю']
            ]).resize();
            await ctx.reply(`✅ Доминирующая рука: **${hand === 'LEFT' ? 'Левая' : 'Правая'}**\n\n` +
                `Как часто вы играете?`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
            this.logger.log(`Установлена доминантная рука ${hand} для пользователя ${userId}`);
        }
        catch (error) {
            this.logger.error(`Ошибка при выборе руки: ${error}`);
            await ctx.reply('❌ Произошла ошибка при обработке вашего выбора. Пожалуйста, попробуйте ещё раз.');
        }
    }
    async handleFrequency(ctx, text, userId, userState) {
        // Для обработки через кнопки
        return true;
    }
    async handleTournaments(ctx, text, userId, userState) {
        // Для обработки через кнопки
        return true;
    }
    async handleLevel(ctx, text, userId, userState) {
        // Для обработки через кнопки
        return true;
    }
    async formatProfileMessage(user) {
        // Форматируем сообщение профиля с правильными визуальными элементами
        // Получаем информацию о рейтинге с бейджем
        const ratingInfo = user.level?.ratingInfo || { value: 'Не указан', badge: 'basic', level: 'Неизвестный' };
        // Формируем значок спорта
        const sportEmoji = user.sport?.emoji || '🎾';
        const sportTitle = user.sport?.title || 'Не указан';
        // Формирование бейджа NTRP
        let levelBadge = '';
        switch (ratingInfo.badge) {
            case 'beginner':
                levelBadge = '🔰';
                break;
            case 'intermediate':
                levelBadge = '🔷';
                break;
            case 'advanced':
                levelBadge = '🔶';
                break;
            case 'expert':
                levelBadge = '💎';
                break;
            case 'pro':
                levelBadge = '🏆';
                break;
            default:
                levelBadge = '⚪️';
        }
        // Форматируем сообщение с улучшенным отображением
        return `👤 Профиль ${user.firstName} ${user.lastName || ''}

${sportEmoji} Вид спорта: ${sportTitle}
${levelBadge} NTRP рейтинг: ${ratingInfo.value} (${ratingInfo.level})
⚡️ Очки силы: ${user.rating?.points || 0}
⭐️ Очки активности: ${user.rating?.ranking || 0}

🏙️ Город: ${user.city || 'Не указан'}
👋 Рука: ${user.playingStyle?.dominantHand === 'RIGHT' ? 'Правая' : 'Левая'}
🏆 Турниров выиграно: ${user.statistics?.tournamentsWon || 0}

📊 Статистика:
📈 Матчей сыграно: ${user.statistics?.matchesPlayed || 0}
🥇 Побед: ${user.statistics?.matchWins || 0}
🥈 Поражений: ${user.statistics?.matchLosses || 0}
📊 Процент побед: ${user.statistics?.winRate || 0}%
`;
    }
    async handleProfileCommand(ctx) {
        try {
            if (!ctx.from)
                return;
            // Получаем userId из контекста
            const userId = ctx.from.id.toString();
            // Получаем данные пользователя
            const user = await this.usersService.getUserFullProfile(userId);
            // Используем обновленный метод форматирования 
            const message = await this.formatProfileMessage(user);
            // Кнопки
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('✏️ Редактировать профиль', 'edit_profile')],
                [telegraf_1.Markup.button.callback('🥇 Достижения', 'achievements')],
                [telegraf_1.Markup.button.callback('📊 Рейтинг', 'rating')],
                [telegraf_1.Markup.button.callback('🔙 Назад', 'main_menu')]
            ]);
            // Отправляем сообщение с новым форматированием
            await ctx.reply(message, {
                ...keyboard,
                parse_mode: 'Markdown'
            });
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Ошибка при получении профиля: ${error.message}`, error.stack);
            }
            else {
                this.logger.error(`Ошибка при получении профиля: ${error}`);
            }
            await ctx.reply('Произошла ошибка при загрузке профиля. Попробуйте позже.');
        }
    }
};
exports.ProfileHandler = ProfileHandler;
__decorate([
    (0, nestjs_telegraf_1.Hears)('👤 Профиль'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], ProfileHandler.prototype, "handleProfile", null);
exports.ProfileHandler = ProfileHandler = ProfileHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_service_1.StateService,
        keyboard_service_1.KeyboardService,
        users_service_1.UsersService,
        ratings_service_1.RatingsService,
        balls_service_1.BallsService,
        prisma_service_1.PrismaService])
], ProfileHandler);
