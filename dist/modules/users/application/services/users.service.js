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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../../domain/entities/user.entity");
const users_repository_1 = require("../../infrastructure/repositories/users.repository");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const role_enum_1 = require("../../domain/enums/role.enum");
const ratings_service_1 = require("../../../ratings/ratings.service"); // Добавляем импорт
let UsersService = class UsersService {
    constructor(usersRepository, prisma, ratingsService // Добавляем зависимость
    ) {
        this.usersRepository = usersRepository;
        this.prisma = prisma;
        this.ratingsService = ratingsService;
    }
    async findAll() {
        return this.usersRepository.findAll();
    }
    async findById(id) {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async updateTelegramChatId(userId, telegramChatId) {
        await this.usersRepository.updateTelegramChatId(Number(userId), BigInt(telegramChatId));
    }
    async setReferrer(userId, referrerId) {
        await this.usersRepository.setReferrer(Number(userId), Number(referrerId));
    }
    async findByTelegramId(telegramId) {
        const user = await this.prisma.user.findUnique({
            where: { telegramId },
            include: {
                profile: true
            }
        });
        if (!user) {
            return null;
        }
        // Create entity directly without using repository method
        const entity = new user_entity_1.UserEntity();
        entity.id = user.id;
        entity.telegram_id = user.telegramId;
        entity.username = user.username;
        entity.first_name = user.firstName;
        entity.last_name = user.lastName || undefined;
        entity.is_verified = user.isVerified;
        entity.role = user.role;
        entity.telegramChatId = user.telegramChatId || undefined;
        entity.referredBy = user.referredBy || undefined; // Добавляем поле
        // Map profile if it exists
        if (user.profile) {
            entity.profile = user.profile;
        }
        return entity;
    }
    // Добавляем недостающий метод createFromTelegram
    async createFromTelegram(telegramData) {
        const userData = {
            telegram_id: telegramData.id.toString(),
            username: telegramData.username || `user_${telegramData.id}`,
            first_name: telegramData.first_name,
            last_name: telegramData.last_name || undefined,
            is_verified: false,
            role: role_enum_1.Role.USER,
        };
        const user = await this.create(userData);
        return user;
    }
    // Добавляем недостающий метод updateLastLogin
    async updateLastLogin(userId) {
        await this.prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                profile: {
                    update: {
                        lastActivity: new Date()
                    }
                }
            }
        });
        return this.findById(userId);
    }
    async create(createUserDto) {
        const user = new user_entity_1.UserEntity();
        Object.assign(user, createUserDto);
        const createdUser = await this.usersRepository.create(user);
        return createdUser;
    }
    async update(id, updateUserDto) {
        await this.findById(id);
        return this.usersRepository.update(id, updateUserDto);
    }
    async updateProfile(id, updateProfileDto) {
        await this.findById(id);
        return this.usersRepository.updateProfile(id, updateProfileDto);
    }
    async getRatingHistory(userId) {
        return this.usersRepository.getRatingHistory(userId);
    }
    async getProfileStatistics(userId) {
        const user = await this.findById(userId);
        return {
            matchesPlayed: user.profile.matches_played,
            matchWins: user.profile.match_wins,
            matchLosses: user.profile.match_losses,
            tournamentsPlayed: user.profile.tournaments_played,
            tournamentsWon: user.profile.tournaments_won,
            winRate: user.profile.winRate,
            ratingPoints: user.profile.rating_points,
            lastActivity: user.profile.last_activity
        };
    }
    async getUserAchievements(userId) {
        return this.usersRepository.getUserAchievements(userId);
    }
    async updateMatchStats(userId, isWin) {
        return this.usersRepository.updateMatchStats(userId, isWin);
    }
    async updateTournamentStats(userId, isWin) {
        return this.usersRepository.updateTournamentStats(userId, isWin);
    }
    async addAchievement(userId, achievementKey, achievementData) {
        return this.usersRepository.addAchievement(userId, achievementKey, achievementData);
    }
    async getRecentMatches(userId, limit = 5) {
        return this.usersRepository.getRecentMatches(userId, limit);
    }
    async updateAvatar(userId, file) {
        const avatarUrl = `/uploads/avatars/${file.filename}`;
        return this.usersRepository.updateAvatar(userId, avatarUrl);
    }
    async completeProfileStepOne(userId, profileData) {
        // Проверить существование пользователя
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Сохранить данные первого шага
        const updatedProfile = await this.prisma.userProfile.upsert({
            where: { userId: parseInt(userId) },
            update: {
                city: profileData.city,
                preferredCourt: profileData.preferredCourt,
                dominantHand: profileData.dominantHand,
                preferredPlayTime: profileData.preferredPlayTime,
                playsInTournaments: profileData.playsInTournaments,
                weeklyPlayFrequency: profileData.weeklyPlayFrequency,
                profileStepOneCompleted: true
            },
            create: {
                user: { connect: { id: parseInt(userId) } },
                city: profileData.city,
                preferredCourt: profileData.preferredCourt,
                dominantHand: profileData.dominantHand,
                preferredPlayTime: profileData.preferredPlayTime,
                playsInTournaments: profileData.playsInTournaments,
                weeklyPlayFrequency: profileData.weeklyPlayFrequency,
                profileStepOneCompleted: true
            }
        });
        // Обновить имя/фамилию если предоставлены
        if (profileData.firstName || profileData.lastName) {
            await this.prisma.user.update({
                where: { id: parseInt(userId) },
                data: {
                    firstName: profileData.firstName || user.first_name,
                    lastName: profileData.lastName || user.last_name // исправлено поле
                }
            });
        }
        return {
            status: 'success',
            message: 'Profile step 1 completed',
            profileId: updatedProfile.id
        };
    }
    async completeProfileStepTwo(userId, profileData) {
        // Проверить существование пользователя и завершение первого шага
        const profile = await this.prisma.userProfile.findUnique({
            where: { userId: parseInt(userId) }
        });
        if (!profile) {
            throw new common_1.BadRequestException('Complete step 1 first');
        }
        // Рассчитать начальный рейтинг на основе самооценки
        let initialRating = 0;
        let ntrpEstimate = 0;
        switch (profileData.selfAssessedLevel) {
            case 'BEGINNER':
                initialRating = 1000;
                ntrpEstimate = 2.5;
                break;
            case 'AMATEUR':
                initialRating = 1200;
                ntrpEstimate = 3.0;
                break;
            case 'CONFIDENT':
                initialRating = 1400;
                ntrpEstimate = 4.0;
                break;
            case 'TOURNAMENT':
                initialRating = 1600;
                ntrpEstimate = 5.0;
                break;
            case 'SEMI_PRO':
                initialRating = 1800;
                ntrpEstimate = 5.5;
                break;
            default:
                initialRating = 1400;
                ntrpEstimate = 4.0;
        }
        // Сохранить данные второго шага
        const updatedProfile = await this.prisma.userProfile.update({
            where: { userId: parseInt(userId) },
            data: {
                backhandType: profileData.backhandType,
                preferredSurface: profileData.preferredSurface,
                playingStyle: profileData.playingStyle,
                favoriteShot: profileData.favoriteShot,
                racket: profileData.racket,
                opponentPreference: profileData.opponentPreference,
                selfAssessedLevel: profileData.selfAssessedLevel,
                initialRatingPoints: initialRating,
                ratingPoints: initialRating,
                ntrpRating: ntrpEstimate,
                profileStepTwoCompleted: true
            }
        });
        // Обновляем рейтинг игрока на основе самооценки
        try {
            await this.ratingsService.createDefaultRating(parseInt(userId), {
                skillPoints: initialRating,
                skillRating: ntrpEstimate,
                pointsRating: 1000, // Стартовые очки активности
            });
        }
        catch (error) {
            console.error(`Failed to update rating for user ${userId}:`, error);
        }
        return {
            status: 'success',
            message: 'Profile step 2 completed',
            profileId: updatedProfile.id,
            initialRating: initialRating,
            ntrpEstimate: ntrpEstimate
        };
    }
    async getProfileCompletionStatus(userId) {
        const profile = await this.prisma.userProfile.findUnique({
            where: { userId: parseInt(userId) }
        });
        if (!profile) {
            return {
                stepOneCompleted: false,
                stepTwoCompleted: false,
                profileComplete: false
            };
        }
        return {
            stepOneCompleted: profile.profileStepOneCompleted || false,
            stepTwoCompleted: profile.profileStepTwoCompleted || false,
            profileComplete: (profile.profileStepOneCompleted && profile.profileStepTwoCompleted) || false
        };
    }
    // Добавьте эти методы в класс UsersService
    async updateUserLocation(userId, locationData) {
        return this.usersRepository.updateUser(userId, {
            countryCode: locationData.countryCode,
            cityId: locationData.cityId,
            sportId: locationData.sportId,
        });
    }
    async getUserWithLocation(userId) {
        return this.usersRepository.findByIdWithLocation(userId);
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        prisma_service_1.PrismaService,
        ratings_service_1.RatingsService // Добавляем зависимость
    ])
], UsersService);
exports.UsersService = UsersService;
