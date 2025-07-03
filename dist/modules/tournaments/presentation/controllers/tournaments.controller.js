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
exports.TournamentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tournaments_service_1 = require("../../application/services/tournaments.service");
const create_tournament_dto_1 = require("../../application/dto/create-tournament.dto");
const update_tournament_dto_1 = require("../../application/dto/update-tournament.dto");
const record_tournament_match_dto_1 = require("../../application/dto/record-tournament-match.dto");
const auth_guard_1 = require("../../../../common/guards/auth.guard");
let TournamentsController = class TournamentsController {
    constructor(tournamentsService) {
        this.tournamentsService = tournamentsService;
    }
    async findAll(filters) {
        return this.tournamentsService.findAll(filters);
    }
    async findOne(id) {
        return this.tournamentsService.findById(id);
    }
    async create(createTournamentDto, req) {
        const userId = req.user.id;
        return this.tournamentsService.create(userId, createTournamentDto);
    }
    async update(id, updateTournamentDto, req) {
        const userId = req.user.id;
        return this.tournamentsService.update(id, userId, updateTournamentDto);
    }
    async remove(id, req) {
        const userId = req.user.id;
        await this.tournamentsService.delete(id, userId);
    }
    async joinTournament(id, req) {
        const userId = req.user.id;
        return this.tournamentsService.joinTournament(id, userId);
    }
    async leaveTournament(id, req) {
        const userId = req.user.id;
        return this.tournamentsService.leaveTournament(id, userId);
    }
    async getTournamentPlayers(id) {
        await this.tournamentsService.findById(id);
        return this.tournamentsService['tournamentsRepository'].getTournamentPlayers(id);
    }
    async startTournament(id, req) {
        const userId = req.user.id;
        return this.tournamentsService.startTournament(id, userId);
    }
    async completeTournament(id, req) {
        const userId = req.user.id;
        return this.tournamentsService.completeTournament(id, userId);
    }
    async getTournamentMatches(id) {
        return this.tournamentsService.getTournamentMatches(id);
    }
    async getTournamentMatch(id, matchId) {
        return this.tournamentsService.getTournamentMatch(id, matchId);
    }
    async recordMatchResult(id, matchId, recordMatchDto, req) {
        const userId = req.user.id;
        return this.tournamentsService.recordMatchResult(id, matchId, userId, recordMatchDto);
    }
    async getTournamentStandings(id) {
        return this.tournamentsService.getTournamentStandings(id);
    }
};
exports.TournamentsController = TournamentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tournaments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all tournaments.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tournament by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return tournament by ID.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tournament not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tournament' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tournament created successfully.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tournament_dto_1.CreateTournamentDto, Object]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update tournament' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tournament updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tournament not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tournament_dto_1.UpdateTournamentDto, Object]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete tournament' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Tournament deleted successfully.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/players'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Join tournament' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Joined tournament successfully.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "joinTournament", null);
__decorate([
    (0, common_1.Delete)(':id/players'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Leave tournament' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Left tournament successfully.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "leaveTournament", null);
__decorate([
    (0, common_1.Get)(':id/players'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tournament players' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return tournament players.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getTournamentPlayers", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Start tournament' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tournament started successfully.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "startTournament", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Complete tournament' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tournament completed successfully.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "completeTournament", null);
__decorate([
    (0, common_1.Get)(':id/matches'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tournament matches' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return tournament matches.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getTournamentMatches", null);
__decorate([
    (0, common_1.Get)(':id/matches/:matchId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tournament match details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return tournament match details.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getTournamentMatch", null);
__decorate([
    (0, common_1.Post)(':id/matches/:matchId/result'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Record match result' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Match result recorded successfully.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('matchId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, record_tournament_match_dto_1.RecordTournamentMatchDto, Object]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "recordMatchResult", null);
__decorate([
    (0, common_1.Get)(':id/standings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tournament standings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return tournament standings.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getTournamentStandings", null);
exports.TournamentsController = TournamentsController = __decorate([
    (0, swagger_1.ApiTags)('tournaments'),
    (0, common_1.Controller)('tournaments'),
    __metadata("design:paramtypes", [tournaments_service_1.TournamentsService])
], TournamentsController);
