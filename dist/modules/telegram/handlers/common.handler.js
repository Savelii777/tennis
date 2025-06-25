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
var CommonHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonHandler = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const state_service_1 = require("../services/state.service");
const keyboard_service_1 = require("../services/keyboard.service");
const users_service_1 = require("../../users/application/services/users.service");
const balls_service_1 = require("../../users/application/services/balls.service");
const notifications_service_1 = require("../../notifications/application/services/notifications.service");
const telegram_service_1 = require("../telegram.service");
const referrals_service_1 = require("../../referrals/application/services/referrals.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
let CommonHandler = CommonHandler_1 = class CommonHandler {
    constructor(stateService, keyboardService, usersService, ballsService, notificationsService, telegramService, referralsService, prisma) {
        this.stateService = stateService;
        this.keyboardService = keyboardService;
        this.usersService = usersService;
        this.ballsService = ballsService;
        this.notificationsService = notificationsService;
        this.telegramService = telegramService;
        this.referralsService = referralsService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(CommonHandler_1.name);
    }
    register(bot) {
        // Регистрируем действия
        bot.action('back_to_profile', this.handleBackToProfile.bind(this));
        bot.command('menu', this.handleMenu.bind(this));
    }
    async handleStart(ctx) {
        this.logger.log('🚀 Команда /start получена');
        if (!ctx.from) {
            this.logger.error('❌ Нет данных пользователя');
            return;
        }
        const telegramId = ctx.from.id.toString();
        let telegramChatId = ctx.chat?.id.toString();
        // Обрабатываем стартовую команду с реферальным кодом
        let startPayload = '';
        if ('startPayload' in ctx && ctx.startPayload) {
            startPayload = typeof ctx.startPayload === 'string' ? ctx.startPayload : '';
            this.logger.log(`📦 Получен payload: ${startPayload}`);
        }
        // Проверяем, существует ли пользователь
        let user = await this.usersService.findByTelegramId(telegramId);
        if (!user) {
            this.logger.log('🆕 Новый пользователь, создаем...');
            // Создаем данные для нового пользователя
            const userData = {
                telegram_id: telegramId,
                telegramChatId: telegramChatId ? BigInt(telegramChatId) : undefined,
                username: ctx.from.username || '',
                first_name: ctx.from.first_name,
                last_name: ctx.from.last_name || undefined,
                photo_url: ''
            };
            // Создаем пользователя
            user = await this.usersService.create(userData);
            this.logger.log('✅ Новый пользователь создан');
            // Сохраняем chat_id для уведомлений
            if (telegramChatId) {
                await this.usersService.updateTelegramChatId(user.id.toString(), parseInt(telegramChatId));
                this.logger.log(`💬 Сохранен chat_id: ${telegramChatId}`);
            }
            // Обработка реферального кода
            if (startPayload && startPayload.startsWith('ref_')) {
                const referralCode = startPayload.replace('ref_', '');
                this.logger.log(`🔗 Обнаружен реферальный код: ${referralCode}`);
                try {
                    // Находим пользователя по реферальному коду
                    const referrer = await this.referralsService.findUserByReferralCode(referralCode);
                    if (referrer && referrer.id !== user.id) {
                        // Создаем реферальную связь
                        await this.referralsService.createReferral({
                            referrerId: referrer.id,
                            referredId: user.id
                        });
                        // Начисляем бонусы рефереру
                        const referralBonus = 50;
                        await this.ballsService.addBalls(referrer.id.toString(), referralBonus, 'REFERRAL', `Бонус за приглашение ${user.first_name}`);
                        // Уведомляем реферера
                        if (this.notificationsService) {
                            await this.notificationsService.createNotification({
                                userId: referrer.id,
                                message: `Новый реферал: ${user.first_name} зарегистрировался по вашему приглашению! +${referralBonus} мячей`,
                                type: 'REFERRAL_BONUS'
                                // Убираем поле data, если оно не определено в типе CreateNotificationData
                            });
                        }
                        // Начисляем стартовый бонус новому пользователю
                        const startBonus = 50;
                        await this.ballsService.addBalls(user.id.toString(), startBonus, 'REFERRAL', `Бонус за регистрацию по приглашению`);
                        await ctx.reply(`🎾 **Добро пожаловать в Tennis Bot, ${user.first_name}!**\n\n` +
                            `✅ Вы зарегистрировались по приглашению!\n` +
                            `🎁 Бонус: ${startBonus} мячей\n\n` +
                            `Для начала давайте настроим ваш профиль!`, {
                            parse_mode: 'Markdown',
                            reply_markup: telegraf_1.Markup.inlineKeyboard([
                                [telegraf_1.Markup.button.callback('🔄 Настроить профиль', 'setup_profile')]
                            ]).reply_markup
                        });
                        return;
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
                    `• Получать советы от AI-Coach\n\n` +
                    `Для начала давайте настроим ваш профиль!`, {
                    parse_mode: 'Markdown',
                    reply_markup: telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('🔄 Настроить профиль', 'setup_profile')]
                    ]).reply_markup
                });
                // Начисляем стартовый бонус
                const startBonus = 100;
                await this.ballsService.addBalls(user.id.toString(), startBonus, 'BONUS', 'Стартовый бонус за регистрацию');
            }
        }
        else {
            this.logger.log('Пользователь уже существует');
            // Обновляем chat_id если он изменился
            if (telegramChatId && user.telegramChatId !== BigInt(telegramChatId)) {
                await this.usersService.updateTelegramChatId(user.id.toString(), parseInt(telegramChatId));
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
                reply_markup: this.keyboardService.getMainKeyboard().reply_markup
            });
        }
    }
    async handleMenu(ctx) {
        try {
            await ctx.reply(`🎾 **Главное меню**\n\n` +
                `Выберите действие:`, {
                parse_mode: 'Markdown',
                reply_markup: this.keyboardService.getMainKeyboard().reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleMenu: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке меню');
        }
    }
    async handleBackToProfile(ctx) {
        try {
            await ctx.answerCbQuery();
            if (!ctx.from)
                return;
            // Используем ProfileHandler для отображения профиля
            // В настоящей реализации лучше инжектировать ProfileHandler, 
            // но для примера вызовем снова текущий метод
            await ctx.reply(`Возвращаемся к профилю...`, {
                parse_mode: 'Markdown',
                reply_markup: this.keyboardService.getMainKeyboard().reply_markup
            });
            // Эмулируем нажатие кнопки "Профиль"
            await ctx.reply('👤 Профиль');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleBackToProfile: ${error}`);
            await ctx.reply('❌ Ошибка при возврате к профилю');
        }
    }
    async handleInviteButton(ctx) {
        try {
            if (!ctx.from)
                return;
            const userId = ctx.from.id.toString();
            const user = await this.usersService.findByTelegramId(userId);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден');
                return;
            }
            // Предположим, что referralCode это поле у пользователя
            const referralCode = `ref_${userId}`;
            const botName = process.env.TELEGRAM_BOT_USERNAME || 'your_bot_name';
            const inviteLink = `https://t.me/${botName}?start=${referralCode}`;
            await ctx.reply(`🔗 **Пригласите друга и получите бонусы!**\n\n` +
                `За каждого приглашенного друга вы получите 50 мячей.\n\n` +
                `Ваша реферальная ссылка:\n` +
                `${inviteLink}\n\n` +
                `Скопируйте ссылку и отправьте друзьям!`, { parse_mode: 'Markdown' });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleInviteButton: ${error}`);
            await ctx.reply('❌ Ошибка при создании приглашения');
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
};
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], CommonHandler.prototype, "handleStart", null);
CommonHandler = CommonHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_service_1.StateService,
        keyboard_service_1.KeyboardService,
        users_service_1.UsersService,
        balls_service_1.BallsService,
        notifications_service_1.NotificationsService,
        telegram_service_1.TelegramService,
        referrals_service_1.ReferralsService,
        prisma_service_1.PrismaService])
], CommonHandler);
exports.CommonHandler = CommonHandler;
