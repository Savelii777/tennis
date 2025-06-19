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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const notifications_repository_1 = require("../../infrastructure/repositories/notifications.repository");
const telegram_service_1 = require("../../../telegram/telegram.service");
const users_service_1 = require("../../../users/application/services/users.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(notificationsRepository, telegramService, usersService) {
        this.notificationsRepository = notificationsRepository;
        this.telegramService = telegramService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async createNotification(data) {
        try {
            // Создаем уведомление в базе
            const notification = await this.notificationsRepository.create({
                userId: data.userId,
                type: data.type,
                message: data.message,
                payload: data.payload,
            });
            this.logger.log(`Создано уведомление ${notification.id} для пользователя ${data.userId}`);
            // Отправляем через Telegram если требуется
            if (data.sendTelegram !== false) {
                await this.sendTelegramNotification(data.userId, data.message);
                await this.notificationsRepository.updateSentStatus(notification.id);
            }
        }
        catch (error) {
            this.logger.error(`Ошибка создания уведомления: ${error}`);
            throw error;
        }
    }
    async getNotifications(userId, filters, pagination) {
        return this.notificationsRepository.findByUserId(userId, filters, pagination);
    }
    async markAsRead(notificationId, userId) {
        await this.notificationsRepository.markAsRead(notificationId, userId);
    }
    async markAllAsRead(userId) {
        await this.notificationsRepository.markAllAsRead(userId);
    }
    async getUnreadCount(userId) {
        return this.notificationsRepository.getUnreadCount(userId);
    }
    // Методы для различных типов уведомлений
    async sendMatchScheduledNotification(userId, matchData) {
        const message = `🎾 У вас матч ${matchData.date} в ${matchData.time} на корте "${matchData.court}"`;
        await this.createNotification({
            userId,
            type: 'MATCH_SCHEDULED',
            message,
            payload: {
                matchId: matchData.matchId,
                court: matchData.court,
                time: matchData.time,
                opponent: matchData.opponent,
            },
            sendTelegram: true,
        });
    }
    async sendMatchReminderNotification(userId, matchData) {
        const message = `⏰ Напоминание: матч сегодня в ${matchData.time} на корте "${matchData.court}"`;
        await this.createNotification({
            userId,
            type: 'MATCH_REMINDER',
            message,
            payload: {
                matchId: matchData.matchId,
                court: matchData.court,
                time: matchData.time,
            },
            sendTelegram: true,
        });
    }
    async sendInviteNotification(userId, inviteData) {
        const message = `🤝 ${inviteData.senderName} приглашает вас на матч ${inviteData.date}`;
        await this.createNotification({
            userId,
            type: 'NEW_INVITE',
            message,
            payload: {
                inviteId: inviteData.inviteId,
                senderName: inviteData.senderName,
                date: inviteData.date,
                court: inviteData.court,
            },
            sendTelegram: true,
        });
    }
    async sendTournamentResultNotification(userId, resultData) {
        const message = `🏆 Вы заняли ${resultData.place}-е место в турнире "${resultData.tournamentName}"`;
        await this.createNotification({
            userId,
            type: 'TOURNAMENT_RESULT',
            message,
            payload: {
                tournamentId: resultData.tournamentId,
                tournamentName: resultData.tournamentName,
                place: resultData.place,
                prize: resultData.prize,
            },
            sendTelegram: true,
        });
    }
    async sendReferralBonusNotification(userId, bonusData) {
        const message = `💰 Вы получили ${bonusData.amount} мячей за приглашение друга!`;
        await this.createNotification({
            userId,
            type: 'REFERRAL_BONUS',
            message,
            payload: {
                amount: bonusData.amount,
                referredUser: bonusData.referredUser,
            },
            sendTelegram: true,
        });
    }
    async sendTelegramNotification(userId, message) {
        try {
            await this.telegramService.sendNotification(userId, message);
            this.logger.log(`Telegram уведомление отправлено пользователю ${userId}`);
        }
        catch (error) {
            this.logger.error(`Ошибка отправки Telegram уведомления пользователю ${userId}: ${error}`);
            // Не бросаем ошибку, чтобы не прерывать создание уведомления
        }
    }
};
NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository,
        telegram_service_1.TelegramService,
        users_service_1.UsersService])
], NotificationsService);
exports.NotificationsService = NotificationsService;
