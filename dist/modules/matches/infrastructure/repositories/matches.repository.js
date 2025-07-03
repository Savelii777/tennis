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
exports.MatchesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const match_entity_1 = require("../../domain/entities/match.entity");
let MatchesRepository = class MatchesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const matches = await this.prisma.match.findMany();
        return matches.map(match => this.mapToEntity(match));
    }
    async findById(id) {
        const match = await this.prisma.match.findUnique({
            where: { id: parseInt(id) },
        });
        return match ? this.mapToEntity(match) : null;
    }
    async findByCreator(creatorId) {
        const matches = await this.prisma.match.findMany({
            where: { creatorId: parseInt(creatorId) },
        });
        return matches.map(match => this.mapToEntity(match));
    }
    async create(userId, createMatchDto) {
        const match = await this.prisma.match.create({
            data: {
                creatorId: parseInt(userId),
                player1Id: createMatchDto.player1Id,
                player2Id: createMatchDto.player2Id,
                optionalId: createMatchDto.optionalId,
                type: createMatchDto.type,
                state: createMatchDto.state ?? 'PENDING',
                updatedAt: new Date(),
            },
        });
        return this.mapToEntity(match);
    }
    async update(id, updateMatchDto) {
        const match = await this.prisma.match.update({
            where: { id: parseInt(id) },
            data: {
                ...updateMatchDto,
                updatedAt: new Date(),
            },
        });
        return this.mapToEntity(match);
    }
    async delete(id) {
        await this.prisma.match.delete({
            where: { id: parseInt(id) },
        });
    }
    mapToEntity(data) {
        return new match_entity_1.MatchEntity({
            id: data.id,
            creatorId: data.creatorId,
            player1Id: data.player1Id,
            player2Id: data.player2Id,
            optionalId: data.optionalId,
            type: data.type,
            state: data.state,
            score: data.score,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
};
exports.MatchesRepository = MatchesRepository;
exports.MatchesRepository = MatchesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MatchesRepository);
