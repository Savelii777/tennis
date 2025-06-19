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
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SettingsService = SettingsService_1 = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SettingsService_1.name);
    }
    /**
     * Получить настройки пользователя или создать дефолтные
     */
    async getUserSettings(userId) {
        try {
            let settings = await this.prisma.userSettings.findUnique({
                where: { userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                        }
                    },
                    city: {
                        select: {
                            id: true,
                            name: true,
                            country: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                }
                            }
                        }
                    },
                    sport: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            emoji: true,
                        }
                    }
                }
            });
            if (!settings) {
                settings = await this.createDefaultSettings(userId);
            }
            return settings;
        }
        catch (error) {
            this.logger.error(`Failed to get user settings for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Создать дефолтные настройки для пользователя
     */
    async createDefaultSettings(userId) {
        try {
            const settings = await this.prisma.userSettings.create({
                data: {
                    userId,
                    language: 'ru',
                    notificationsEnabled: true,
                    notifyTelegram: true,
                    notifyEmail: false,
                    matchReminderTime: '1h',
                    notifyMatchResults: true,
                    notifyTournamentResults: true,
                    showProfilePublicly: true,
                    showRatingPublicly: true,
                    allowMatchInvites: true,
                    requireMatchConfirm: false,
                    theme: 'light',
                    timezone: 'Europe/Moscow',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                        }
                    },
                    city: {
                        select: {
                            id: true,
                            name: true,
                            country: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                }
                            }
                        }
                    },
                    sport: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            emoji: true,
                        }
                    }
                }
            });
            this.logger.log(`Created default settings for user ${userId}`);
            return settings;
        }
        catch (error) {
            this.logger.error(`Failed to create default settings for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Обновить настройки пользователя
     */
    async updateSettings(userId, updateData) {
        try {
            await this.getUserSettings(userId);
            const updatedSettings = await this.prisma.userSettings.update({
                where: { userId },
                data: updateData,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                        }
                    },
                    city: {
                        select: {
                            id: true,
                            name: true,
                            country: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                }
                            }
                        }
                    },
                    sport: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            emoji: true,
                        }
                    }
                }
            });
            this.logger.log(`Updated settings for user ${userId}:`, Object.keys(updateData));
            return updatedSettings;
        }
        catch (error) {
            this.logger.error(`Failed to update settings for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Изменить язык интерфейса
     */
    async updateLanguage(userId, language) {
        return this.updateSettings(userId, { language });
    }
    /**
     * Обновить настройки уведомлений
     */
    async updateNotificationSettings(userId, notificationData) {
        return this.updateSettings(userId, notificationData);
    }
    /**
     * Переключить все уведомления
     */
    async toggleNotifications(userId, enabled) {
        return this.updateSettings(userId, {
            notificationsEnabled: enabled,
            notifyTelegram: enabled,
            notifyMatchResults: enabled,
            notifyTournamentResults: enabled,
        });
    }
    /**
     * Обновить Telegram Chat ID
     */
    async updateTelegramChatId(userId, telegramChatId) {
        return this.updateSettings(userId, { telegramChatId });
    }
    /**
     * Получить пользователей с включенными Telegram уведомлениями
     */
    async getUsersWithTelegramNotifications() {
        return this.prisma.userSettings.findMany({
            where: {
                notificationsEnabled: true,
                notifyTelegram: true,
                telegramChatId: { not: null },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        telegramId: true,
                    }
                }
            }
        });
    }
    /**
     * Получить настройки уведомлений пользователя
     */
    async getNotificationSettings(userId) {
        const settings = await this.getUserSettings(userId);
        return {
            notificationsEnabled: settings.notificationsEnabled,
            notifyTelegram: settings.notifyTelegram,
            notifyEmail: settings.notifyEmail,
            matchReminderTime: settings.matchReminderTime,
            notifyMatchResults: settings.notifyMatchResults,
            notifyTournamentResults: settings.notifyTournamentResults,
        };
    }
    /**
     * Проверить, нужно ли отправлять уведомление пользователю
     */
    async shouldNotifyUser(userId, notificationType) {
        try {
            const settings = await this.getUserSettings(userId);
            if (!settings.notificationsEnabled) {
                return false;
            }
            switch (notificationType) {
                case 'telegram':
                    return settings.notifyTelegram && !!settings.telegramChatId;
                case 'email':
                    return settings.notifyEmail;
                case 'match_results':
                    return settings.notifyMatchResults;
                case 'tournament_results':
                    return settings.notifyTournamentResults;
                default:
                    return false;
            }
        }
        catch (error) {
            this.logger.error(`Error checking notification settings for user ${userId}:`, error);
            return false;
        }
    }
    /**
     * Получить предпочтения пользователя по соперникам
     */
    async getOpponentPreferences(userId) {
        const settings = await this.getUserSettings(userId);
        return {
            preferredGender: settings.preferredGender,
            preferredAgeMin: settings.preferredAgeMin,
            preferredAgeMax: settings.preferredAgeMax,
            preferredLevelMin: settings.preferredLevelMin,
            preferredLevelMax: settings.preferredLevelMax,
        };
    }
    /**
     * Удалить настройки пользователя (при удалении аккаунта)
     */
    async deleteUserSettings(userId) {
        try {
            await this.prisma.userSettings.delete({
                where: { userId }
            });
            this.logger.log(`Deleted settings for user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete settings for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Получить статистику по настройкам (для админки)
     */
    async getSettingsStatistics() {
        const totalUsers = await this.prisma.userSettings.count();
        const languageStats = await this.prisma.userSettings.groupBy({
            by: ['language'],
            _count: true,
        });
        const notificationStats = await this.prisma.userSettings.aggregate({
            _count: {
                notifyTelegram: true,
                notifyEmail: true,
                notificationsEnabled: true,
            },
            where: {
                notifyTelegram: true,
            }
        });
        const themeStats = await this.prisma.userSettings.groupBy({
            by: ['theme'],
            _count: true,
        });
        return {
            totalUsers,
            languageDistribution: languageStats.reduce((acc, stat) => {
                acc[stat.language] = stat._count;
                return acc;
            }, {}),
            notificationStats: {
                telegramEnabled: notificationStats._count.notifyTelegram || 0,
                emailEnabled: notificationStats._count.notifyEmail || 0,
                allDisabled: totalUsers - (notificationStats._count.notificationsEnabled || 0),
            },
            themeDistribution: themeStats.reduce((acc, stat) => {
                acc[stat.theme] = stat._count;
                return acc;
            }, {}),
        };
    }
};
SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
exports.SettingsService = SettingsService;
