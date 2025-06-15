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
exports.ReferralStatsService = void 0;
const common_1 = require("@nestjs/common");
const referrals_repository_1 = require("../../infrastructure/repositories/referrals.repository");
let ReferralStatsService = class ReferralStatsService {
    constructor(referralsRepository) {
        this.referralsRepository = referralsRepository;
    }
    /**
     * Получить общую статистику реферальной программы
     */
    async getGlobalStats() {
        const [totalUsers, usersWithReferrals, totalReferralActivities, activeReferrals, topReferrers] = await Promise.all([
            this.referralsRepository.getTotalUsersCount(),
            this.referralsRepository.getUsersWithReferralsCount(),
            this.referralsRepository.getTotalReferralActivitiesCount(),
            this.referralsRepository.getActiveReferralsCount(),
            this.referralsRepository.getTopReferrers(5)
        ]);
        const conversionRate = totalUsers > 0
            ? ((usersWithReferrals / totalUsers) * 100).toFixed(2)
            : '0';
        const activeRate = totalReferralActivities > 0
            ? ((activeReferrals / totalReferralActivities) * 100).toFixed(2)
            : '0';
        return {
            overview: {
                totalUsers,
                usersWithReferrals,
                totalReferralActivities,
                activeReferrals,
                conversionRate: `${conversionRate}%`,
                activeRate: `${activeRate}%`,
            },
            topReferrers: topReferrers.map(ref => ({
                user: {
                    id: ref.user.id,
                    username: ref.user.username,
                    firstName: ref.user.firstName,
                },
                totalInvited: ref.totalInvited,
                activeInvited: ref.activeInvited,
            })),
            timeframes: await this.getTimeframeStats(),
        };
    }
    /**
     * Получить статистику по временным периодам
     */
    async getTimeframeStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [todayRegistrations, yesterdayRegistrations, thisWeekRegistrations, thisMonthRegistrations] = await Promise.all([
            this.referralsRepository.getRegistrationsByPeriod(today, now),
            this.referralsRepository.getRegistrationsByPeriod(yesterday, today),
            this.referralsRepository.getRegistrationsByPeriod(thisWeek, now),
            this.referralsRepository.getRegistrationsByPeriod(thisMonth, now)
        ]);
        return {
            today: todayRegistrations,
            yesterday: yesterdayRegistrations,
            thisWeek: thisWeekRegistrations,
            thisMonth: thisMonthRegistrations,
            growth: {
                dailyGrowth: yesterdayRegistrations > 0
                    ? (((todayRegistrations - yesterdayRegistrations) / yesterdayRegistrations) * 100).toFixed(2)
                    : '0',
            }
        };
    }
    /**
     * Получить достижения пользователя
     */
    async getUserAchievements(userId) {
        const stats = await this.referralsRepository.getReferralStats(parseInt(userId));
        if (!stats) {
            return { achievements: [], progress: {} };
        }
        const achievementDetails = this.getAchievementDetails();
        const userAchievements = stats.achievementsEarned || [];
        const progress = {
            nextInviteMilestone: this.getNextMilestone(stats.totalInvited, [1, 5, 10, 25, 50]),
            nextActiveMilestone: this.getNextMilestone(stats.activeInvited, [5, 10, 20]),
        };
        return {
            achievements: userAchievements.map(id => achievementDetails[id]).filter(Boolean),
            progress,
            stats: {
                totalInvited: stats.totalInvited,
                activeInvited: stats.activeInvited,
                bonusPointsEarned: stats.bonusPointsEarned,
            }
        };
    }
    getAchievementDetails() {
        return {
            FIRST_INVITE: {
                id: 'FIRST_INVITE',
                name: 'Первое приглашение',
                description: 'Пригласили своего первого друга',
                icon: '🎯',
                requirement: 'Пригласите 1 игрока',
            },
            SOCIAL_BUTTERFLY: {
                id: 'SOCIAL_BUTTERFLY',
                name: 'Социальная бабочка',
                description: 'Пригласили 5 друзей',
                icon: '🦋',
                requirement: 'Пригласите 5 игроков',
            },
            COMMUNITY_BUILDER: {
                id: 'COMMUNITY_BUILDER',
                name: 'Строитель сообщества',
                description: 'Пригласили 10 друзей',
                icon: '🏗️',
                requirement: 'Пригласите 10 игроков',
            },
            AMBASSADOR: {
                id: 'AMBASSADOR',
                name: 'Амбассадор',
                description: 'Пригласили 25 друзей',
                icon: '👑',
                requirement: 'Пригласите 25 игроков',
            },
            LEGEND: {
                id: 'LEGEND',
                name: 'Легенда',
                description: 'Пригласили 50+ друзей',
                icon: '🏆',
                requirement: 'Пригласите 50 игроков',
            },
            ACTIVATOR: {
                id: 'ACTIVATOR',
                name: 'Активатор',
                description: '5 приглашенных стали активными',
                icon: '⚡',
                requirement: '5 активных рефералов',
            },
            MENTOR: {
                id: 'MENTOR',
                name: 'Ментор',
                description: '10 приглашенных стали активными',
                icon: '🎓',
                requirement: '10 активных рефералов',
            },
        };
    }
    getNextMilestone(current, milestones) {
        const next = milestones.find(m => m > current);
        if (!next)
            return null;
        return {
            target: next,
            progress: current,
            remaining: next - current,
            percentage: ((current / next) * 100).toFixed(1),
        };
    }
};
ReferralStatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [referrals_repository_1.ReferralsRepository])
], ReferralStatsService);
exports.ReferralStatsService = ReferralStatsService;
