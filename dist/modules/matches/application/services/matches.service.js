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
var MatchesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const matches_repository_1 = require("../../infrastructure/repositories/matches.repository");
const users_service_1 = require("../../../users/application/services/users.service");
const match_enum_1 = require("../../domain/enums/match.enum");
const achievements_service_1 = require("../../../achievements/application/services/achievements.service");
const ratings_service_1 = require("../../../ratings/ratings.service"); // Добавляем импорт
const prisma_service_1 = require("../../../../prisma/prisma.service");
let MatchesService = MatchesService_1 = class MatchesService {
    constructor(matchesRepository, usersService, achievementsService, ratingsService, // Добавляем зависимость
    prisma) {
        this.matchesRepository = matchesRepository;
        this.usersService = usersService;
        this.achievementsService = achievementsService;
        this.ratingsService = ratingsService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(MatchesService_1.name);
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
        this.logger.log(`Creating match for creator: ${userId}`);
        const creator = await this.usersService.findById(userId);
        if (!creator) {
            throw new common_1.NotFoundException('Создатель матча не найден');
        }
        const match = await this.matchesRepository.create(userId, createMatchDto);
        // Безопасно проверяем достижения - исправлено
        try {
            await this.achievementsService.checkAndAwardAchievements(userId, 'match_played');
        }
        catch (achievementError) {
            this.logger.error(`Failed to check achievements for match creation by user ${userId}:`, achievementError);
        }
        return match;
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
    async recordScore(matchId, userId, recordScoreDto) {
        this.logger.log(`Recording score for match ${matchId} by user ${userId}`);
        const match = await this.matchesRepository.findById(matchId);
        if (!match) {
            throw new common_1.NotFoundException('Матч не найден');
        }
        if (match.state !== match_enum_1.MatchState.CONFIRMED) {
            throw new common_1.BadRequestException('Результат можно записать только для подтвержденного матча');
        }
        const canRecord = match.creatorId === parseInt(userId) ||
            match.player1Id === parseInt(userId) ||
            match.player2Id === parseInt(userId);
        if (!canRecord) {
            throw new common_1.ForbiddenException('Вы не можете записать результат этого матча');
        }
        // Обновляем матч через существующий метод
        const updateDto = {
            score: recordScoreDto.score,
            state: match_enum_1.MatchState.FINISHED
        };
        const updatedMatch = await this.matchesRepository.update(matchId, updateDto);
        // Определяем победителя и проигравшего
        const winnerId = this.determineWinner(recordScoreDto.score, updatedMatch);
        const loserId = this.determineLoser(winnerId, updatedMatch);
        if (winnerId && loserId) {
            // Обновляем рейтинги игроков
            try {
                const ratingResult = await this.ratingsService.recalculateAfterMatch({
                    winnerId,
                    loserId,
                    matchId: parseInt(matchId),
                    score: recordScoreDto.score,
                    isRanked: true, // Можно сделать настраиваемым
                });
                this.logger.log(`Rating updated: Winner ${winnerId} (+${ratingResult.winner.skillPointsChange} skill, +${ratingResult.winner.pointsRatingChange} points)`);
                this.logger.log(`Rating updated: Loser ${loserId} (${ratingResult.loser.skillPointsChange} skill, +${ratingResult.loser.pointsRatingChange} points)`);
            }
            catch (error) {
                this.logger.error(`Failed to update ratings for match ${matchId}:`, error);
                // Не прерываем процесс записи результата из-за ошибки рейтинга
            }
        }
        // Обновляем статистику игроков
        await this.updatePlayerStats(updatedMatch, recordScoreDto);
        // Безопасно проверяем достижения
        try {
            if (winnerId) {
                await this.achievementsService.checkAndAwardAchievements(winnerId.toString(), 'match_won');
            }
            // Проверяем достижения для всех участников
            const playerIds = [updatedMatch.creatorId, updatedMatch.player1Id, updatedMatch.player2Id]
                .filter(id => id !== null && id !== undefined)
                .map(id => id.toString());
            for (const playerId of playerIds) {
                await this.achievementsService.checkAndAwardAchievements(playerId, 'match_played');
            }
        }
        catch (achievementError) {
            this.logger.error(`Failed to check achievements for match result ${matchId}:`, achievementError);
        }
        return updatedMatch;
    }
    determineWinner(score, match) {
        // Улучшенная логика определения победителя по счету
        if (!score)
            return null;
        // Парсим счет вида "6-4 6-2" или "6-4, 6-2"
        const sets = score.split(/[,\s]+/).filter(set => set.includes('-'));
        let player1Sets = 0;
        let player2Sets = 0;
        for (const set of sets) {
            const [games1, games2] = set.split('-').map(g => parseInt(g.trim()));
            if (games1 > games2) {
                player1Sets++;
            }
            else if (games2 > games1) {
                player2Sets++;
            }
        }
        // Определяем победителя (тот, кто выиграл больше сетов)
        if (player1Sets > player2Sets) {
            return match.player1Id ?? match.creatorId;
        }
        else if (player2Sets > player1Sets) {
            return match.player2Id ?? (match.player1Id === match.creatorId ? null : match.creatorId);
        }
        return null; // Ничья или не удалось определить
    }
    determineLoser(winnerId, match) {
        if (!winnerId)
            return null;
        const allPlayers = [match.creatorId, match.player1Id, match.player2Id]
            .filter(id => id !== null && id !== undefined);
        return allPlayers.find(id => id !== winnerId) || null;
    }
    async updatePlayerStats(match, result) {
        try {
            const playerIds = [match.creatorId, match.player1Id, match.player2Id]
                .filter(id => id !== null && id !== undefined);
            for (const playerId of playerIds) {
                if (playerId) {
                    // Упрощенная логика - можно улучшить
                    const isWinner = result.score.includes('6-');
                    await this.usersService.updateMatchStats(playerId.toString(), isWinner);
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to update player stats for match ${match.id}:`, error);
        }
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
    // Добавить следующие методы в класс MatchesService
    /**
     * Получить последние матчи пользователя
     */
    async getUserRecentMatches(userId, limit = 5) {
        const userIdInt = parseInt(userId);
        const matches = await this.prisma.match.findMany({
            where: {
                OR: [
                    { creatorId: userIdInt },
                    { player1Id: userIdInt },
                    { player2Id: userIdInt }
                ],
                state: match_enum_1.MatchState.FINISHED
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                creator: {
                    select: { id: true, firstName: true, lastName: true, username: true }
                }
            }
        });
        return matches.map((match) => {
            return {
                id: match.id,
                date: match.matchDate || match.createdAt,
                score: match.score,
                result: match.winnerId === userIdInt ? 'WIN' : 'LOSS',
                opponentName: this.getOpponentName(match, userIdInt)
            };
        });
    }
    /**
     * Получить все матчи пользователя с фильтрацией и пагинацией
     */
    async getUserMatches(userId, options = {}) {
        const userIdInt = parseInt(userId);
        const { status, limit = 20, offset = 0 } = options;
        // Построение фильтра состояния
        let stateFilter = {};
        if (status) {
            stateFilter = { state: status };
        }
        const matches = await this.prisma.match.findMany({
            where: {
                OR: [
                    { creatorId: userIdInt },
                    { player1Id: userIdInt },
                    { player2Id: userIdInt }
                ],
                ...stateFilter
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
            include: {
                creator: {
                    select: { id: true, firstName: true, lastName: true, username: true }
                }
            }
        });
        return matches.map((match) => {
            return {
                id: match.id,
                date: match.matchDate || match.createdAt,
                score: match.score,
                state: match.state,
                result: match.winnerId === userIdInt ? 'WIN' : match.state === match_enum_1.MatchState.FINISHED ? 'LOSS' : 'PENDING',
                opponentName: this.getOpponentName(match, userIdInt)
            };
        });
    }
    /**
     * Пригласить пользователя на матч
     */
    async inviteToMatch(creatorId, targetId, inviteData) {
        const creator = await this.usersService.findById(creatorId);
        if (!creator) {
            throw new common_1.NotFoundException('Создатель матча не найден');
        }
        const target = await this.usersService.findById(targetId);
        if (!target) {
            throw new common_1.NotFoundException('Приглашаемый игрок не найден');
        }
        // Создаём новый матч с приглашением
        const match = await this.matchesRepository.create(creatorId, {
            type: match_enum_1.MatchType.ONE_ON_ONE,
            player1Id: parseInt(creatorId),
            player2Id: parseInt(targetId),
            location: inviteData.location,
            matchDate: inviteData.dateTime,
            description: inviteData.comment || 'Приглашение на матч',
            state: match_enum_1.MatchState.PENDING
        });
        // Отправляем уведомление пользователю (можно добавить)
        return match;
    }
    /**
     * Вспомогательный метод для получения имени оппонента
     */
    getOpponentName(match, userId) {
        let opponentId = null;
        if (match.creatorId === userId && match.player1Id) {
            opponentId = match.player1Id;
        }
        else if (match.creatorId === userId && match.player2Id) {
            opponentId = match.player2Id;
        }
        else if (match.player1Id === userId && match.player2Id) {
            opponentId = match.player2Id;
        }
        else if (match.player2Id === userId && match.player1Id) {
            opponentId = match.player1Id;
        }
        else if (match.player1Id === userId || match.player2Id === userId) {
            opponentId = match.creatorId;
        }
        // Находим имя оппонента (если есть)
        if (opponentId && opponentId === match.creatorId && match.creator) {
            return `${match.creator.firstName} ${match.creator.lastName || ''}`.trim();
        }
        // Для случаев, где данных недостаточно
        return 'Неизвестный игрок';
    }
};
MatchesService = MatchesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [matches_repository_1.MatchesRepository,
        users_service_1.UsersService,
        achievements_service_1.AchievementsService,
        ratings_service_1.RatingsService,
        prisma_service_1.PrismaService])
], MatchesService);
exports.MatchesService = MatchesService;
