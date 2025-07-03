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
exports.MatchesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const matches_service_1 = require("../../application/services/matches.service");
const create_match_dto_1 = require("../../application/dto/create-match.dto");
const update_match_dto_1 = require("../../application/dto/update-match.dto");
const record_score_dto_1 = require("../../application/dto/record-score.dto");
const match_entity_1 = require("../../domain/entities/match.entity");
const auth_guard_1 = require("../../../../common/guards/auth.guard");
let MatchesController = class MatchesController {
    constructor(matchesService) {
        this.matchesService = matchesService;
    }
    async findAll() {
        return this.matchesService.findAll();
    }
    async findByCreator(req) {
        return this.matchesService.findByCreator(req.user.id);
    }
    async findOne(id) {
        return this.matchesService.findById(id);
    }
    async create(req, createMatchDto) {
        return this.matchesService.create(req.user.id, createMatchDto);
    }
    async update(id, req, updateMatchDto) {
        return this.matchesService.update(id, req.user.id, updateMatchDto);
    }
    async confirmMatch(id, req) {
        return this.matchesService.confirmMatch(id, req.user.id);
    }
    async recordScore(id, req, recordScoreDto) {
        return this.matchesService.recordScore(id, req.user.id, recordScoreDto);
    }
    async cancelMatch(id, req) {
        return this.matchesService.cancelMatch(id, req.user.id);
    }
    async delete(id, req) {
        return this.matchesService.delete(id, req.user.id);
    }
    async getMatchDetails(id) {
        return this.matchesService.getMatchDetails(id);
    }
};
exports.MatchesController = MatchesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all matches' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of matches', type: [match_entity_1.MatchEntity] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get matches created by current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of user matches', type: [match_entity_1.MatchEntity] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "findByCreator", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a match by id' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The match', type: match_entity_1.MatchEntity }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new match' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The match has been created', type: match_entity_1.MatchEntity }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_match_dto_1.CreateMatchDto]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The match has been updated', type: match_entity_1.MatchEntity }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_match_dto_1.UpdateMatchDto]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm a match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The match has been confirmed', type: match_entity_1.MatchEntity }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "confirmMatch", null);
__decorate([
    (0, common_1.Put)(':id/score'),
    (0, swagger_1.ApiOperation)({ summary: 'Record score for a match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Score has been recorded', type: match_entity_1.MatchEntity }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, record_score_dto_1.RecordScoreDto]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "recordScore", null);
__decorate([
    (0, common_1.Delete)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The match has been cancelled', type: match_entity_1.MatchEntity }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "cancelMatch", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The match has been deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/details'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить детальную информацию о матче' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID матча' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Детальная информация о матче' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "getMatchDetails", null);
exports.MatchesController = MatchesController = __decorate([
    (0, swagger_1.ApiTags)('matches'),
    (0, common_1.Controller)('matches'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [matches_service_1.MatchesService])
], MatchesController);
