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
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../../domain/entities/user.entity");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const user_profile_entity_1 = require("../../domain/entities/user-profile.entity");
const role_enum_1 = require("../../domain/enums/role.enum");
let UsersRepository = class UsersRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const users = await this.prisma.user.findMany({
            include: { profile: true }
        });
        return users.map(this.mapToEntity);
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: { profile: true }
        });
        return this.mapToEntity(user);
    }
    async findByTelegramId(telegramId) {
        const user = await this.prisma.user.findUnique({
            where: { telegramId },
            include: { profile: true }
        });
        if (!user) {
            return null; // Or throw an exception
        }
        return this.mapToEntity(user);
    }
    async create(user) {
        const createdUser = await this.prisma.user.create({
            data: {
                telegramId: user.telegram_id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role || role_enum_1.Role.USER,
                profile: {
                    create: {
                        avatarUrl: null,
                        city: null,
                        countryCode: null,
                        sportType: 'TENNIS'
                    }
                }
            },
            include: { profile: true }
        });
        return this.mapToEntity(createdUser);
    }
    async update(id, updateUserDto) {
        const user = await this.prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                firstName: updateUserDto.firstName,
                lastName: updateUserDto.lastName,
                username: updateUserDto.username
            },
            include: { profile: true }
        });
        return this.mapToEntity(user);
    }
    async updateProfile(id, updateProfileDto) {
        const user = await this.prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                firstName: updateProfileDto.firstName,
                lastName: updateProfileDto.lastName,
                profile: {
                    update: {
                        avatarUrl: updateProfileDto.avatarUrl,
                        city: updateProfileDto.city,
                        countryCode: updateProfileDto.countryCode,
                        sportType: updateProfileDto.sportType,
                        isPublicProfile: updateProfileDto.isPublicProfile
                    }
                }
            },
            include: { profile: true }
        });
        return this.mapToEntity(user);
    }
    async getRatingHistory(userId) {
        // This would fetch from a separate rating_history table in a real implementation
        // For now, returning mock data
        return [
            { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), rating: 940 },
            { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), rating: 970 },
            { date: new Date(), rating: 1000 },
        ];
    }
    async getUserAchievements(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: { profile: true }
        });
        if (!user || !user.profile)
            return {};
        return user.profile.achievements || {};
    }
    async addAchievement(userId, achievementKey, achievementData) {
        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: { profile: true }
        });
        if (!user || !user.profile)
            throw new common_1.NotFoundException('User profile not found');
        // Current achievements or empty object
        const achievements = user.profile.achievements || {};
        // Add new achievement
        achievements[achievementKey] = {
            ...achievementData,
            unlockedAt: new Date()
        };
        // Update user profile with new achievements
        const updatedUser = await this.prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                profile: {
                    update: {
                        achievements: achievements
                    }
                }
            },
            include: { profile: true }
        });
        return this.mapToEntity(updatedUser);
    }
    async getRecentMatches(userId, limit = 5) {
        // Get matches where user is creator, player1 or player2
        const matches = await this.prisma.match.findMany({
            where: {
                OR: [
                    { creatorId: parseInt(userId) },
                    { player1Id: parseInt(userId) },
                    { player2Id: parseInt(userId) }
                ],
                state: { in: ['FINISHED', 'CANCELLED'] }
            },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            include: {
                creator: {
                    select: {
                        username: true,
                        firstName: true,
                        lastName: true,
                        profile: { select: { avatarUrl: true } }
                    }
                }
            }
        });
        // Загрузим оппонентов отдельно
        const result = await Promise.all(matches.map(async (match) => {
            const opponentId = match.player1Id === parseInt(userId)
                ? match.player2Id
                : match.player1Id;
            // Получаем данные оппонента, если есть
            let opponent = null;
            if (opponentId) {
                const user = await this.prisma.user.findUnique({
                    where: { id: opponentId },
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profile: { select: { avatarUrl: true } }
                    }
                });
                opponent = user;
            }
            return {
                id: match.id,
                date: match.updatedAt,
                type: match.type,
                score: match.score,
                state: match.state,
                opponent
            };
        }));
        return result;
    }
    async updateAvatar(userId, avatarUrl) {
        const user = await this.prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                profile: {
                    update: {
                        avatarUrl: avatarUrl,
                        updatedAt: new Date()
                    }
                }
            },
            include: { profile: true }
        });
        return this.mapToEntity(user);
    }
    async updateMatchStats(userId, isWin) {
        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: { profile: true }
        });
        if (!user || !user.profile) {
            throw new common_1.NotFoundException('User profile not found');
        }
        // Используем camelCase для имен полей
        const profile = await this.prisma.userProfile.update({
            where: { userId: parseInt(userId) },
            data: {
                matchesPlayed: { increment: 1 },
                matchWins: isWin ? { increment: 1 } : undefined,
                matchLosses: !isWin ? { increment: 1 } : undefined,
                ratingPoints: { increment: isWin ? 30 : 5 },
                lastActivity: new Date()
            }
        });
        const updatedUser = {
            ...user,
            profile
        };
        return this.mapToEntity(updatedUser);
    }
    async updateTournamentStats(userId, isWin) {
        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: { profile: true }
        });
        if (!user || !user.profile) {
            throw new common_1.NotFoundException('User profile not found');
        }
        // Используем camelCase для имен полей
        const profile = await this.prisma.userProfile.update({
            where: { userId: parseInt(userId) },
            data: {
                tournamentsPlayed: { increment: 1 },
                tournamentsWon: isWin ? { increment: 1 } : undefined,
                ratingPoints: { increment: isWin ? 100 : 20 },
                lastActivity: new Date()
            }
        });
        const updatedUser = {
            ...user,
            profile
        };
        return this.mapToEntity(updatedUser);
    }
    mapToEntity(prismaUser) {
        if (!prismaUser) {
            return null; // Or return a default user or throw exception
        }
        const user = new user_entity_1.UserEntity();
        user.id = prismaUser.id;
        user.telegram_id = prismaUser.telegramId;
        user.username = prismaUser.username;
        user.first_name = prismaUser.firstName;
        user.last_name = prismaUser.lastName;
        user.is_verified = prismaUser.isVerified;
        user.role = prismaUser.role;
        // Map profile if it exists
        if (prismaUser.profile) {
            const profile = new user_profile_entity_1.UserProfileEntity({
                id: prismaUser.profile.id,
                user_id: prismaUser.id,
                avatar_url: prismaUser.profile.avatarUrl,
                city: prismaUser.profile.city,
                country_code: prismaUser.profile.countryCode,
                sport_type: prismaUser.profile.sportType,
                ntrp_rating: prismaUser.profile.ntrpRating,
                rating_points: prismaUser.profile.ratingPoints,
                matches_played: prismaUser.profile.matchesPlayed,
                match_wins: prismaUser.profile.matchWins,
                match_losses: prismaUser.profile.matchLosses,
                tournaments_played: prismaUser.profile.tournamentsPlayed,
                tournaments_won: prismaUser.profile.tournamentsWon,
                last_activity: prismaUser.profile.lastActivity,
                achievements: prismaUser.profile.achievements,
                is_public_profile: prismaUser.profile.isPublicProfile
            });
            // Создаем круговую связь
            profile.user = user;
            user.profile = profile;
        }
        return user;
    }
};
UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersRepository);
exports.UsersRepository = UsersRepository;
