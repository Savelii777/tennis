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
exports.AchievementsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let AchievementsRepository = class AchievementsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserAchievements(userId) {
        return this.prisma.userAchievement.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { awardedAt: 'desc' },
        });
    }
    async hasAchievement(userId, code) {
        const achievement = await this.prisma.userAchievement.findUnique({
            where: {
                userId_code: {
                    userId: parseInt(userId),
                    code: code,
                },
            },
        });
        return !!achievement;
    }
    async awardAchievement(userId, code, metadata) {
        return this.prisma.userAchievement.create({
            data: {
                userId: parseInt(userId),
                code: code,
                metadata: metadata,
            },
        });
    }
    async getUserStats(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: {
                profile: true,
                player1Matches: {
                    where: { state: 'FINISHED' },
                    orderBy: { createdAt: 'desc' },
                },
                player2Matches: {
                    where: { state: 'FINISHED' },
                    orderBy: { createdAt: 'desc' },
                },
                createdMatches: {
                    where: { state: 'FINISHED' },
                    orderBy: { createdAt: 'desc' },
                }
            },
        });
        if (!user)
            return null;
        // Объединяем все матчи с правильными полями
        const allMatches = [
            ...(user.createdMatches || []),
            ...(user.player1Matches || []),
            ...(user.player2Matches || [])
        ];
        return {
            matchesPlayed: allMatches.length,
            matchWins: user.profile?.matchWins || 0,
            tournamentsPlayed: user.profile?.tournamentsPlayed || 0,
            tournamentsWon: user.profile?.tournamentsWon || 0,
            lastActivity: user.profile?.lastActivity,
            createdAt: user.createdAt,
        };
    }
    async getWinningStreak(userId) {
        const matches = await this.prisma.match.findMany({
            where: {
                OR: [
                    { creatorId: parseInt(userId) },
                    { player1Id: parseInt(userId) },
                    { player2Id: parseInt(userId) },
                ],
                state: 'FINISHED',
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        let streak = 0;
        for (const match of matches) {
            // Упрощенная логика определения победы через счет
            const isWin = match.score && match.score.includes('6-') &&
                (match.score.startsWith('6-') || match.score.includes(' 6-'));
            if (isWin) {
                streak++;
            }
            else {
                break;
            }
        }
        return streak;
    }
    async getReferralsCount(userId) {
        const count = await this.prisma.user.count({
            where: { referredBy: parseInt(userId) },
        });
        return count;
    }
};
exports.AchievementsRepository = AchievementsRepository;
exports.AchievementsRepository = AchievementsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AchievementsRepository);
