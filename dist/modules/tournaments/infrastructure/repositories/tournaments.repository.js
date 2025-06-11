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
exports.TournamentsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const tournament_entity_1 = require("../../domain/entities/tournament.entity");
const tournament_match_entity_1 = require("../../domain/entities/tournament-match.entity");
const tournament_enum_1 = require("../../domain/enums/tournament.enum");
const client_1 = require("@prisma/client");
let TournamentsRepository = class TournamentsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        // Проверяем, что фильтры соответствуют ожидаемым Prisma типам
        const prismaFilters = {};
        if (filters) {
            // Добавьте только поддерживаемые поля
            if (filters.status)
                prismaFilters.status = { equals: filters.status };
            if (filters.type)
                prismaFilters.type = { equals: filters.type };
        }
        const tournaments = await this.prisma.tournament.findMany({
            where: prismaFilters,
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
        });
        return tournaments.map(tournament => this.mapToEntity(tournament));
    }
    async findById(id) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id: parseInt(id) },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
        });
        if (!tournament)
            return null;
        return this.mapToEntity(tournament);
    }
    async findByCreator(creatorId) {
        const tournaments = await this.prisma.tournament.findMany({
            where: {
                creatorId: parseInt(creatorId)
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
        });
        return tournaments.map(tournament => this.mapToEntity(tournament));
    }
    async create(userId, createTournamentDto) {
        // Map domain enum to Prisma enum
        const tournamentType = this.mapToPrismaTournamentType(createTournamentDto.type);
        const userIdNum = parseInt(userId);
        // Create tournament with all required fields
        const tournament = await this.prisma.tournament.create({
            data: {
                title: createTournamentDto.title,
                description: createTournamentDto.description,
                type: tournamentType,
                status: tournament_enum_1.TournamentStatus.DRAFT,
                creatorId: userIdNum,
                startDate: createTournamentDto.startDate,
                endDate: createTournamentDto.endDate,
                formatDetails: createTournamentDto.formatDetails || {},
                minPlayers: createTournamentDto.minPlayers,
                maxPlayers: createTournamentDto.maxPlayers,
                currentPlayers: 1,
                isRanked: createTournamentDto.isRanked,
                locationId: createTournamentDto.locationId,
                locationName: createTournamentDto.locationName
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
        });
        // Add creator as player using raw query for many-to-many relation
        await this.prisma.$executeRaw `
      INSERT INTO "_TournamentToUser" ("A", "B") 
      VALUES (${tournament.id}, ${userIdNum})
      ON CONFLICT DO NOTHING
    `;
        return this.mapToEntity(tournament);
    }
    async update(id, updateTournamentDto) {
        // Create a properly typed data object
        const data = {};
        if (updateTournamentDto.title !== undefined)
            data.title = updateTournamentDto.title;
        if (updateTournamentDto.description !== undefined)
            data.description = updateTournamentDto.description;
        if (updateTournamentDto.type !== undefined)
            data.type = this.mapToPrismaTournamentType(updateTournamentDto.type);
        if (updateTournamentDto.status !== undefined)
            data.status = updateTournamentDto.status;
        if (updateTournamentDto.startDate !== undefined)
            data.startDate = updateTournamentDto.startDate;
        if (updateTournamentDto.endDate !== undefined)
            data.endDate = updateTournamentDto.endDate;
        if (updateTournamentDto.formatDetails !== undefined)
            data.formatDetails = updateTournamentDto.formatDetails;
        if (updateTournamentDto.isRanked !== undefined)
            data.isRanked = updateTournamentDto.isRanked;
        if (updateTournamentDto.locationId !== undefined)
            data.locationId = updateTournamentDto.locationId;
        if (updateTournamentDto.locationName !== undefined)
            data.locationName = updateTournamentDto.locationName;
        const tournament = await this.prisma.tournament.update({
            where: { id: parseInt(id) },
            data,
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
        });
        return this.mapToEntity(tournament);
    }
    async delete(id) {
        await this.prisma.tournament.delete({
            where: { id: parseInt(id) },
        });
    }
    async isPlayerRegistered(tournamentId, userId) {
        // Используем raw query для проверки связи many-to-many
        const result = await this.prisma.$queryRaw `
      SELECT COUNT(*) as count
      FROM "_TournamentToUser"
      WHERE "A" = ${parseInt(tournamentId)} AND "B" = ${parseInt(userId)}
    `;
        return result[0].count > 0;
    }
    async addPlayer(tournamentId, userId) {
        // Используем raw queries для связи many-to-many
        // Сначала добавляем связь в pivot таблице
        await this.prisma.$executeRaw `
      INSERT INTO "_TournamentToUser" ("A", "B") 
      VALUES (${parseInt(tournamentId)}, ${parseInt(userId)})
      ON CONFLICT DO NOTHING
    `;
        // Затем обновляем счетчик игроков через raw query
        await this.prisma.$executeRaw `
      UPDATE "Tournament"
      SET "currentPlayers" = "currentPlayers" + 1
      WHERE id = ${parseInt(tournamentId)}
    `;
        // Получаем обновленный турнир
        const tournament = await this.prisma.tournament.findUnique({
            where: { id: parseInt(tournamentId) },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
        });
        if (!tournament) {
            throw new common_1.NotFoundException(`Tournament with ID ${tournamentId} not found`);
        }
        return this.mapToEntity(tournament);
    }
    async removePlayer(tournamentId, userId) {
        // Удаляем связь из pivot таблицы
        await this.prisma.$executeRaw `
      DELETE FROM "_TournamentToUser" 
      WHERE "A" = ${parseInt(tournamentId)} AND "B" = ${parseInt(userId)}
    `;
        // Обновляем счетчик игроков через raw query
        await this.prisma.$executeRaw `
      UPDATE "Tournament"
      SET "currentPlayers" = GREATEST("currentPlayers" - 1, 0)
      WHERE id = ${parseInt(tournamentId)}
    `;
        // Получаем обновленный турнир
        const tournament = await this.prisma.tournament.findUnique({
            where: { id: parseInt(tournamentId) },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
        });
        if (!tournament) {
            throw new common_1.NotFoundException(`Tournament with ID ${tournamentId} not found`);
        }
        return this.mapToEntity(tournament);
    }
    async getTournamentPlayers(tournamentId) {
        // Используем raw query для получения игроков турнира
        const players = await this.prisma.$queryRaw `
      SELECT u.id, u.username, u."firstName", u."lastName", 
             p."avatarUrl", p."ratingPoints" as rating_points
      FROM "User" u
      LEFT JOIN "UserProfile" p ON u.id = p."userId"
      JOIN "_TournamentToUser" tu ON u.id = tu."B"
      WHERE tu."A" = ${parseInt(tournamentId)}
    `;
        return Array.isArray(players) ? players : [];
    }
    // Добавляем недостающие методы
    async getTournamentMatches(tournamentId) {
        // Проверяем существует ли модель TournamentMatch в prisma
        try {
            // Используем raw query
            const matches = await this.prisma.$queryRaw `
        SELECT * FROM "TournamentMatch"
        WHERE "tournamentId" = ${parseInt(tournamentId)}
        ORDER BY "round" ASC, "group" ASC, "createdAt" ASC
      `;
            return matches.map(match => this.mapMatchToEntity(match));
        }
        catch (error) {
            console.error('Error fetching tournament matches:', error);
            return [];
        }
    }
    async getTournamentMatch(matchId) {
        try {
            const match = await this.prisma.$queryRaw `
        SELECT * FROM "TournamentMatch"
        WHERE id = ${parseInt(matchId)}
      `;
            if (!match || match.length === 0)
                return null;
            return this.mapMatchToEntity(match[0]);
        }
        catch (error) {
            console.error('Error fetching tournament match:', error);
            return null;
        }
    }
    async getMatchesByRound(tournamentId, round) {
        try {
            const matches = await this.prisma.$queryRaw `
        SELECT * FROM "TournamentMatch"
        WHERE "tournamentId" = ${parseInt(tournamentId)}
        AND "round" = ${round}
        ORDER BY "createdAt" ASC
      `;
            return matches.map(match => this.mapMatchToEntity(match));
        }
        catch (error) {
            console.error('Error fetching matches by round:', error);
            return [];
        }
    }
    async getMatchByRoundAndPosition(tournamentId, round, position) {
        try {
            const matches = await this.prisma.$queryRaw `
        SELECT * FROM "TournamentMatch"
        WHERE "tournamentId" = ${parseInt(tournamentId)}
        AND "round" = ${round}
        ORDER BY "createdAt" ASC
        OFFSET ${position} LIMIT 1
      `;
            if (!matches || matches.length === 0)
                return null;
            return this.mapMatchToEntity(matches[0]);
        }
        catch (error) {
            console.error('Error fetching match by round and position:', error);
            return null;
        }
    }
    async getGroupMatches(tournamentId) {
        try {
            const matches = await this.prisma.$queryRaw `
        SELECT * FROM "TournamentMatch"
        WHERE "tournamentId" = ${parseInt(tournamentId)}
        AND "group" IS NOT NULL
        ORDER BY "group" ASC, "createdAt" ASC
      `;
            return matches.map(match => this.mapMatchToEntity(match));
        }
        catch (error) {
            console.error('Error fetching group matches:', error);
            return [];
        }
    }
    async getThirdPlaceMatch(tournamentId) {
        try {
            const match = await this.prisma.$queryRaw `
        SELECT * FROM "TournamentMatch"
        WHERE "tournamentId" = ${parseInt(tournamentId)}
        AND "isThirdPlaceMatch" = true
      `;
            if (!match || match.length === 0)
                return null;
            return this.mapMatchToEntity(match[0]);
        }
        catch (error) {
            console.error('Error fetching third place match:', error);
            return null;
        }
    }
    async createMatches(tournamentId, matchesData) {
        const createdMatches = [];
        // Создаем каждый матч отдельно через raw query
        for (const matchData of matchesData) {
            try {
                const round = matchData.round || null;
                const group = matchData.group || null;
                const playerBId = matchData.playerBId || null;
                const court = matchData.court || null;
                const scheduledAt = matchData.scheduledAt ? new Date(matchData.scheduledAt) : null;
                const confirmedBy = matchData.confirmedBy || [];
                const confirmedByJson = JSON.stringify(confirmedBy);
                const isThirdPlaceMatch = matchData.isThirdPlaceMatch || false;
                const result = await this.prisma.$queryRaw `
          INSERT INTO "TournamentMatch" (
            "tournamentId", "round", "group", "playerAId", "playerBId",
            "status", "court", "scheduledAt", "confirmedBy", "isThirdPlaceMatch", "createdAt", "updatedAt"
          )
          VALUES (
            ${parseInt(tournamentId)}, ${round}, ${group}, ${matchData.playerAId}, ${playerBId},
            ${matchData.status}, ${court}, ${scheduledAt}, ${confirmedByJson}::jsonb, ${isThirdPlaceMatch}, NOW(), NOW()
          )
          RETURNING *
        `;
                if (result && result.length > 0) {
                    createdMatches.push(this.mapMatchToEntity(result[0]));
                }
            }
            catch (error) {
                console.error('Error creating match:', error);
            }
        }
        return createdMatches;
    }
    async recordMatchResult(matchId, recordMatchDto) {
        try {
            const result = await this.prisma.$queryRaw `
        UPDATE "TournamentMatch"
        SET 
          "score" = ${recordMatchDto.score},
          "winnerId" = ${recordMatchDto.winnerId},
          "status" = 'FINISHED',
          "updatedAt" = NOW()
        WHERE id = ${parseInt(matchId)}
        RETURNING *
      `;
            if (!result || result.length === 0) {
                throw new common_1.NotFoundException(`Match with ID ${matchId} not found`);
            }
            return this.mapMatchToEntity(result[0]);
        }
        catch (error) {
            console.error('Error recording match result:', error);
            throw error;
        }
    }
    async confirmMatch(matchId, userId) {
        // Получаем текущий матч
        const match = await this.getTournamentMatch(matchId);
        if (!match) {
            throw new common_1.NotFoundException(`Match with ID ${matchId} not found`);
        }
        // Добавляем userId в confirmedBy, если его там еще нет
        const confirmedBy = [...(match.confirmedBy || [])];
        const userIdNum = parseInt(userId);
        if (!confirmedBy.includes(userIdNum)) {
            confirmedBy.push(userIdNum);
        }
        // Обновляем матч
        try {
            const confirmedByJson = JSON.stringify(confirmedBy);
            const result = await this.prisma.$queryRaw `
        UPDATE "TournamentMatch"
        SET 
          "confirmedBy" = ${confirmedByJson}::jsonb,
          "updatedAt" = NOW()
        WHERE id = ${parseInt(matchId)}
        RETURNING *
      `;
            if (!result || result.length === 0) {
                throw new common_1.NotFoundException(`Match with ID ${matchId} not found`);
            }
            return this.mapMatchToEntity(result[0]);
        }
        catch (error) {
            console.error('Error confirming match:', error);
            throw error;
        }
    }
    async updateMatch(matchId, updateData) {
        try {
            // Строим динамический запрос обновления
            let updateQuery = 'UPDATE "TournamentMatch" SET ';
            const updateValues = [];
            const updateFields = [];
            // Добавляем поля для обновления
            if (updateData.playerAId !== undefined) {
                updateFields.push('"playerAId" = $' + (updateValues.length + 1));
                updateValues.push(updateData.playerAId);
            }
            if (updateData.playerBId !== undefined) {
                updateFields.push('"playerBId" = $' + (updateValues.length + 1));
                updateValues.push(updateData.playerBId);
            }
            if (updateData.score !== undefined) {
                updateFields.push('"score" = $' + (updateValues.length + 1));
                updateValues.push(updateData.score);
            }
            if (updateData.winnerId !== undefined) {
                updateFields.push('"winnerId" = $' + (updateValues.length + 1));
                updateValues.push(updateData.winnerId);
            }
            if (updateData.status !== undefined) {
                updateFields.push('"status" = $' + (updateValues.length + 1));
                updateValues.push(updateData.status);
            }
            // Всегда обновляем updatedAt
            updateFields.push('"updatedAt" = NOW()');
            // Завершаем запрос
            updateQuery += updateFields.join(', ');
            updateQuery += ' WHERE id = $' + (updateValues.length + 1);
            updateValues.push(parseInt(matchId));
            updateQuery += ' RETURNING *';
            // Выполняем запрос
            const result = await this.prisma.$queryRawUnsafe(updateQuery, ...updateValues);
            if (!Array.isArray(result) || result.length === 0) {
                throw new common_1.NotFoundException(`Match with ID ${matchId} not found`);
            }
            return this.mapMatchToEntity(result[0]);
        }
        catch (error) {
            console.error('Error updating match:', error);
            throw error;
        }
    }
    async areAllMatchesCompleted(tournamentId) {
        try {
            const count = await this.prisma.$queryRaw `
        SELECT COUNT(*) as count
        FROM "TournamentMatch"
        WHERE "tournamentId" = ${parseInt(tournamentId)}
        AND status <> 'FINISHED'
      `;
            return count[0].count === 0;
        }
        catch (error) {
            console.error('Error checking if all matches are completed:', error);
            return false;
        }
    }
    mapToEntity(data) {
        if (!data)
            return {};
        return new tournament_entity_1.TournamentEntity({
            id: data.id,
            title: data.title,
            description: data.description,
            type: this.mapToDomainTournamentType(data.type),
            status: data.status,
            creatorId: data.creatorId,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            formatDetails: data.formatDetails,
            minPlayers: data.minPlayers,
            maxPlayers: data.maxPlayers,
            currentPlayers: data.currentPlayers,
            isRanked: data.isRanked,
            locationId: data.locationId,
            locationName: data.locationName,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        });
    }
    mapMatchToEntity(data) {
        if (!data)
            return {};
        return new tournament_match_entity_1.TournamentMatchEntity({
            id: data.id,
            tournamentId: data.tournamentId,
            round: data.round,
            group: data.group,
            playerAId: data.playerAId,
            playerBId: data.playerBId,
            score: data.score,
            winnerId: data.winnerId,
            status: data.status,
            court: data.court,
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
            confirmedBy: Array.isArray(data.confirmedBy) ? data.confirmedBy : [],
            isThirdPlaceMatch: data.isThirdPlaceMatch || false,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        });
    }
    // Вспомогательные методы для маппинга между domain enum и строковым представлением для Prisma
    mapToPrismaTournamentType(type) {
        switch (type) {
            case tournament_enum_1.TournamentType.SINGLE_ELIMINATION:
                return client_1.TournamentType.SINGLE_ELIMINATION;
            case tournament_enum_1.TournamentType.GROUPS_PLAYOFF:
                return client_1.TournamentType.GROUPS_PLAYOFF;
            case tournament_enum_1.TournamentType.LEAGUE:
                return client_1.TournamentType.LEAGUE;
            case tournament_enum_1.TournamentType.BLITZ:
                return client_1.TournamentType.BLITZ;
            default:
                return client_1.TournamentType.SINGLE_ELIMINATION;
        }
    }
    mapToDomainTournamentType(type) {
        switch (type) {
            case 'SINGLE_ELIMINATION':
                return tournament_enum_1.TournamentType.SINGLE_ELIMINATION;
            case 'GROUPS_PLAYOFF':
                return tournament_enum_1.TournamentType.GROUPS_PLAYOFF;
            case 'LEAGUE':
                return tournament_enum_1.TournamentType.LEAGUE;
            case 'BLITZ':
                return tournament_enum_1.TournamentType.BLITZ;
            default:
                return tournament_enum_1.TournamentType.SINGLE_ELIMINATION;
        }
    }
};
TournamentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TournamentsRepository);
exports.TournamentsRepository = TournamentsRepository;
