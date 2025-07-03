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
exports.ReferralsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let ReferralsRepository = class ReferralsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUserById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                referralStats: true,
            }
        });
    }
    async findUserByReferralCode(referralCode) {
        return this.prisma.user.findUnique({
            where: { referralCode },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                referralCode: true,
            }
        });
    }
    async updateUserReferralCode(userId, referralCode) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { referralCode },
            include: {
                referralStats: true,
            }
        });
    }
    async createUserWithReferrer(userData) {
        return this.prisma.user.create({
            data: {
                telegramId: userData.telegram_id,
                username: userData.username,
                firstName: userData.first_name,
                lastName: userData.last_name,
                referredBy: userData.referredBy,
                profile: {
                    create: {
                        avatarUrl: userData.photo_url || null,
                    }
                }
            },
            include: {
                profile: true,
                referrer: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                    }
                }
            }
        });
    }
    async createReferralActivity(data) {
        return this.prisma.referralActivity.create({
            data
        });
    }
    async updateReferralActivity(id, data) {
        return this.prisma.referralActivity.update({
            where: { id },
            data
        });
    }
    async findReferralActivityByUser(userId) {
        return this.prisma.referralActivity.findFirst({
            where: { invitedUserId: userId }
        });
    }
    async getReferralStats(userId) {
        return this.prisma.referralStats.findUnique({
            where: { userId }
        });
    }
    async updateReferralStats(userId, data) {
        return this.prisma.referralStats.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                ...data,
            }
        });
    }
    async getUserReferrals(userId) {
        return this.prisma.referralActivity.findMany({
            where: { referrerId: userId },
            include: {
                invitedUser: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            },
            orderBy: { registeredAt: 'desc' }
        });
    }
    async getReferralActivity(userId) {
        return this.prisma.referralActivity.findMany({
            where: { referrerId: userId },
            orderBy: { registeredAt: 'desc' }
        });
    }
    async getTopReferrers(limit) {
        return this.prisma.referralStats.findMany({
            take: limit,
            orderBy: { totalInvited: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });
    }
    // Методы для глобальной статистики
    async getTotalUsersCount() {
        return this.prisma.user.count();
    }
    async getUsersWithReferralsCount() {
        return this.prisma.user.count({
            where: {
                referredBy: { not: null }
            }
        });
    }
    async getTotalReferralActivitiesCount() {
        return this.prisma.referralActivity.count();
    }
    async getActiveReferralsCount() {
        return this.prisma.referralActivity.count({
            where: { isActive: true }
        });
    }
    async getRegistrationsByPeriod(start, end) {
        return this.prisma.referralActivity.count({
            where: {
                registeredAt: {
                    gte: start,
                    lt: end,
                }
            }
        });
    }
};
exports.ReferralsRepository = ReferralsRepository;
exports.ReferralsRepository = ReferralsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReferralsRepository);
