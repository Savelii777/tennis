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
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
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
    async findByTelegramId(telegramId) {
        return this.usersRepository.findByTelegramId(telegramId);
    }
    async create(createUserDto) {
        const user = new user_entity_1.UserEntity();
        Object.assign(user, createUserDto);
        return this.usersRepository.create(user);
    }
    async update(id, updateUserDto) {
        await this.findById(id); // Will throw if not found
        return this.usersRepository.update(id, updateUserDto);
    }
    async updateProfile(id, updateProfileDto) {
        await this.findById(id); // Will throw if not found
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
        // Upload logic for file storage
        // For this implementation, assume file is saved and URL is generated
        const avatarUrl = `/uploads/avatars/${file.filename}`;
        return this.usersRepository.updateAvatar(userId, avatarUrl);
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], UsersService);
exports.UsersService = UsersService;
