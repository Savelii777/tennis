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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ratings_service_1 = require("./ratings.service");
const auth_guard_1 = require("../../common/guards/auth.guard");
let RatingsController = class RatingsController {
    constructor(ratingsService) {
        this.ratingsService = ratingsService;
    }
    async getPlayerRating(userId) {
        return this.ratingsService.getRatingForUser(userId);
    }
    async getPlayerStats(userId) {
        return this.ratingsService.getPlayerStats(userId);
    }
    async getSkillLeaderboard(limit) {
        const limitNum = limit ? parseInt(limit) : 10;
        return this.ratingsService.getTopPlayersBySkill(limitNum);
    }
    async getPointsLeaderboard(limit) {
        const limitNum = limit ? parseInt(limit) : 10;
        return this.ratingsService.getTopPlayersByPoints(limitNum);
    }
    async recalculateRating(matchResult) {
        return this.ratingsService.recalculateAfterMatch(matchResult);
    }
    async addTournamentPoints(data) {
        return this.ratingsService.addTournamentPoints(data.userId, data.points, data.reason);
    }
    async createSeason(data) {
        return this.ratingsService.createSeason({
            title: data.title,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            description: data.description,
        });
    }
    async resetPointsRating(seasonId) {
        await this.ratingsService.resetPointsRatingForSeason(seasonId);
        return { message: 'Points rating reset successfully' };
    }
    async getCurrentSeason() {
        return this.ratingsService.getCurrentSeason();
    }
};
__decorate([
    (0, common_1.Get)(':userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить рейтинг игрока' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Рейтинг игрока' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "getPlayerRating", null);
__decorate([
    (0, common_1.Get)(':userId/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить подробную статистику игрока' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Подробная статистика игрока' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "getPlayerStats", null);
__decorate([
    (0, common_1.Get)('leaderboard/skill'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить топ игроков по skill rating' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Топ игроков по skill rating' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "getSkillLeaderboard", null);
__decorate([
    (0, common_1.Get)('leaderboard/points'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить топ игроков по points rating' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Топ игроков по points rating' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "getPointsLeaderboard", null);
__decorate([
    (0, common_1.Post)('recalculate'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Пересчитать рейтинг после матча' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Рейтинг пересчитан' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "recalculateRating", null);
__decorate([
    (0, common_1.Post)('tournament-points'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Добавить очки за турнир' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Очки добавлены' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "addTournamentPoints", null);
__decorate([
    (0, common_1.Post)('seasons'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Создать новый сезон' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Сезон создан' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "createSeason", null);
__decorate([
    (0, common_1.Post)('seasons/:seasonId/reset-points'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Сбросить P-Rating для сезона (только админ)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'P-Rating сброшен' }),
    __param(0, (0, common_1.Param)('seasonId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "resetPointsRating", null);
__decorate([
    (0, common_1.Get)('seasons/current'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить текущий сезон' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Текущий сезон' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "getCurrentSeason", null);
RatingsController = __decorate([
    (0, swagger_1.ApiTags)('ratings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ratings'),
    __metadata("design:paramtypes", [ratings_service_1.RatingsService])
], RatingsController);
exports.RatingsController = RatingsController;
