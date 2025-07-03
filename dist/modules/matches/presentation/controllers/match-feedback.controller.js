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
exports.MatchFeedbackController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../../../common/guards/auth.guard"); // Используем AuthGuard вместо JwtAuthGuard
const swagger_1 = require("@nestjs/swagger");
const matches_service_1 = require("../../application/services/matches.service");
const create_feedback_dto_1 = require("../../presentation/dto/create-feedback.dto");
let MatchFeedbackController = class MatchFeedbackController {
    constructor(matchesService) {
        this.matchesService = matchesService;
    }
    async createFeedback(matchId, createFeedbackDto, req) {
        return this.matchesService.createFeedback(matchId, req.user.id, createFeedbackDto);
    }
    async getMatchFeedbacks(matchId) {
        return this.matchesService.getMatchFeedbacks(matchId);
    }
    async getGivenFeedbacks(req, limit) {
        return this.matchesService.getUserGivenFeedbacks(req.user.id, limit || 10);
    }
    async getReceivedFeedbacks(req, limit) {
        return this.matchesService.getUserReceivedFeedbacks(req.user.id, limit || 10);
    }
    async getUserFeedbacks(userId, limit) {
        return this.matchesService.getUserReceivedFeedbacks(userId, limit || 10);
    }
};
exports.MatchFeedbackController = MatchFeedbackController;
__decorate([
    (0, common_1.Post)(':id/feedback'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Оставить отзыв о сопернике после матча' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID матча' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Отзыв успешно создан' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_feedback_dto_1.CreateFeedbackDto, Object]),
    __metadata("design:returntype", Promise)
], MatchFeedbackController.prototype, "createFeedback", null);
__decorate([
    (0, common_1.Get)(':id/feedbacks'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить все отзывы о матче' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID матча' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список отзывов' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchFeedbackController.prototype, "getMatchFeedbacks", null);
__decorate([
    (0, common_1.Get)('feedbacks/given'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить отзывы, оставленные текущим пользователем' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список отзывов' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], MatchFeedbackController.prototype, "getGivenFeedbacks", null);
__decorate([
    (0, common_1.Get)('feedbacks/received'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить отзывы, полученные текущим пользователем' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список отзывов' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], MatchFeedbackController.prototype, "getReceivedFeedbacks", null);
__decorate([
    (0, common_1.Get)('users/:userId/feedbacks'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить публичные отзывы о пользователе' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'ID пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список отзывов' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MatchFeedbackController.prototype, "getUserFeedbacks", null);
exports.MatchFeedbackController = MatchFeedbackController = __decorate([
    (0, swagger_1.ApiTags)('match-feedbacks'),
    (0, common_1.Controller)('matches'),
    __metadata("design:paramtypes", [matches_service_1.MatchesService])
], MatchFeedbackController);
