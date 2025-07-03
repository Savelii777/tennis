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
var AchievementsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementsService = exports.AchievementCode = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
var AchievementCode;
(function (AchievementCode) {
    // Активность
    AchievementCode["FIRST_STEP"] = "first_step";
    AchievementCode["FIRST_MATCH"] = "first_match";
    AchievementCode["WARMUP"] = "warmup";
    AchievementCode["IN_RHYTHM"] = "in_rhythm";
    AchievementCode["REAL_PLAYER"] = "real_player";
    // Победы
    AchievementCode["FIRST_SUCCESS"] = "first_success";
    AchievementCode["CONFIDENCE_GROWS"] = "confidence_grows";
    AchievementCode["STABLE_WINNER"] = "stable_winner";
    AchievementCode["WINNING_STREAK"] = "winning_streak";
    // Турниры
    AchievementCode["TOURNAMENT_WINNER"] = "tournament_winner";
    AchievementCode["BRACKET_MASTER"] = "bracket_master";
    AchievementCode["GROUP_CHAMPION"] = "group_champion";
    AchievementCode["LEAGUE_MASTER"] = "league_master";
    AchievementCode["SPEED_DEMON"] = "speed_demon";
    AchievementCode["CROWD_PLEASER"] = "crowd_pleaser";
    AchievementCode["TOURNAMENT_DOMINATOR"] = "tournament_dominator";
    AchievementCode["RANKED_CHAMPION"] = "ranked_champion";
    AchievementCode["TOURNAMENT_FINALIST"] = "tournament_finalist";
    AchievementCode["TOURNAMENT_MEDALIST"] = "tournament_medalist";
    AchievementCode["TOURNAMENT_STREAK_3"] = "tournament_streak_3";
    AchievementCode["TOURNAMENT_STREAK_5"] = "tournament_streak_5";
    AchievementCode["TOURNAMENT_LEGEND"] = "tournament_legend";
    AchievementCode["MONTHLY_CHAMPION"] = "monthly_champion";
    AchievementCode["MONTHLY_DOMINATOR"] = "monthly_dominator";
})(AchievementCode || (exports.AchievementCode = AchievementCode = {}));
let AchievementsService = AchievementsService_1 = class AchievementsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AchievementsService_1.name);
        this.definitions = [
            {
                code: 'first_step',
                name: 'Первый шаг',
                description: 'Завершил регистрацию',
                icon: '👋',
                category: 'activity'
            },
            {
                code: 'first_match',
                name: 'Первый матч',
                description: 'Сыграл первый матч',
                icon: '🎾',
                category: 'matches'
            },
            {
                code: 'warmup',
                name: 'Разогрев',
                description: 'Сыграл 5 матчей',
                icon: '🔥',
                category: 'matches'
            },
            {
                code: 'in_rhythm',
                name: 'В ритме',
                description: 'Сыграл 10 матчей',
                icon: '⚡',
                category: 'matches'
            },
            {
                code: 'real_player',
                name: 'Настоящий игрок',
                description: 'Сыграл 50 матчей',
                icon: '🏆',
                category: 'matches'
            },
            {
                code: 'first_success',
                name: 'Первый успех',
                description: 'Выиграл первый матч',
                icon: '🥇',
                category: 'victories'
            },
            {
                code: 'confidence_grows',
                name: 'Уверенность растет',
                description: 'Выиграл 5 матчей',
                icon: '💪',
                category: 'victories'
            },
            {
                code: 'stable_winner',
                name: 'Стабильный победитель',
                description: 'Выиграл 15 матчей',
                icon: '🌟',
                category: 'victories'
            },
            {
                code: 'winning_streak',
                name: 'Победная серия',
                description: 'Выиграл 5 матчей подряд',
                icon: '🔥',
                category: 'victories'
            },
            // Турнирные достижения
            {
                code: 'tournament_winner',
                name: 'Победитель турнира',
                description: 'Выиграл турнир',
                icon: '🏆',
                category: 'tournaments'
            },
            {
                code: 'bracket_master',
                name: 'Мастер сетки',
                description: 'Выиграл турнир на выбывание',
                icon: '🎯',
                category: 'tournaments'
            },
            {
                code: 'group_champion',
                name: 'Чемпион группы',
                description: 'Выиграл групповой турнир',
                icon: '👥',
                category: 'tournaments'
            },
            {
                code: 'league_master',
                name: 'Мастер лиги',
                description: 'Выиграл лиговой турнир',
                icon: '🏅',
                category: 'tournaments'
            },
            {
                code: 'speed_demon',
                name: 'Демон скорости',
                description: 'Выиграл блиц-турнир',
                icon: '⚡',
                category: 'tournaments'
            },
            {
                code: 'crowd_pleaser',
                name: 'Любимец публики',
                description: 'Выиграл турнир с 8+ участниками',
                icon: '👏',
                category: 'tournaments'
            },
            {
                code: 'tournament_dominator',
                name: 'Доминатор турниров',
                description: 'Выиграл турнир с 16+ участниками',
                icon: '👑',
                category: 'tournaments'
            },
            {
                code: 'ranked_champion',
                name: 'Рейтинговый чемпион',
                description: 'Выиграл рейтинговый турнир',
                icon: '⭐',
                category: 'tournaments'
            },
            {
                code: 'tournament_finalist',
                name: 'Финалист турнира',
                description: 'Занял 2-е место в турнире',
                icon: '🥈',
                category: 'tournaments'
            },
            {
                code: 'tournament_medalist',
                name: 'Призер турнира',
                description: 'Занял 3-е место в турнире',
                icon: '🥉',
                category: 'tournaments'
            },
            {
                code: 'tournament_streak_3',
                name: 'Турнирная серия',
                description: 'Выиграл 3 турнира подряд',
                icon: '🔥',
                category: 'tournaments'
            },
            {
                code: 'tournament_streak_5',
                name: 'Турнирная доминация',
                description: 'Выиграл 5 турниров подряд',
                icon: '🌟',
                category: 'tournaments'
            },
            {
                code: 'tournament_legend',
                name: 'Легенда турниров',
                description: 'Выиграл 10 турниров подряд',
                icon: '👑',
                category: 'tournaments'
            },
            {
                code: 'monthly_champion',
                name: 'Чемпион месяца',
                description: 'Выиграл 3 турнира за месяц',
                icon: '📅',
                category: 'tournaments'
            },
            {
                code: 'monthly_dominator',
                name: 'Доминатор месяца',
                description: 'Выиграл 5 турниров за месяц',
                icon: '🗓️',
                category: 'tournaments'
            },
        ];
    }
    async checkAndAwardAchievements(userId, eventType) {
        const newAchievements = [];
        try {
            switch (eventType) {
                case 'registration_completed':
                    await this.checkRegistrationAchievements(userId, newAchievements);
                    break;
                case 'match_played':
                    await this.checkMatchAchievements(userId, newAchievements);
                    break;
                case 'match_won':
                    await this.checkVictoryAchievements(userId, newAchievements);
                    break;
            }
            // Награждаем новыми достижениями
            for (const code of newAchievements) {
                await this.awardAchievement(userId, code);
            }
        }
        catch (error) {
            this.logger.error(`Error checking achievements for user ${userId}:`, error);
        }
        return newAchievements;
    }
    async getAllDefinitions() {
        return this.definitions;
    }
    async checkRegistrationAchievements(userId, newAchievements) {
        if (!(await this.hasAchievement(userId, AchievementCode.FIRST_STEP))) {
            newAchievements.push(AchievementCode.FIRST_STEP);
        }
    }
    async checkMatchAchievements(userId, newAchievements) {
        const stats = await this.getUserStats(userId);
        if (!stats)
            return;
        // Первый матч
        if (stats.matchesPlayed >= 1 && !(await this.hasAchievement(userId, AchievementCode.FIRST_MATCH))) {
            newAchievements.push(AchievementCode.FIRST_MATCH);
        }
        // 5 матчей
        if (stats.matchesPlayed >= 5 && !(await this.hasAchievement(userId, AchievementCode.WARMUP))) {
            newAchievements.push(AchievementCode.WARMUP);
        }
        // 10 матчей
        if (stats.matchesPlayed >= 10 && !(await this.hasAchievement(userId, AchievementCode.IN_RHYTHM))) {
            newAchievements.push(AchievementCode.IN_RHYTHM);
        }
        // 50 матчей
        if (stats.matchesPlayed >= 50 && !(await this.hasAchievement(userId, AchievementCode.REAL_PLAYER))) {
            newAchievements.push(AchievementCode.REAL_PLAYER);
        }
    }
    async checkVictoryAchievements(userId, newAchievements) {
        const stats = await this.getUserStats(userId);
        if (!stats)
            return;
        // Первая победа
        if (stats.matchWins >= 1 && !(await this.hasAchievement(userId, AchievementCode.FIRST_SUCCESS))) {
            newAchievements.push(AchievementCode.FIRST_SUCCESS);
        }
        // 5 побед
        if (stats.matchWins >= 5 && !(await this.hasAchievement(userId, AchievementCode.CONFIDENCE_GROWS))) {
            newAchievements.push(AchievementCode.CONFIDENCE_GROWS);
        }
        // 15 побед
        if (stats.matchWins >= 15 && !(await this.hasAchievement(userId, AchievementCode.STABLE_WINNER))) {
            newAchievements.push(AchievementCode.STABLE_WINNER);
        }
        // Проверяем серию побед
        const winningStreak = await this.getWinningStreak(userId);
        if (winningStreak >= 5 && !(await this.hasAchievement(userId, AchievementCode.WINNING_STREAK))) {
            newAchievements.push(AchievementCode.WINNING_STREAK);
        }
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
    async awardAchievement(userId, code) {
        try {
            await this.prisma.userAchievement.create({
                data: {
                    userId: parseInt(userId),
                    code: code,
                },
            });
            this.logger.log(`Achievement ${code} awarded to user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to award achievement ${code} to user ${userId}:`, error);
        }
    }
    async getUserStats(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: {
                profile: true,
                // Используем правильные отношения из схемы
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
            // Упрощенная логика - проверяем счет
            const isWin = match.score && match.score.includes('6-');
            if (isWin) {
                streak++;
            }
            else {
                break;
            }
        }
        return streak;
    }
    async getUserAchievements(userId) {
        const userAchievements = await this.prisma.userAchievement.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { awardedAt: 'desc' },
        });
        // Добавляем определения к достижениям
        return userAchievements.map((achievement) => {
            const definition = this.definitions.find(def => def.code === achievement.code);
            return {
                ...achievement,
                definition: definition || {
                    code: achievement.code,
                    name: achievement.code,
                    description: 'Неизвестное достижение',
                    icon: '🏆',
                    category: 'unknown'
                }
            };
        });
    }
    /**
     * Проверяем и присваиваем отдельное достижение
     */
    async checkAndAwardSingleAchievement(userId, achievementCode, metadata) {
        try {
            // Проверяем, есть ли уже это достижение
            const hasAchievement = await this.prisma.userAchievement.findUnique({
                where: {
                    userId_code: {
                        userId: parseInt(userId),
                        code: achievementCode,
                    },
                },
            });
            if (hasAchievement) {
                return false; // Достижение уже есть
            }
            // Присваиваем достижение
            await this.awardAchievement(userId, achievementCode);
            this.logger.log(`🏆 Присвоено достижение ${achievementCode} пользователю ${userId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`❌ Ошибка при присвоении достижения ${achievementCode}:`, error);
            return false;
        }
    }
};
exports.AchievementsService = AchievementsService;
exports.AchievementsService = AchievementsService = AchievementsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AchievementsService);
