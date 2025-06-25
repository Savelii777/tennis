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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralsService = void 0;
const common_1 = require("@nestjs/common");
const referrals_repository_1 = require("../../infrastructure/repositories/referrals.repository");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const crypto_1 = require("crypto");
let ReferralsService = class ReferralsService {
    constructor(referralsRepository, prisma // Добавляем инъекцию PrismaService
    ) {
        this.referralsRepository = referralsRepository;
        this.prisma = prisma;
    }
    /**
     * Генерирует персональную реферальную ссылку для пользователя
     */
    async generateInviteLink(userId, baseUrl) {
        let user = await this.referralsRepository.findUserById(parseInt(userId));
        if (!user) {
            throw new common_1.NotFoundException('Пользователь не найден');
        }
        // Если у пользователя еще нет реферального кода, создаем его
        if (!user.referralCode) {
            const referralCode = this.generateReferralCode();
            user = await this.referralsRepository.updateUserReferralCode(parseInt(userId), referralCode);
        }
        // Возвращаем персональную ссылку
        return `${baseUrl}/invite/${user.referralCode}`;
    }
    /**
     * Регистрирует нового пользователя по реферальной ссылке
     */
    async registerByReferral(referralCode, newUserData) {
        // Находим пригласившего пользователя
        const referrer = await this.referralsRepository.findUserByReferralCode(referralCode);
        if (!referrer) {
            throw new common_1.BadRequestException('Неверный реферальный код');
        }
        // Создаем нового пользователя с указанием реферера
        const newUser = await this.referralsRepository.createUserWithReferrer({
            ...newUserData,
            referredBy: referrer.id,
        });
        // Создаем запись об активности реферала
        await this.referralsRepository.createReferralActivity({
            referrerId: referrer.id,
            invitedUserId: newUser.id,
            registeredAt: new Date(),
            inviteSource: newUserData.source || 'direct',
            ipAddress: newUserData.ipAddress,
        });
        // Обновляем статистику реферера
        await this.updateReferrerStats(referrer.id);
        return {
            user: newUser,
            referrer: {
                id: referrer.id,
                username: referrer.username,
                firstName: referrer.firstName,
            },
        };
    }
    /**
     * Получить статистику рефералов пользователя
     */
    async getUserReferralStats(userId) {
        const userIdInt = parseInt(userId);
        // Получаем основную статистику
        const stats = await this.referralsRepository.getReferralStats(userIdInt);
        // Получаем список приглашенных пользователей
        const referrals = await this.referralsRepository.getUserReferrals(userIdInt);
        // Получаем активность по периодам
        const activity = await this.referralsRepository.getReferralActivity(userIdInt);
        return {
            stats: stats || {
                totalInvited: 0,
                activeInvited: 0,
                registeredToday: 0,
                registeredThisWeek: 0,
                registeredThisMonth: 0,
                achievementsEarned: [],
                bonusPointsEarned: 0,
            },
            referrals: referrals.map(ref => ({
                id: ref.invitedUser.id,
                username: ref.invitedUser.username,
                firstName: ref.invitedUser.firstName,
                registeredAt: ref.registeredAt,
                isActive: ref.isActive,
                firstMatchAt: ref.firstMatchAt,
            })),
            activity: {
                totalRegistrations: activity.length,
                activeUsers: activity.filter(a => a.isActive).length,
                recentRegistrations: activity
                    .filter(a => a.registeredAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                    .length,
            },
        };
    }
    /**
     * Отметить приглашенного пользователя как активного (сыграл первый матч)
     */
    async markUserAsActive(userId) {
        const userIdInt = parseInt(userId);
        // Находим запись активности для этого пользователя
        const activity = await this.referralsRepository.findReferralActivityByUser(userIdInt);
        if (activity && !activity.isActive) {
            // Отмечаем как активного
            await this.referralsRepository.updateReferralActivity(activity.id, {
                isActive: true,
                firstMatchAt: new Date(),
            });
            // Обновляем статистику реферера
            await this.updateReferrerStats(activity.referrerId);
        }
    }
    /**
     * Получить топ рефереров
     */
    async getTopReferrers(limit = 10) {
        return this.referralsRepository.getTopReferrers(limit);
    }
    /**
     * Валидировать реферальный код
     */
    async validateReferralCode(referralCode) {
        const user = await this.referralsRepository.findUserByReferralCode(referralCode);
        return !!user;
    }
    /**
     * Поиск пользователя по реферальному коду
     */
    async findUserByReferralCode(code) {
        return this.prisma.user.findFirst({
            where: { referralCode: code }
        });
    }
    /**
     * Создание реферальной связи между пользователями
     */
    async createReferral(data) {
        // Создаем активность реферала вместо реферала напрямую
        // (так как модель referral не существует, но есть ReferralActivity)
        return this.prisma.referralActivity.create({
            data: {
                referrerId: data.referrerId,
                invitedUserId: data.referredId,
                registeredAt: new Date(),
                isActive: false
            }
        });
    }
    generateReferralCode() {
        // Генерируем уникальный 8-символьный код
        return (0, crypto_1.randomBytes)(4).toString('hex').toUpperCase();
    }
    async updateReferrerStats(referrerId) {
        const activity = await this.referralsRepository.getReferralActivity(referrerId);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const stats = {
            totalInvited: activity.length,
            activeInvited: activity.filter(a => a.isActive).length,
            registeredToday: activity.filter(a => a.registeredAt >= today).length,
            registeredThisWeek: activity.filter(a => a.registeredAt >= thisWeek).length,
            registeredThisMonth: activity.filter(a => a.registeredAt >= thisMonth).length,
        };
        // Проверяем достижения
        const achievements = this.checkAchievements(stats);
        await this.referralsRepository.updateReferralStats(referrerId, {
            ...stats,
            achievementsEarned: achievements,
        });
    }
    checkAchievements(stats) {
        const achievements = [];
        if (stats.totalInvited >= 1)
            achievements.push('FIRST_INVITE');
        if (stats.totalInvited >= 5)
            achievements.push('SOCIAL_BUTTERFLY');
        if (stats.totalInvited >= 10)
            achievements.push('COMMUNITY_BUILDER');
        if (stats.totalInvited >= 25)
            achievements.push('AMBASSADOR');
        if (stats.totalInvited >= 50)
            achievements.push('LEGEND');
        if (stats.activeInvited >= 5)
            achievements.push('ACTIVATOR');
        if (stats.activeInvited >= 10)
            achievements.push('MENTOR');
        return achievements;
    }
};
ReferralsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [referrals_repository_1.ReferralsRepository,
        prisma_service_1.PrismaService // Добавляем инъекцию PrismaService
    ])
], ReferralsService);
exports.ReferralsService = ReferralsService;
