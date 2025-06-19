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
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const prisma_service_1 = require("../../prisma/prisma.service");
let TelegramService = TelegramService_1 = class TelegramService {
    constructor(bot, configService, prisma) {
        this.bot = bot;
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(TelegramService_1.name);
    }
    // ==================== БАЗОВЫЕ МЕТОДЫ ОТПРАВКИ ====================
    /**
     * Отправка обычного текстового сообщения
     */
    async sendMessage(chatId, text, extra) {
        try {
            return await this.bot.telegram.sendMessage(chatId, text, {
                parse_mode: 'Markdown',
                ...extra,
            });
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error sending message to ${chatId}: ${errorMsg}`);
            throw error;
        }
    }
    /**
     * Отправка фото с подписью
     */
    async sendPhoto(chatId, photo, extra) {
        try {
            return await this.bot.telegram.sendPhoto(chatId, photo, {
                parse_mode: 'Markdown',
                ...extra,
            });
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error sending photo to ${chatId}: ${errorMsg}`);
            throw error;
        }
    }
    /**
     * Отправка группы медиафайлов
     */
    async sendMediaGroup(chatId, media) {
        try {
            return await this.bot.telegram.sendMediaGroup(chatId, media);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error sending media group to ${chatId}: ${errorMsg}`);
            throw error;
        }
    }
    // ==================== СИСТЕМА УВЕДОМЛЕНИЙ ====================
    /**
     * Основной метод для отправки уведомлений пользователям
     */
    async sendNotification(userId, message, options) {
        try {
            const telegramChatId = await this.getTelegramChatId(userId);
            if (!telegramChatId) {
                this.logger.warn(`Не найден chat_id для пользователя ${userId}`);
                return;
            }
            // Проверяем, включены ли уведомления у пользователя
            const notificationsEnabled = await this.areNotificationsEnabled(userId);
            if (!notificationsEnabled) {
                this.logger.log(`Уведомления отключены для пользователя ${userId}`);
                return;
            }
            await this.bot.telegram.sendMessage(telegramChatId, message, {
                parse_mode: options?.parseMode || 'Markdown',
                // Убираем disable_web_page_preview
                reply_markup: options?.replyMarkup,
            });
            this.logger.log(`✅ Уведомление отправлено пользователю ${userId}`);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`❌ Ошибка отправки уведомления пользователю ${userId}: ${errorMsg}`);
            // Если ошибка связана с блокировкой бота пользователем
            if (errorMsg.includes('blocked') || errorMsg.includes('chat not found')) {
                await this.handleBlockedUser(userId);
            }
        }
    }
    /**
     * Отправка уведомления с фото
     */
    async sendNotificationWithPhoto(userId, photo, caption, options) {
        try {
            const telegramChatId = await this.getTelegramChatId(userId);
            if (!telegramChatId) {
                this.logger.warn(`Не найден chat_id для пользователя ${userId}`);
                return;
            }
            const notificationsEnabled = await this.areNotificationsEnabled(userId);
            if (!notificationsEnabled) {
                this.logger.log(`Уведомления отключены для пользователя ${userId}`);
                return;
            }
            await this.bot.telegram.sendPhoto(telegramChatId, photo, {
                caption,
                parse_mode: 'Markdown',
                ...options,
            });
            this.logger.log(`✅ Уведомление с фото отправлено пользователю ${userId}`);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`❌ Ошибка отправки уведомления с фото пользователю ${userId}: ${errorMsg}`);
        }
    }
    /**
     * Массовая отправка уведомлений
     */
    async sendBulkNotifications(userIds, message, options) {
        const delay = options?.delay || 100; // 100мс между сообщениями
        const batchSize = options?.batchSize || 10; // по 10 сообщений в батче
        this.logger.log(`📤 Массовая отправка уведомлений для ${userIds.length} пользователей`);
        for (let i = 0; i < userIds.length; i += batchSize) {
            const batch = userIds.slice(i, i + batchSize);
            const promises = batch.map(async (userId, index) => {
                // Добавляем небольшую задержку для избежания rate limit
                await new Promise(resolve => setTimeout(resolve, index * delay));
                return this.sendNotification(userId, message);
            });
            await Promise.allSettled(promises);
            // Пауза между батчами
            if (i + batchSize < userIds.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        this.logger.log(`✅ Массовая отправка завершена`);
    }
    // ==================== СПЕЦИАЛИЗИРОВАННЫЕ УВЕДОМЛЕНИЯ ====================
    /**
     * Уведомление о назначенном матче
     */
    async sendMatchNotification(userId, matchData) {
        const message = `🎾 **Новый матч назначен!**\n\n` +
            `👤 **Соперник:** ${matchData.opponentName}\n` +
            `📅 **Дата:** ${matchData.date}\n` +
            `⏰ **Время:** ${matchData.time}\n` +
            `📍 **Корт:** ${matchData.court}\n\n` +
            `Удачи в игре! 🏆`;
        await this.sendNotification(userId, message);
    }
    /**
     * Напоминание о матче
     */
    async sendMatchReminder(userId, matchData) {
        const message = `⏰ **Напоминание о матче!**\n\n` +
            `🎾 Ваш матч с **${matchData.opponentName}** начинается через **${matchData.minutesUntil} минут**\n\n` +
            `📍 **Корт:** ${matchData.court}\n` +
            `⏰ **Время:** ${matchData.time}\n\n` +
            `Не опаздывайте! 🏃‍♂️`;
        await this.sendNotification(userId, message);
    }
    /**
     * Уведомление о новом приглашении
     */
    async sendInviteNotification(userId, inviteData) {
        const message = `🤝 **Новое приглашение!**\n\n` +
            `👤 **От:** ${inviteData.senderName}\n` +
            `🎾 **Тип игры:** ${inviteData.gameType}\n` +
            `📅 **Дата:** ${inviteData.date}\n` +
            `${inviteData.court ? `📍 **Корт:** ${inviteData.court}\n` : ''}` +
            `\nОтветьте в приложении! 📱`;
        await this.sendNotification(userId, message);
    }
    /**
     * Уведомление о результатах турнира
     */
    async sendTournamentResultNotification(userId, resultData) {
        const medal = resultData.place === 1 ? '🥇' :
            resultData.place === 2 ? '🥈' :
                resultData.place === 3 ? '🥉' : '🏅';
        const message = `🏆 **Результаты турнира!**\n\n` +
            `${medal} **Место:** ${resultData.place} из ${resultData.participantsCount}\n` +
            `🎾 **Турнир:** ${resultData.tournamentName}\n` +
            `${resultData.prize ? `💰 **Приз:** ${resultData.prize}\n` : ''}` +
            `\nПоздравляем! 🎉`;
        await this.sendNotification(userId, message);
    }
    /**
     * Уведомление о бонусах за реферала
     */
    async sendReferralBonusNotification(userId, bonusData) {
        const message = `💰 **Бонус за приглашение!**\n\n` +
            `🎾 Вы получили **${bonusData.amount} мячей** за приглашение игрока **${bonusData.referredUserName}**!\n\n` +
            `💳 **Текущий баланс:** ${bonusData.totalBalance} мячей\n\n` +
            `Продолжайте приглашать друзей! 🔗`;
        await this.sendNotification(userId, message);
    }
    /**
     * Системное уведомление
     */
    async sendSystemNotification(userId, title, message, isImportant = false) {
        const icon = isImportant ? '🚨' : 'ℹ️';
        const formattedMessage = `${icon} **${title}**\n\n` +
            `${message}`;
        await this.sendNotification(userId, formattedMessage);
    }
    // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================
    /**
     * Получение Telegram chat_id пользователя из базы данных
     */
    async getTelegramChatId(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: Number(userId) },
                select: {
                    telegramChatId: true,
                    telegramId: true,
                },
            });
            if (!user) {
                this.logger.warn(`Пользователь ${userId} не найден в базе данных`);
                return null;
            }
            // Приоритет: telegramChatId из user, затем telegramId
            if (user.telegramChatId) {
                return Number(user.telegramChatId);
            }
            if (user.telegramId) {
                return Number(user.telegramId);
            }
            this.logger.warn(`Не найден chat_id для пользователя ${userId}`);
            return null;
        }
        catch (error) {
            this.logger.error(`Ошибка получения chat_id для пользователя ${userId}: ${error}`);
            return null;
        }
    }
    /**
     * Проверка, включены ли уведомления у пользователя
     */
    async areNotificationsEnabled(userId) {
        try {
            const userSettings = await this.prisma.userSettings.findUnique({
                where: { userId: Number(userId) },
                select: { notificationsEnabled: true }
            });
            return userSettings?.notificationsEnabled ?? true; // по умолчанию включены
        }
        catch (error) {
            this.logger.error(`Ошибка проверки настроек уведомлений для пользователя ${userId}: ${error}`);
            return true; // в случае ошибки считаем что включены
        }
    }
    /**
     * Обработка заблокированного пользователя
     */
    async handleBlockedUser(userId) {
        try {
            // Отключаем уведомления для заблокировавшего бота пользователя
            await this.prisma.userSettings.upsert({
                where: { userId: Number(userId) },
                update: { notificationsEnabled: false },
                create: {
                    userId: Number(userId),
                    notificationsEnabled: false
                }
            });
            this.logger.log(`🚫 Пользователь ${userId} заблокировал бота. Уведомления отключены.`);
        }
        catch (error) {
            this.logger.error(`Ошибка обработки блокировки пользователя ${userId}: ${error}`);
        }
    }
    /**
     * Обновление chat_id пользователя
     */
    async updateUserChatId(userId, chatId) {
        try {
            await this.prisma.user.update({
                where: { id: Number(userId) },
                data: { telegramChatId: BigInt(chatId) }
            });
            // Также обновляем в userSettings если есть
            await this.prisma.userSettings.upsert({
                where: { userId: Number(userId) },
                update: {
                    telegramChatId: chatId.toString(),
                    notificationsEnabled: true // включаем уведомления при обновлении chat_id
                },
                create: {
                    userId: Number(userId),
                    telegramChatId: chatId.toString(),
                    notificationsEnabled: true
                }
            });
            this.logger.log(`✅ Обновлен chat_id для пользователя ${userId}: ${chatId}`);
        }
        catch (error) {
            this.logger.error(`Ошибка обновления chat_id для пользователя ${userId}: ${error}`);
        }
    }
    /**
     * Включение/отключение уведомлений для пользователя
     */
    async toggleNotifications(userId, enabled) {
        try {
            await this.prisma.userSettings.upsert({
                where: { userId: Number(userId) },
                update: { notificationsEnabled: enabled },
                create: {
                    userId: Number(userId),
                    notificationsEnabled: enabled
                }
            });
            this.logger.log(`${enabled ? '🔔' : '🔕'} Уведомления ${enabled ? 'включены' : 'отключены'} для пользователя ${userId}`);
        }
        catch (error) {
            this.logger.error(`Ошибка изменения настроек уведомлений для пользователя ${userId}: ${error}`);
        }
    }
    /**
     * Получение статистики отправки уведомлений
     */
    async getNotificationStats() {
        try {
            const totalUsers = await this.prisma.user.count();
            const enabledUsers = await this.prisma.userSettings.count({
                where: { notificationsEnabled: true }
            });
            const disabledUsers = await this.prisma.userSettings.count({
                where: { notificationsEnabled: false }
            });
            return {
                totalUsers,
                enabledUsers,
                disabledUsers: disabledUsers
            };
        }
        catch (error) {
            this.logger.error(`Ошибка получения статистики уведомлений: ${error}`);
            return { totalUsers: 0, enabledUsers: 0, disabledUsers: 0 };
        }
    }
};
TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], TelegramService);
exports.TelegramService = TelegramService;
