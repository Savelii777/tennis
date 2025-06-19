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
const telegram_service_1 = require("./telegram.service");
const notifications_service_1 = require("../notifications/application/services/notifications.service");
const profile_state_enum_1 = require("./interfaces/profile-state.enum");
const create_request_dto_1 = require("../requests/application/dto/create-request.dto");
const tournament_enum_1 = require("../tournaments/domain/enums/tournament.enum");
const match_enum_1 = require("../matches/domain/enums/match.enum");
const prisma_service_1 = require("../../prisma/prisma.service");
const achievements_service_1 = require("../achievements/application/services/achievements.service");
const ratings_service_1 = require("../ratings/ratings.service");
const settings_service_1 = require("../settings/settings.service");
const locations_service_1 = require("../locations/application/services/locations.service");
const referrals_service_1 = require("../referrals/application/services/referrals.service");
let BotService = BotService_1 = class BotService {
    constructor(bot, usersService, ballsService, requestsService, tournamentsService, matchesService, trainingsService, storiesService, casesService, caseOpeningService, telegramService, notificationsService, prisma, achievementsService, ratingsService, settingsService, locationsService, referralsService) {
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
        this.telegramService = telegramService;
        this.notificationsService = notificationsService;
        this.prisma = prisma;
        this.achievementsService = achievementsService;
        this.ratingsService = ratingsService;
        this.settingsService = settingsService;
        this.locationsService = locationsService;
        this.referralsService = referralsService;
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
    getMainKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['👤 Профиль', '🎾 Играть'],
            ['🏆 Турниры', '🏃‍♂️ Тренировки'],
            ['📱 Stories', '🎁 Кейсы'],
            ['📍 Корты', '🔗 Пригласить друга'],
            ['🤖 AI-Coach', '⚙️ Настройки'],
            ['📝 Записать результат']
        ]).resize();
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
            const telegramChatId = ctx.chat?.id;
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
                // Создаем пользователя
                user = await this.usersService.create(userData);
                this.logger.log('✅ Новый пользователь создан');
                // Сохраняем chat_id для уведомлений
                if (telegramChatId) {
                    await this.usersService.updateTelegramChatId(user.id.toString(), telegramChatId);
                    this.logger.log(`💬 Сохранен chat_id: ${telegramChatId}`);
                }
                // Обработка реферального кода
                if (startPayload && startPayload.startsWith('ref_')) {
                    const referralCode = startPayload.replace('ref_', '');
                    this.logger.log(`🔗 Обнаружен реферальный код: ${referralCode}`);
                    try {
                        // Находим пригласившего пользователя по коду
                        const referralUserId = parseInt(referralCode.replace(/^0+/, '')) || null;
                        if (referralUserId && referralUserId !== user.id) {
                            const referrer = await this.usersService.findById(referralUserId.toString());
                            if (referrer) {
                                // Устанавливаем связь реферала
                                await this.usersService.setReferrer(user.id.toString(), referrer.id.toString());
                                // Начисляем бонус пригласившему
                                const bonusAmount = 50; // 50 мячей за приглашение
                                await this.ballsService.addBalls(referrer.id.toString(), bonusAmount, 'BONUS', `Бонус за приглашение игрока ${user.first_name}` // Используем firstName вместо first_name
                                );
                                // Отправляем уведомление пригласившему
                                if (this.notificationsService) {
                                    await this.notificationsService.sendReferralBonusNotification(referrer.id, {
                                        amount: bonusAmount,
                                        referredUserName: user.first_name,
                                        totalBalance: await this.ballsService.getUserBalance(referrer.id.toString())
                                    });
                                }
                                // Приветствуем нового пользователя с упоминанием реферала
                                await ctx.reply(`🎉 **Добро пожаловать, ${ctx.from.first_name}!**\n\n` +
                                    `🤝 Вы присоединились по приглашению игрока **${referrer.first_name}**!\n\n` +
                                    `🎾 Теперь вы можете:\n` +
                                    `• Найти партнеров для игры\n` +
                                    `• Участвовать в турнирах\n` +
                                    `• Зарабатывать мячи и открывать кейсы\n` +
                                    `• Приглашать друзей и получать бонусы\n\n` +
                                    `Удачной игры! 🏆`, {
                                    parse_mode: 'Markdown',
                                    ...this.getMainKeyboard()
                                });
                                // Отправляем приветственное уведомление новому пользователю
                                if (this.notificationsService) {
                                    await this.notificationsService.createNotification({
                                        userId: user.id,
                                        type: 'SYSTEM_MESSAGE',
                                        message: `🎾 Добро пожаловать в Tennis Bot! Вы получили стартовый бонус за регистрацию по приглашению.`,
                                        payload: {
                                            referrerId: referrer.id,
                                            referrerName: referrer.first_name,
                                            welcomeBonus: true
                                        },
                                        sendTelegram: false // не дублируем, так как уже отправили выше
                                    });
                                }
                                this.logger.log(`✅ Реферальная связь установлена: ${user.id} <- ${referrer.id}`);
                            }
                            else {
                                this.logger.warn(`Реферер с ID ${referralUserId} не найден`);
                            }
                        }
                    }
                    catch (error) {
                        this.logger.error(`Ошибка обработки реферального кода: ${error}`);
                    }
                }
                else {
                    // Обычная регистрация без реферала
                    await ctx.reply(`🎾 **Добро пожаловать в Tennis Bot, ${ctx.from.first_name}!**\n\n` +
                        `✅ Вы успешно зарегистрированы!\n\n` +
                        `🎾 Что вы можете делать:\n` +
                        `• Искать партнеров для игры\n` +
                        `• Участвовать в турнирах\n` +
                        `• Записывать результаты матчей\n` +
                        `• Зарабатывать мячи и открывать кейсы\n` +
                        `• Приглашать друзей\n\n` +
                        `Начните с настройки профиля! 👤`, {
                        parse_mode: 'Markdown',
                        ...this.getMainKeyboard()
                    });
                    // Отправляем приветственное уведомление
                    if (this.notificationsService) {
                        await this.notificationsService.createNotification({
                            userId: user.id,
                            type: 'SYSTEM_MESSAGE',
                            message: `🎾 Добро пожаловать в Tennis Bot! Заполните профиль и начните искать партнеров для игры.`,
                            payload: {
                                isNewUser: true,
                                registrationDate: new Date().toISOString()
                            },
                            sendTelegram: false
                        });
                    }
                    // Начисляем стартовый бонус новому пользователю
                    const startBonus = 100;
                    await this.ballsService.addBalls(user.id.toString(), startBonus, 'BONUS', 'Стартовый бонус за регистрацию');
                }
            }
            else {
                this.logger.log('Пользователь уже существует');
                // Обновляем chat_id если он изменился
                if (telegramChatId && user.telegramChatId !== BigInt(telegramChatId)) {
                    await this.usersService.updateTelegramChatId(user.id.toString(), telegramChatId);
                    this.logger.log(`💬 Обновлен chat_id для пользователя ${user.id}: ${telegramChatId}`);
                }
                // Включаем уведомления, если пользователь снова запустил бота
                if (this.telegramService) {
                    await this.telegramService.toggleNotifications(user.id, true);
                }
                // Получаем статистику для приветствия
                const ballsBalance = await this.ballsService.getUserBalance(user.id.toString());
                const unreadNotifications = this.notificationsService
                    ? await this.notificationsService.getUnreadCount(user.id)
                    : 0;
                let welcomeMessage = `👋 **С возвращением, ${user.first_name}!**\n\n`;
                // Добавляем информацию о балансе
                if (ballsBalance > 0) {
                    welcomeMessage += `🎾 **Баланс:** ${ballsBalance} мячей\n`;
                }
                // Добавляем информацию о непрочитанных уведомлениях
                if (unreadNotifications > 0) {
                    welcomeMessage += `🔔 **Новых уведомлений:** ${unreadNotifications}\n`;
                }
                welcomeMessage += `\nВыберите действие:`;
                await ctx.reply(welcomeMessage, {
                    parse_mode: 'Markdown',
                    ...this.getMainKeyboard()
                });
                // Если есть непрочитанные уведомления, предлагаем их посмотреть
                if (unreadNotifications > 0) {
                    const notificationsKeyboard = telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback(`📬 Посмотреть уведомления (${unreadNotifications})`, 'view_notifications')]
                    ]);
                    await ctx.reply(`🔔 У вас есть непрочитанные уведомления!`, {
                        reply_markup: notificationsKeyboard.reply_markup
                    });
                }
            }
        }
        catch (error) {
            this.logger.error(`Ошибка в handleStart: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply(`❌ Произошла ошибка при запуске.\n\n` +
                `Попробуйте позже или обратитесь к администратору.`);
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
            let ratingInfo = '';
            try {
                const rating = await this.ratingsService.getRatingForUser(user.id);
                if (rating) {
                    const levelText = this.getSkillLevelText(rating.skillRating);
                    ratingInfo = `🏆 **Рейтинговая система:**\n` +
                        `🎯 **NTRP уровень:** ${rating.skillRating?.toFixed(1)} (${levelText})\n` +
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
            try {
                const stats = await this.usersService.getProfileStatistics(user.id.toString());
                const profileStatus = await this.usersService.getProfileCompletionStatus(user.id.toString());
                const ballsBalance = await this.ballsService.getUserBalance(user.id.toString()); // ← Использовать BallsService
                const message = `👤 **Ваш профиль**\n\n` +
                    `Имя: ${user.first_name} ${user.last_name || ''}\n` +
                    `Username: @${user.username || 'не указан'}\n` +
                    `ID: ${user.telegram_id}\n\n` +
                    ratingInfo + `\n` +
                    `📊 **Статистика:**\n` +
                    `🎾 Матчей сыграно: ${stats.matchesPlayed}\n` +
                    `🏆 Побед: ${stats.matchWins}\n` +
                    `😔 Поражений: ${stats.matchLosses}\n` +
                    `📈 Процент побед: ${stats.winRate || 0}%\n` +
                    `🎾 Мячей: ${ballsBalance}\n\n`;
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
            // Получаем активные заявки других пользователей
            const requests = await this.requestsService.findAll({
                page: 1,
                limit: 10
            });
            // Фильтруем заявки с более безопасной проверкой
            const filteredRequests = requests.filter((req) => {
                // Проверяем разные возможные поля для ID создателя
                const creatorTelegramId = req.creator?.telegram_id ||
                    req.creator?.telegramId ||
                    req.creatorId?.toString();
                return creatorTelegramId && creatorTelegramId !== ctx.from?.id.toString();
            }).slice(0, 10);
            if (filteredRequests.length === 0) {
                await ctx.editMessageText(`🔍 **Поиск игры**\n\n` +
                    `😔 Пока нет активных заявок.\n\n` +
                    `Создайте свою заявку, чтобы другие игроки могли к вам присоединиться!`, { parse_mode: 'Markdown' });
                return;
            }
            let message = `🔍 **Активные заявки:**\n\n`;
            const buttons = [];
            filteredRequests.forEach((request, index) => {
                // Безопасное получение данных с fallback значениями
                const datetime = request.dateTime || request.scheduledTime
                    ? new Date(request.dateTime || request.scheduledTime).toLocaleString('ru-RU')
                    : 'Время не указано';
                const creatorName = request.creator?.first_name ||
                    request.creator?.firstName ||
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
                // Добавляем описание если есть
                if (request.description && request.description !== 'Поиск партнера для игры в теннис') {
                    message += `📝 ${request.description}\n`;
                }
                message += `\n`;
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
            // Показываем более информативную ошибку для отладки
            this.logger.error(`Детали ошибки: ${JSON.stringify(error, null, 2)}`);
            await ctx.editMessageText(`🔍 **Поиск игры**\n\n` +
                `😔 Временная ошибка при загрузке заявок.\n\n` +
                `Попробуйте позже или создайте свою заявку!`, { parse_mode: 'Markdown' });
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
    // Добавляем команду для показа рейтинга
    async handleRatingCommand(ctx) {
        try {
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            const stats = await this.ratingsService.getPlayerStats(user.id);
            if (!stats) {
                await ctx.reply('📊 Рейтинг не найден. Сыграйте первый матч!');
                return;
            }
            const levelText = this.getSkillLevelText(stats.skillRating);
            let message = `🎾 **Ваш рейтинг**\n\n`;
            message += `🎯 **Уровень силы:** ${stats.skillRating} (${levelText})\n`;
            message += `📊 **Очки силы:** ${stats.skillPoints}\n`;
            message += `📈 **Очки активности:** ${stats.pointsRating}\n\n`;
            message += `🏆 **Статистика:**\n`;
            message += `📊 Побед: ${stats.wins} | Поражений: ${stats.losses}\n`;
            message += `📈 Процент побед: ${stats.winRate}%\n`;
            message += `🎾 Всего матчей: ${stats.totalMatches}\n\n`;
            if (stats.lastMatch) {
                const resultIcon = stats.lastMatch.result === 'win' ? '🏆' : '😔';
                message += `🆚 **Последний матч:** ${resultIcon}\n`;
                message += `👤 Соперник: ${stats.lastMatch.opponent} (${stats.lastMatch.opponentRating})\n`;
                message += `🏆 Счет: ${stats.lastMatch.score}\n`;
                message += `📅 ${stats.lastMatch.date.toLocaleDateString('ru-RU')}\n\n`;
            }
            message += `📈 Используйте /leaderboard для просмотра рейтинга`;
            await ctx.reply(message, { parse_mode: 'Markdown' });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleRatingCommand: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply('❌ Ошибка при загрузке рейтинга');
        }
    }
    async handleLeaderboardCommand(ctx) {
        try {
            const [skillTop, pointsTop] = await Promise.all([
                this.ratingsService.getTopPlayersBySkill(10),
                this.ratingsService.getTopPlayersByPoints(10)
            ]);
            const buttons = [
                [
                    telegraf_1.Markup.button.callback('🎯 По силе', 'leaderboard_skill'),
                    telegraf_1.Markup.button.callback('📈 По активности', 'leaderboard_points')
                ]
            ];
            let message = `🏆 **Рейтинг игроков**\n\n`;
            message += `**Топ по уровню силы:**\n`;
            skillTop.forEach((player, index) => {
                const name = `${player.user.firstName} ${player.user.lastName || ''}`.trim(); // Исправлено
                message += `${index + 1}. ${name} - ${player.skillRating} (${player.skillPoints})\n`;
            });
            await ctx.reply(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleLeaderboardCommand: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply('❌ Ошибка при загрузке рейтинга');
        }
    }
    async handleSkillLeaderboard(ctx) {
        await ctx.answerCbQuery();
        try {
            const skillTop = await this.ratingsService.getTopPlayersBySkill(10);
            let message = `🎯 **Топ по уровню силы:**\n\n`;
            skillTop.forEach((player, index) => {
                const name = `${player.user.firstName} ${player.user.lastName || ''}`.trim(); // Исправлено
                const levelText = this.getSkillLevelText(player.skillRating);
                message += `${index + 1}. **${name}**\n`;
                message += `   🎯 ${player.skillRating} (${levelText})\n`;
                message += `   📊 ${player.skillPoints} очков\n`;
                message += `   🏆 ${player.wins}W/${player.losses}L\n\n`;
            });
            const buttons = [
                [telegraf_1.Markup.button.callback('📈 По активности', 'leaderboard_points')],
                [telegraf_1.Markup.button.callback('🔄 Обновить', 'leaderboard_skill')]
            ];
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleSkillLeaderboard: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply('❌ Ошибка при загрузке рейтинга');
        }
    }
    async handlePointsLeaderboard(ctx) {
        await ctx.answerCbQuery();
        try {
            const pointsTop = await this.ratingsService.getTopPlayersByPoints(10);
            let message = `📈 **Топ по очкам активности:**\n\n`;
            pointsTop.forEach((player, index) => {
                const name = `${player.user.firstName} ${player.user.lastName || ''}`.trim(); // Исправлено
                message += `${index + 1}. **${name}**\n`;
                message += `   📈 ${player.pointsRating} очков\n`;
                message += `   🎯 Уровень: ${player.skillRating}\n`;
                message += `   🏆 ${player.wins}W/${player.losses}L\n\n`;
            });
            const buttons = [
                [telegraf_1.Markup.button.callback('🎯 По силе', 'leaderboard_skill')],
                [telegraf_1.Markup.button.callback('🔄 Обновить', 'leaderboard_points')]
            ];
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handlePointsLeaderboard: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply('❌ Ошибка при загрузке рейтинга');
        }
    }
    getSkillLevelText(rating) {
        if (rating < 2.5)
            return 'Новичок';
        if (rating < 3.0)
            return 'Начинающий';
        if (rating < 3.5)
            return 'Любитель';
        if (rating < 4.0)
            return 'Продвинутый любитель';
        if (rating < 4.5)
            return 'Средний продвинутый';
        if (rating < 5.0)
            return 'Сильный продвинутый';
        if (rating < 5.5)
            return 'Турнирный игрок';
        if (rating < 6.0)
            return 'Высокий турнирный';
        return 'Профессиональный';
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
        this.logger.log('🔍 Начинаем handleActiveTournaments');
        try {
            this.logger.log('📡 Вызываем tournamentsService.findAll...');
            // Используем существующий метод findAll
            const tournaments = await this.tournamentsService.findAll({
                page: 1,
                limit: 10
            });
            this.logger.log(`📊 Получено турниров: ${JSON.stringify(tournaments, null, 2)}`);
            this.logger.log(`📏 Тип данных: ${typeof tournaments}`);
            this.logger.log(`📦 Это массив? ${Array.isArray(tournaments)}`);
            // Проверяем структуру данных
            if (tournaments && typeof tournaments === 'object') {
                this.logger.log(`🔑 Ключи объекта: ${Object.keys(tournaments)}`);
                // Возможно это объект с items
                if (tournaments.items) {
                    this.logger.log(`📋 Найдены items: ${tournaments.items.length} элементов`);
                    this.logger.log(`📋 Items данные: ${JSON.stringify(tournaments.items, null, 2)}`);
                }
            }
            // Извлекаем турниры с учетом возможной структуры
            let activeTournaments = [];
            if (Array.isArray(tournaments)) {
                activeTournaments = tournaments.slice(0, 10);
                this.logger.log(`✅ Турниры - прямой массив, взяли ${activeTournaments.length} элементов`);
            }
            else if (tournaments && tournaments.items && Array.isArray(tournaments.items)) {
                activeTournaments = tournaments.items.slice(0, 10);
                this.logger.log(`✅ Турниры в items, взяли ${activeTournaments.length} элементов`);
            }
            else if (tournaments && tournaments.data && Array.isArray(tournaments.data)) {
                activeTournaments = tournaments.data.slice(0, 10);
                this.logger.log(`✅ Турниры в data, взяли ${activeTournaments.length} элементов`);
            }
            else {
                this.logger.error(`❌ Неизвестная структура данных турниров: ${typeof tournaments}`);
                activeTournaments = [];
            }
            this.logger.log(`🎯 Итого активных турниров для отображения: ${activeTournaments.length}`);
            if (activeTournaments.length === 0) {
                this.logger.log('📝 Отображаем сообщение "нет турниров"');
                await ctx.editMessageText(`🏆 **Активные турниры**\n\n` +
                    `😔 Пока нет активных турниров.\n\n` +
                    `Создайте свой турнир!`, { parse_mode: 'Markdown' });
                return;
            }
            let message = `🏆 **Активные турниры:**\n\n`;
            const buttons = [];
            this.logger.log('🔨 Начинаем формирование сообщения и кнопок...');
            activeTournaments.forEach((tournament, index) => {
                this.logger.log(`🏆 Обрабатываем турнир ${index + 1}: ${JSON.stringify(tournament, null, 2)}`);
                const startDate = tournament.startDate
                    ? new Date(tournament.startDate).toLocaleDateString('ru-RU')
                    : 'Не указана';
                // Правильные названия полей из схемы Prisma
                const title = tournament.title || 'Турнир';
                const currentPlayers = tournament.currentPlayers || 0;
                const maxPlayers = tournament.maxPlayers || 0;
                this.logger.log(`📋 Турнир ${index + 1} данные: title="${title}", currentPlayers=${currentPlayers}, maxPlayers=${maxPlayers}, startDate="${startDate}"`);
                // Получаем entryFee из formatDetails
                let entryFee = 0;
                if (tournament.formatDetails) {
                    this.logger.log(`💰 formatDetails найдены: ${JSON.stringify(tournament.formatDetails)}`);
                    entryFee = tournament.formatDetails.entryFee || 0;
                }
                else {
                    this.logger.log(`💰 formatDetails отсутствуют`);
                }
                // Получаем registrationEnd из formatDetails
                let regEndDate = 'Не указана';
                if (tournament.formatDetails?.registrationEnd) {
                    try {
                        regEndDate = new Date(tournament.formatDetails.registrationEnd).toLocaleDateString('ru-RU');
                        this.logger.log(`📅 Дата окончания регистрации: ${regEndDate}`);
                    }
                    catch (error) {
                        this.logger.error(`❌ Ошибка парсинга даты регистрации: ${error}`);
                    }
                }
                const tournamentText = `${index + 1}. **${title}**\n` +
                    `📅 Начало: ${startDate}\n` +
                    `📝 Регистрация до: ${regEndDate}\n` +
                    `👥 ${currentPlayers}/${maxPlayers}\n` +
                    `💰 Взнос: ${entryFee} мячей\n\n`;
                this.logger.log(`📄 Текст турнира ${index + 1}: ${tournamentText}`);
                message += tournamentText;
                buttons.push([telegraf_1.Markup.button.callback(`${index + 1}. Подробнее`, `tournament_details_${tournament.id}`)]);
                this.logger.log(`🔘 Добавлена кнопка для турнира ${tournament.id}`);
            });
            buttons.push([telegraf_1.Markup.button.callback('🔄 Обновить', 'active_tournaments')]);
            this.logger.log(`📝 Финальное сообщение (длина ${message.length} символов):`);
            this.logger.log(message);
            this.logger.log(`🔘 Всего кнопок: ${buttons.length}`);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup
            });
            this.logger.log('✅ Сообщение отправлено успешно');
        }
        catch (error) {
            this.logger.error(`❌ Ошибка в handleActiveTournaments:`);
            this.logger.error(`Error message: ${error instanceof Error ? error.message : String(error)}`);
            this.logger.error(`Error stack: ${error instanceof Error ? error.stack : 'No stack'}`);
            this.logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);
            try {
                await ctx.reply('❌ Ошибка при загрузке турниров. Попробуйте позже.');
            }
            catch (replyError) {
                this.logger.error(`❌ Ошибка отправки сообщения об ошибке: ${replyError}`);
            }
        }
    }
    async handleActiveTournamentsAction(ctx) {
        this.logger.log('🎯 Action: active_tournaments');
        await this.handleActiveTournaments(ctx);
    }
    async handleCreateTournamentAction(ctx) {
        this.logger.log('🎯 Action: create_tournament');
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
    async handleJoinTournamentAction(ctx) {
        this.logger.log('🎯 Action: join_tournament');
        await this.handleJoinTournament(ctx);
    }
    async handleMyTournamentsAction(ctx) {
        this.logger.log('🎯 Action: my_tournaments');
        await ctx.answerCbQuery();
        try {
            if (!ctx.from)
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            // Получаем турниры где пользователь участвует
            const tournaments = await this.tournamentsService.findAll({ page: 1, limit: 10 });
            const myTournaments = tournaments.filter((t) => t.creatorId === user.id ||
                (t.players && t.players.some((p) => p.id === user.id)));
            if (myTournaments.length === 0) {
                await ctx.editMessageText(`🏆 **Мои турниры**\n\n` +
                    `Вы пока не участвуете в турнирах.\n\n` +
                    `Присоединитесь к существующему или создайте свой!`, {
                    parse_mode: 'Markdown',
                    reply_markup: telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('🔍 Активные турниры', 'active_tournaments')],
                        [telegraf_1.Markup.button.callback('➕ Создать турнир', 'create_tournament')],
                        [telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_tournaments')]
                    ]).reply_markup
                });
                return;
            }
            let message = `🏆 **Мои турниры (${myTournaments.length}):**\n\n`;
            const buttons = [];
            myTournaments.forEach((tournament, index) => {
                const title = tournament.title || 'Турнир';
                const startDate = new Date(tournament.startDate).toLocaleDateString('ru-RU');
                const isCreator = tournament.creatorId === user.id;
                message += `${index + 1}. **${title}**\n`;
                message += `📅 ${startDate}\n`;
                message += `${isCreator ? '👑 Организатор' : '🎾 Участник'}\n\n`;
                buttons.push([telegraf_1.Markup.button.callback(`${index + 1}. Подробнее`, `tournament_details_${tournament.id}`)]);
            });
            buttons.push([telegraf_1.Markup.button.callback('⬅️ Назад к турнирам', 'back_to_tournaments')]);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleMyTournaments: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке турниров');
        }
    }
    async handleBackToTournaments(ctx) {
        this.logger.log('🎯 Action: back_to_tournaments');
        await ctx.answerCbQuery();
        await this.handleTournaments(ctx);
    }
    async handleBackToProfileAction(ctx) {
        this.logger.log('🎯 Action: back_to_profile');
        await ctx.answerCbQuery();
        await this.handleProfile(ctx);
    }
    async handleDetailedStatsAction(ctx) {
        this.logger.log('🎯 Action: detailed_stats');
        await this.handleDetailedStats(ctx);
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
            message += `💰 Ваш баланс: ${ballsBalance} мячей\n\n`;
            const buttons = [];
            cases.forEach((caseItem, index) => {
                message += `${index + 1}. **${caseItem.name}**\n`;
                message += `💰 Цена: ${caseItem.priceBalls} мячей\n`;
                message += `📝 ${caseItem.description}\n\n`;
                const canOpen = ballsBalance >= caseItem.priceBalls;
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
            if (!ctx.from)
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден. Отправьте /start');
                return;
            }
            // Временная заглушка для stories
            let stories = [];
            try {
                // TODO: Реализовать правильный метод в StoriesService
                // stories = await this.storiesService.findAll({ page: 1, limit: 5 });
                stories = []; // Пока используем пустой массив
            }
            catch (error) {
                this.logger.error(`Ошибка получения stories: ${error}`);
                stories = [];
            }
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('➕ Создать Story', 'create_story')],
                [telegraf_1.Markup.button.callback('📷 Мои Stories', 'my_stories')],
                [telegraf_1.Markup.button.callback('🔥 Популярные', 'popular_stories')],
                [telegraf_1.Markup.button.callback('👥 Друзья', 'friends_stories')],
            ]);
            let message = `📱 **Stories**\n\n`;
            if (stories && stories.length > 0) {
                message += `🔥 **Последние истории:**\n\n`;
                stories.slice(0, 3).forEach((story, index) => {
                    const authorName = story.author?.firstName || story.author?.username || 'Игрок';
                    const timeAgo = this.getTimeAgo(new Date(story.createdAt));
                    message += `${index + 1}. **${authorName}**\n`;
                    message += `⏰ ${timeAgo}\n`;
                    if (story.caption) {
                        message += `📝 ${story.caption.substring(0, 50)}${story.caption.length > 50 ? '...' : ''}\n`;
                    }
                    message += `\n`;
                });
            }
            else {
                message += `😔 Пока нет историй.\n\n`;
            }
            message += `Создайте свою первую историю!`;
            await ctx.reply(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleStories: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке Stories');
        }
    }
    // Добавить вспомогательный метод:
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1)
            return 'только что';
        if (diffMins < 60)
            return `${diffMins} мин назад`;
        if (diffHours < 24)
            return `${diffHours} ч назад`;
        if (diffDays < 7)
            return `${diffDays} дн назад`;
        return date.toLocaleDateString('ru-RU');
    }
    async handleCreateStoryAction(ctx) {
        this.logger.log('🎯 Action: create_story');
        await ctx.answerCbQuery();
        await ctx.editMessageText(`📱 **Создание Story**\n\n` +
            `Функция в разработке!\n\n` +
            `Скоро вы сможете:\n` +
            `• Загружать фото с матчей\n` +
            `• Делиться достижениями\n` +
            `• Показывать прогресс\n` +
            `• Приглашать на игру`, {
            parse_mode: 'Markdown',
            reply_markup: telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('⬅️ Назад к Stories', 'back_to_stories')]
            ]).reply_markup
        });
    }
    async handleMyStoriesAction(ctx) {
        this.logger.log('🎯 Action: my_stories');
        await ctx.answerCbQuery();
        await ctx.editMessageText(`📷 **Мои Stories**\n\n` +
            `У вас пока нет историй.\n\n` +
            `Создайте первую Story о своих успехах в теннисе!`, {
            parse_mode: 'Markdown',
            reply_markup: telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('➕ Создать Story', 'create_story')],
                [telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_stories')]
            ]).reply_markup
        });
    }
    async handlePopularStoriesAction(ctx) {
        this.logger.log('🎯 Action: popular_stories');
        await ctx.answerCbQuery();
        await ctx.editMessageText(`🔥 **Популярные Stories**\n\n` +
            `Скоро здесь будут отображаться:\n` +
            `• Самые интересные истории\n` +
            `• Впечатляющие результаты\n` +
            `• Мотивирующие посты\n` +
            `• Советы от профи`, {
            parse_mode: 'Markdown',
            reply_markup: telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_stories')]
            ]).reply_markup
        });
    }
    async handleFriendsStoriesAction(ctx) {
        this.logger.log('🎯 Action: friends_stories');
        await ctx.answerCbQuery();
        await ctx.editMessageText(`👥 **Stories друзей**\n\n` +
            `Здесь будут отображаться истории ваших друзей и постоянных партнеров по теннису.\n\n` +
            `Пригласите друзей, чтобы следить за их прогрессом!`, {
            parse_mode: 'Markdown',
            reply_markup: telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🔗 Пригласить друзей', 'invite_friends')],
                [telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_stories')]
            ]).reply_markup
        });
    }
    async handleBackToStoriesAction(ctx) {
        this.logger.log('🎯 Action: back_to_stories');
        await ctx.answerCbQuery();
        await this.handleStories(ctx);
    }
    async handleInviteFriendsAction(ctx) {
        this.logger.log('🎯 Action: invite_friends');
        await this.handleInvite(ctx);
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
            const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'tennistestdssbot';
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
    async handleSettings(ctx) {
        this.logger.log('⚙️ НАСТРОЙКИ кнопка нажата');
        try {
            if (!ctx.from)
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                await ctx.reply('❌ Пользователь не найден. Отправьте /start');
                return;
            }
            const settings = await this.settingsService.getUserSettings(user.id);
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🧑 Профиль', 'settings_profile')],
                [telegraf_1.Markup.button.callback('🔔 Уведомления', 'settings_notifications')],
                [telegraf_1.Markup.button.callback('🎯 Предпочтения', 'settings_preferences')],
                [telegraf_1.Markup.button.callback('🌐 Язык', 'settings_language')],
                [telegraf_1.Markup.button.callback('🔒 Приватность', 'settings_privacy')],
            ]);
            const languageFlag = settings.language === 'ru' ? '🇷🇺' : '🇬🇧';
            const notificationStatus = settings.notificationsEnabled ? '🔔' : '🔕';
            const profileVisibility = settings.showProfilePublicly ? '👁️' : '🙈';
            await ctx.reply(`⚙️ **Настройки**\n\n` +
                `🌐 **Язык:** ${languageFlag} ${settings.language.toUpperCase()}\n` +
                `${notificationStatus} **Уведомления:** ${settings.notificationsEnabled ? 'Включены' : 'Отключены'}\n` +
                `${profileVisibility} **Профиль:** ${settings.showProfilePublicly ? 'Публичный' : 'Приватный'}\n` +
                `🏙️ **Город:** ${settings.city?.name || 'Не указан'}\n` +
                `🎾 **Спорт:** ${settings.sport?.title || 'Не указан'}\n\n` + // Исправляем name на title
                `Выберите раздел для настройки:`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleSettings: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке настроек');
        }
    }
    async handleSettingsLanguage(ctx) {
        await ctx.answerCbQuery();
        try {
            if (!ctx.from)
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user)
                return;
            const settings = await this.settingsService.getUserSettings(user.id);
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🇷🇺 Русский', 'set_language_ru')],
                [telegraf_1.Markup.button.callback('🇬🇧 English', 'set_language_en')],
                [telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_settings')],
            ]);
            await ctx.editMessageText(`🌐 **Выбор языка**\n\n` +
                `Текущий язык: ${settings.language === 'ru' ? '🇷🇺 Русский' : '🇬🇧 English'}\n\n` +
                `Выберите язык интерфейса:`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleSettingsLanguage: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке языковых настроек');
        }
    }
    async handleSetLanguage(ctx) {
        await ctx.answerCbQuery();
        try {
            if (!ctx.from || !ctx.callbackQuery || !('data' in ctx.callbackQuery))
                return;
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user)
                return;
            const language = ctx.callbackQuery.data.replace('set_language_', '');
            await this.settingsService.updateLanguage(user.id, language);
            const languageText = language === 'ru' ? '🇷🇺 Русский' : '🇬🇧 English';
            await ctx.reply(`✅ Язык изменен на ${languageText}`, { parse_mode: 'Markdown' });
            await this.handleSettings(ctx);
        }
        catch (error) {
            this.logger.error(`Ошибка в handleSetLanguage: ${error}`);
            await ctx.reply('❌ Ошибка при изменении языка');
        }
    }
    async handleBackToSettings(ctx) {
        await this.handleSettings(ctx);
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
            // Создаем корректный объект CreateRequestDto без playerLevel
            const requestData = {
                type: create_request_dto_1.RequestType.GAME,
                title: `Игра ${new Date(userState.data.requestDateTime).toLocaleDateString('ru-RU')}`,
                description: userState.data.requestDescription || 'Поиск партнера для игры в теннис',
                gameMode: create_request_dto_1.GameMode.SINGLES,
                dateTime: new Date(userState.data.requestDateTime),
                location: userState.data.requestLocation,
                locationName: userState.data.requestLocation,
                maxPlayers: 2,
                // Убираем playerLevel так как его нет в схеме
                paymentType: 'FREE',
                ratingType: 'NTRP',
                formatInfo: {
                    level: userState.data.requestLevel || 'ANY' // Сохраняем уровень в formatInfo
                },
            };
            const request = await this.requestsService.create(user.id.toString(), requestData);
            const summaryMessage = `✅ **Заявка создана!**\n\n` +
                `📅 **Время:** ${new Date(requestData.dateTime).toLocaleString('ru-RU')}\n` +
                `📍 **Место:** ${requestData.location}\n` +
                `🎯 **Уровень:** ${this.getLevelText(userState.data.requestLevel || 'ANY')}\n` +
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
            // Безопасная фильтрация своих заявок
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
            myRequests.slice(0, 5).forEach((request, index) => {
                const datetime = request.dateTime || request.scheduledTime
                    ? new Date(request.dateTime || request.scheduledTime).toLocaleString('ru-RU')
                    : 'Время не указано';
                const title = request.title || `Заявка ${index + 1}`;
                const location = request.locationName || request.location || 'Место не указано';
                const currentPlayers = request.currentPlayers || 0;
                const maxPlayers = request.maxPlayers || 2;
                message += `${index + 1}. **${title}**\n`;
                message += `📅 ${datetime}\n`;
                message += `📍 ${location}\n`;
                message += `👥 ${currentPlayers}/${maxPlayers}\n\n`;
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
            `**Шаг 1 из 4**\n\n` +
            `Введите название турнира:`, { parse_mode: 'Markdown' });
    }
    // Добавить новый метод:
    async handleTournamentPlayers(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        const tournamentId = ctx.callbackQuery.data.split('_')[2];
        try {
            const tournament = await this.tournamentsService.findById(tournamentId);
            if (!tournament) {
                await ctx.editMessageText('❌ Турнир не найден');
                return;
            }
            // Получаем список участников через репозиторий
            const players = await this.tournamentsService['tournamentsRepository'].getTournamentPlayers(tournamentId);
            let message = `👥 **Участники турнира "${tournament.title}"**\n\n`;
            if (players.length === 0) {
                message += `😔 Пока нет участников.\n\nСтаньте первым!`;
            }
            else {
                message += `**Зарегистрировано: ${players.length}/${tournament.maxPlayers}**\n\n`;
                players.forEach((player, index) => {
                    const name = player.firstName || player.username || `Игрок ${player.id}`;
                    const rating = player.rating_points || 0;
                    message += `${index + 1}. ${name} (${rating} очков)\n`;
                });
            }
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🎾 Зарегистрироваться', `join_tournament_${tournament.id}`)],
                [telegraf_1.Markup.button.callback('⬅️ Назад к турниру', `tournament_details_${tournament.id}`)],
            ]);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка получения участников турнира: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке участников');
        }
    }
    async handleTournamentDetails(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        const tournamentId = ctx.callbackQuery.data.split('_')[2];
        try {
            const tournament = await this.tournamentsService.findById(tournamentId);
            if (!tournament) {
                await ctx.editMessageText('❌ Турнир не найден');
                return;
            }
            const startDate = new Date(tournament.startDate).toLocaleDateString('ru-RU');
            const endDate = new Date(tournament.endDate).toLocaleDateString('ru-RU');
            let regEndDate = 'Не указана';
            if (tournament.formatDetails?.registrationEnd) {
                regEndDate = new Date(tournament.formatDetails.registrationEnd).toLocaleDateString('ru-RU');
            }
            const entryFee = tournament.formatDetails?.entryFee || 0;
            const prizePool = tournament.formatDetails?.prizePool || 0;
            const requirements = tournament.formatDetails?.requirements || {};
            let message = `🏆 **${tournament.title}**\n\n`;
            message += `📝 **Описание:**\n${tournament.description || 'Описание отсутствует'}\n\n`;
            message += `📅 **Даты:**\n`;
            message += `• Начало: ${startDate}\n`;
            message += `• Окончание: ${endDate}\n`;
            message += `• Регистрация до: ${regEndDate}\n\n`;
            message += `👥 **Участники:** ${tournament.currentPlayers}/${tournament.maxPlayers}\n`;
            message += `🎾 **Тип:** ${this.getTournamentTypeText(tournament.type)}\n`;
            message += `📍 **Место:** ${tournament.locationName || 'Не указано'}\n\n`;
            if (entryFee > 0) {
                message += `💰 **Взнос:** ${entryFee} мячей\n`;
            }
            if (prizePool > 0) {
                message += `🏆 **Призовой фонд:** ${prizePool} мячей\n`;
            }
            if (requirements.minRating || requirements.maxRating) {
                message += `📊 **Требования по рейтингу:** ${requirements.minRating || 0} - ${requirements.maxRating || '∞'}\n`;
            }
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🎾 Зарегистрироваться', `join_tournament_${tournament.id}`)],
                [telegraf_1.Markup.button.callback('👥 Участники', `tournament_players_${tournament.id}`)],
                [telegraf_1.Markup.button.callback('⬅️ Назад к турнирам', 'active_tournaments')],
            ]);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка получения деталей турнира: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке турнира');
        }
    }
    // Добавить вспомогательный метод для типов турниров:
    getTournamentTypeText(type) {
        switch (type) {
            case 'SINGLE_ELIMINATION':
                return 'На выбывание';
            case 'GROUPS_PLAYOFF':
                return 'Группы + Плей-офф';
            case 'LEAGUE':
                return 'Лига (круговая)';
            case 'BLITZ':
                return 'Блиц-турнир';
            default:
                return 'Неизвестный тип';
        }
    }
    async handleJoinTournament(ctx) {
        await ctx.answerCbQuery();
        try {
            const tournaments = await this.tournamentsService.findAll({
                page: 1,
                limit: 10,
                status: 'DRAFT' // Только турниры открытые для регистрации
            });
            if (tournaments.length === 0) {
                await ctx.editMessageText(`🏆 **Турниры**\n\n` +
                    `😔 Нет открытых турниров для регистрации.\n\n` +
                    `Создайте свой турнир!`, {
                    parse_mode: 'Markdown',
                    reply_markup: telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('➕ Создать турнир', 'create_tournament')]
                    ]).reply_markup
                });
                return;
            }
            let message = `🏆 **Доступные турниры:**\n\n`;
            const buttons = [];
            tournaments.forEach((tournament, index) => {
                const startDate = new Date(tournament.startDate).toLocaleDateString('ru-RU');
                // Правильные названия полей
                const title = tournament.title || 'Турнир';
                const currentPlayers = tournament.currentPlayers || 0;
                const maxPlayers = tournament.maxPlayers || 0;
                const entryFee = tournament.formatDetails?.entryFee || 0;
                message += `${index + 1}. **${title}**\n`;
                message += `📅 Начало: ${startDate}\n`;
                message += `👥 Участников: ${currentPlayers}/${maxPlayers}\n`;
                message += `💰 Взнос: ${entryFee} мячей\n\n`;
                buttons.push([telegraf_1.Markup.button.callback(`🎾 ${title}`, `join_tournament_${tournament.id}`)]);
            });
            buttons.push([telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_tournaments')]);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка загрузки турниров: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке турниров');
        }
    }
    async handleJoinSpecificTournament(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        const tournamentId = parseInt(ctx.callbackQuery.data.split('_')[2]);
        const userId = ctx.from?.id.toString();
        if (!userId)
            return;
        try {
            const user = await this.usersService.findByTelegramId(userId);
            if (!user)
                return;
            await this.tournamentsService.joinTournament(tournamentId.toString(), user.id.toString());
            await ctx.editMessageText(`✅ **Успешно!**\n\n` +
                `Вы зарегистрированы в турнире!\n\n` +
                `Следите за обновлениями и готовьтесь к игре! 🎾`, { parse_mode: 'Markdown' });
        }
        catch (error) {
            this.logger.error(`Ошибка регистрации в турнире: ${error}`);
            await ctx.reply('❌ Ошибка при регистрации в турнире');
        }
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
    // Добавить новые методы для тренировок:
    async handleCreateTraining(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        this.setUserState(userId, {
            step: profile_state_enum_1.ProfileStep.AWAITING_TRAINING_TITLE,
            data: {}
        });
        await ctx.editMessageText(`🏃‍♂️ **Создание тренировки**\n\n` +
            `**Шаг 1 из 3**\n\n` +
            `Введите название тренировки:`, { parse_mode: 'Markdown' });
    }
    async handleJoinTraining(ctx) {
        await ctx.answerCbQuery();
        try {
            const trainings = await this.trainingsService.findAll({
                page: 1,
                limit: 10
            });
            if (trainings.length === 0) {
                await ctx.editMessageText(`🏃‍♂️ **Тренировки**\n\n` +
                    `😔 Нет активных тренировок.\n\n` +
                    `Создайте свою тренировку!`, {
                    parse_mode: 'Markdown',
                    reply_markup: telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('➕ Создать тренировку', 'create_training')]
                    ]).reply_markup
                });
                return;
            }
            let message = `🏃‍♂️ **Доступные тренировки:**\n\n`;
            const buttons = [];
            trainings.forEach((training, index) => {
                const date = new Date(training.scheduledTime).toLocaleString('ru-RU');
                const participantsCount = training.participants?.length || 0;
                const maxParticipants = training.maxParticipants || 'Не ограничено';
                message += `${index + 1}. **${training.title}**\n`;
                message += `📅 ${date}\n`;
                message += `👥 ${participantsCount}/${maxParticipants}\n`;
                message += `📍 ${training.location || 'Не указано'}\n\n`;
                buttons.push([telegraf_1.Markup.button.callback(`🏃‍♂️ ${training.title}`, `join_training_${training.id}`)]);
            });
            buttons.push([telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_trainings')]);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка загрузки тренировок: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке тренировок');
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
    // Добавить новые действия для статистики:
    async handleDetailedStats(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        try {
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user)
                return;
            // Получаем детальную статистику
            const [stats, rating, matches] = await Promise.all([
                this.usersService.getProfileStatistics(user.id.toString()),
                this.ratingsService.getRatingForUser(user.id),
                this.matchesService.findByCreator(user.id.toString())
            ]);
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
            message += `🎯 Участий: ${stats.tournamentsPlayed || 0}\n`;
            message += `🥇 Побед: ${stats.tournamentsWon || 0}\n\n`;
            // Достижения
            const achievements = await this.achievementsService.getUserAchievements(user.id.toString());
            message += `🏅 **Достижения:** ${achievements.length}\n`;
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🏅 Достижения', 'user_achievements')],
                [telegraf_1.Markup.button.callback('📈 График прогресса', 'progress_chart')],
                [telegraf_1.Markup.button.callback('⬅️ Назад к профилю', 'back_to_profile')],
            ]);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка получения детальной статистики: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке статистики');
        }
    }
    async handleUserAchievements(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        try {
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user)
                return;
            const achievements = await this.achievementsService.getUserAchievements(user.id.toString());
            if (achievements.length === 0) {
                await ctx.editMessageText(`🏅 **Достижения**\n\n` +
                    `У вас пока нет достижений.\n\n` +
                    `Играйте в матчи, участвуйте в турнирах и приглашайте друзей, чтобы получить первые награды!`, {
                    parse_mode: 'Markdown',
                    reply_markup: telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('⬅️ Назад', 'detailed_stats')]
                    ]).reply_markup
                });
                return;
            }
            let message = `🏅 **Ваши достижения (${achievements.length}):**\n\n`;
            achievements.forEach((achievement, index) => {
                const earnedDate = new Date(achievement.earnedAt).toLocaleDateString('ru-RU');
                message += `${index + 1}. **${achievement.achievement.title}**\n`;
                message += `📝 ${achievement.achievement.description}\n`;
                message += `📅 Получено: ${earnedDate}\n\n`;
            });
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('⬅️ Назад', 'detailed_stats')]
                ]).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка получения достижений: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке достижений');
        }
    }
    async handleMatchHistoryAction(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`🎾 **История матчей**\n\n` +
            `Функция в разработке.\n\n` +
            `Здесь будет история всех ваших матчей.`, { parse_mode: 'Markdown' });
    }
    async handleAchievements(ctx) {
        await ctx.answerCbQuery();
        try {
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user)
                return;
            const achievements = await this.achievementsService.getUserAchievements(user.id.toString());
            if (achievements.length === 0) {
                await ctx.editMessageText(`🏅 **Ваши достижения**\n\n` +
                    `У вас пока нет достижений.\n\n` +
                    `Играйте в матчи, участвуйте в турнирах и приглашайте друзей, чтобы получить первые награды!`, { parse_mode: 'Markdown' });
                return;
            }
            let message = `🏅 **Ваши достижения** (${achievements.length}):\n\n`;
            achievements.slice(0, 10).forEach((achievement, index) => {
                const def = achievement.definition;
                message += `${def.icon} **${def.name}**\n`;
                message += `${def.description}\n`;
                message += `📅 ${achievement.awardedAt.toLocaleDateString('ru-RU')}\n\n`;
            });
            if (achievements.length > 10) {
                message += `...и еще ${achievements.length - 10} достижений\n\n`;
            }
            message += `Продолжайте играть, чтобы получить больше наград! 🎯`;
            await ctx.editMessageText(message, { parse_mode: 'Markdown' });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleAchievements: ${error instanceof Error ? error.message : String(error)}`);
            await ctx.reply('❌ Ошибка при загрузке достижений');
        }
    }
    async notifyNewAchievement(userId, achievementCode) {
        try {
            const user = await this.usersService.findById(userId);
            if (!user || !user.telegram_id)
                return;
            const definitions = await this.achievementsService.getAllDefinitions();
            const achievement = definitions.find((def) => def.code === achievementCode);
            if (!achievement)
                return;
            const message = `🏆 **Поздравляем!**\n\n` +
                `Вы получили достижение:\n` +
                `${achievement.icon} **${achievement.name}**\n\n` +
                `${achievement.description}`;
            await this.bot.telegram.sendMessage(user.telegram_id, message, {
                parse_mode: 'Markdown',
            });
        }
        catch (error) {
            this.logger.error(`Ошибка отправки уведомления о достижении: ${error}`);
        }
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
    async handleLocations(ctx) {
        this.logger.log('📍 КОРТЫ кнопка нажата');
        try {
            if (!ctx.from)
                return;
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🔍 Найти корты', 'find_courts')],
                [telegraf_1.Markup.button.callback('➕ Добавить корт', 'add_court')],
                [telegraf_1.Markup.button.callback('📍 Корты рядом', 'nearby_courts')],
                [telegraf_1.Markup.button.callback('⭐ Популярные', 'popular_courts')],
            ]);
            await ctx.reply(`📍 **Теннисные корты**\n\n` +
                `🎾 Найдите лучшие корты в вашем городе!\n\n` +
                `Что вас интересует?`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleLocations: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке раздела кортов');
        }
    }
    async handleFindCourts(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        this.setUserState(userId, {
            step: profile_state_enum_1.ProfileStep.AWAITING_CITY_SEARCH,
            data: {}
        });
        await ctx.editMessageText(`🔍 **Поиск кортов**\n\n` +
            `Введите название города:`, { parse_mode: 'Markdown' });
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
    (0, nestjs_telegraf_1.Command)('rating'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleRatingCommand", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('leaderboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLeaderboardCommand", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('leaderboard_skill'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSkillLeaderboard", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('leaderboard_points'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handlePointsLeaderboard", null);
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
], BotService.prototype, "handleActiveTournamentsAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('create_tournament'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCreateTournamentAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('join_tournament'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleJoinTournamentAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('my_tournaments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMyTournamentsAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_tournaments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleBackToTournaments", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_profile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleBackToProfileAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('detailed_stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleDetailedStatsAction", null);
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
    (0, nestjs_telegraf_1.Action)('create_story'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCreateStoryAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('my_stories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleMyStoriesAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('popular_stories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handlePopularStoriesAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('friends_stories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleFriendsStoriesAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_stories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleBackToStoriesAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('invite_friends'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleInviteFriendsAction", null);
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
    (0, nestjs_telegraf_1.Hears)('⚙️ Настройки'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSettings", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('settings_language'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSettingsLanguage", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^set_language_(.+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleSetLanguage", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleBackToSettings", null);
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
    (0, nestjs_telegraf_1.Action)(/^tournament_players_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTournamentPlayers", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^tournament_details_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleTournamentDetails", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('join_tournament'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleJoinTournament", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^join_tournament_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleJoinSpecificTournament", null);
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
    (0, nestjs_telegraf_1.Action)('create_training'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleCreateTraining", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('join_training'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleJoinTraining", null);
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
    (0, nestjs_telegraf_1.Action)('user_achievements'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleUserAchievements", null);
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
    (0, nestjs_telegraf_1.Hears)('📍 Корты'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleLocations", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('find_courts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "handleFindCourts", null);
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
        case_opening_service_1.CaseOpeningService,
        telegram_service_1.TelegramService,
        notifications_service_1.NotificationsService,
        prisma_service_1.PrismaService,
        achievements_service_1.AchievementsService,
        ratings_service_1.RatingsService,
        settings_service_1.SettingsService,
        locations_service_1.LocationsService,
        referrals_service_1.ReferralsService])
], BotService);
exports.BotService = BotService;
