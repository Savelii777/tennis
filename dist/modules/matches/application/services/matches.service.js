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
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const matches_repository_1 = require("../../infrastructure/repositories/matches.repository");
const match_enum_1 = require("../../domain/enums/match.enum");
let MatchesService = class MatchesService {
    constructor(matchesRepository) {
        this.matchesRepository = matchesRepository;
    }
    async findAll() {
        return this.matchesRepository.findAll();
    }
    async findById(id) {
        const match = await this.matchesRepository.findById(id);
        if (!match) {
            throw new common_1.NotFoundException(`Match with ID ${id} not found`);
        }
        return match;
    }
    async findByCreator(creatorId) {
        return this.matchesRepository.findByCreator(creatorId);
    }
    async create(userId, createMatchDto) {
        return this.matchesRepository.create(userId, createMatchDto);
    }
    async update(id, userId, updateMatchDto) {
        const match = await this.matchesRepository.findById(id);
        if (!match) {
            throw new common_1.NotFoundException(`Match with ID ${id} not found`);
        }
        if (match.creatorId !== parseInt(userId)) {
            throw new common_1.BadRequestException('You can only update matches you created');
        }
        return this.matchesRepository.update(id, updateMatchDto);
    }
    async confirmMatch(id, userId) {
        const match = await this.matchesRepository.findById(id);
        if (!match) {
            throw new common_1.NotFoundException(`Match with ID ${id} not found`);
        }
        if (match.state !== match_enum_1.MatchState.PENDING) {
            throw new common_1.BadRequestException('Only pending matches can be confirmed');
        }
        const updateDto = { state: match_enum_1.MatchState.CONFIRMED };
        return this.matchesRepository.update(id, updateDto);
    }
    async cancelMatch(id, userId) {
        const match = await this.matchesRepository.findById(id);
        if (!match) {
            throw new common_1.NotFoundException(`Match with ID ${id} not found`);
        }
        if (match.creatorId !== parseInt(userId) &&
            match.player1Id !== parseInt(userId) &&
            match.player2Id !== parseInt(userId)) {
            throw new common_1.BadRequestException('You are not a participant in this match');
        }
        if (match.state === match_enum_1.MatchState.FINISHED) {
            throw new common_1.BadRequestException('Finished matches cannot be cancelled');
        }
        const updateDto = { state: match_enum_1.MatchState.CANCELLED };
        return this.matchesRepository.update(id, updateDto);
    }
    async recordScore(id, userId, recordScoreDto) {
        const match = await this.matchesRepository.findById(id);
        if (!match) {
            throw new common_1.NotFoundException(`Match with ID ${id} not found`);
        }
        if (match.creatorId !== parseInt(userId)) {
            throw new common_1.BadRequestException('Only match creator can record scores');
        }
        if (match.state !== match_enum_1.MatchState.CONFIRMED) {
            throw new common_1.BadRequestException('Only confirmed matches can have scores recorded');
        }
        const updateDto = {
            state: match_enum_1.MatchState.FINISHED,
            score: recordScoreDto.score
        };
        return this.matchesRepository.update(id, updateDto);
    }
    async delete(id, userId) {
        const match = await this.matchesRepository.findById(id);
        if (!match) {
            throw new common_1.NotFoundException(`Match with ID ${id} not found`);
        }
        if (match.creatorId !== parseInt(userId)) {
            throw new common_1.BadRequestException('Only match creator can delete matches');
        }
        return this.matchesRepository.delete(id);
    }
};
MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [matches_repository_1.MatchesRepository])
], MatchesService);
exports.MatchesService = MatchesService;
