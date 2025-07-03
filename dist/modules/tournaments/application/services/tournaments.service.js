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
var TournamentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentsService = void 0;
const common_1 = require("@nestjs/common");
const tournaments_repository_1 = require("../../infrastructure/repositories/tournaments.repository");
const tournament_enum_1 = require("../../domain/enums/tournament.enum");
const users_service_1 = require("../../../users/application/services/users.service");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let TournamentsService = TournamentsService_1 = class TournamentsService {
    constructor(tournamentsRepository, usersService, prisma) {
        this.tournamentsRepository = tournamentsRepository;
        this.usersService = usersService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(TournamentsService_1.name);
    }
    async findAll(filters) {
        this.logger.log(`🔍 TournamentsService.findAll вызван с фильтрами: ${JSON.stringify(filters)}`);
        try {
            const result = await this.tournamentsRepository.findAll(filters);
            this.logger.log(`📊 TournamentsRepository.findAll вернул: ${JSON.stringify(result, null, 2)}`);
            this.logger.log(`📏 Тип результата: ${typeof result}`);
            this.logger.log(`📦 Это массив? ${Array.isArray(result)}`);
            if (result && typeof result === 'object' && !Array.isArray(result)) {
                this.logger.log(`🔑 Ключи объекта результата: ${Object.keys(result)}`);
            }
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Ошибка в TournamentsService.findAll: ${error}`);
            throw error;
        }
    }
    async findById(id) {
        const tournament = await this.tournamentsRepository.findById(id);
        if (!tournament) {
            throw new common_1.NotFoundException(`Tournament with ID ${id} not found`);
        }
        return tournament;
    }
    async findByCreator(creatorId) {
        return this.tournamentsRepository.findByCreator(creatorId);
    }
    async create(userId, createTournamentDto) {
        if (new Date(createTournamentDto.startDate) < new Date()) {
            throw new common_1.BadRequestException('Tournament start date must be in the future');
        }
        if (new Date(createTournamentDto.endDate) <= new Date(createTournamentDto.startDate)) {
            throw new common_1.BadRequestException('Tournament end date must be after start date');
        }
        return this.tournamentsRepository.create(userId, createTournamentDto);
    }
    async update(id, userId, updateTournamentDto) {
        const tournament = await this.findById(id);
        if (tournament.creatorId !== parseInt(userId)) {
            throw new common_1.ForbiddenException('You are not authorized to update this tournament');
        }
        if (tournament.status === tournament_enum_1.TournamentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot modify a completed tournament');
        }
        return this.tournamentsRepository.update(id, updateTournamentDto);
    }
    async delete(id, userId) {
        const tournament = await this.findById(id);
        if (tournament.creatorId !== parseInt(userId)) {
            throw new common_1.ForbiddenException('You are not authorized to delete this tournament');
        }
        if (tournament.status !== tournament_enum_1.TournamentStatus.DRAFT) {
            throw new common_1.BadRequestException('Cannot delete an active or completed tournament');
        }
        return this.tournamentsRepository.delete(id);
    }
    async joinTournament(tournamentId, userId) {
        const tournament = await this.findById(tournamentId);
        if (tournament.status !== tournament_enum_1.TournamentStatus.DRAFT) {
            throw new common_1.BadRequestException('Tournament is not open for registration');
        }
        if (tournament.currentPlayers >= tournament.maxPlayers) {
            throw new common_1.BadRequestException('Tournament is already full');
        }
        const isRegistered = await this.tournamentsRepository.isPlayerRegistered(tournamentId, userId);
        if (isRegistered) {
            throw new common_1.BadRequestException('You are already registered for this tournament');
        }
        return this.tournamentsRepository.addPlayer(tournamentId, userId);
    }
    async leaveTournament(tournamentId, userId) {
        const tournament = await this.findById(tournamentId);
        if (tournament.status !== tournament_enum_1.TournamentStatus.DRAFT) {
            throw new common_1.BadRequestException('Cannot leave an active or completed tournament');
        }
        const isRegistered = await this.tournamentsRepository.isPlayerRegistered(tournamentId, userId);
        if (!isRegistered) {
            throw new common_1.BadRequestException('You are not registered for this tournament');
        }
        return this.tournamentsRepository.removePlayer(tournamentId, userId);
    }
    async startTournament(id, userId) {
        const tournament = await this.findById(id);
        if (tournament.creatorId !== parseInt(userId)) {
            throw new common_1.ForbiddenException('You are not authorized to start this tournament');
        }
        if (tournament.status !== tournament_enum_1.TournamentStatus.DRAFT) {
            throw new common_1.BadRequestException('Tournament is already active or completed');
        }
        if (tournament.currentPlayers < tournament.minPlayers) {
            throw new common_1.BadRequestException(`Tournament requires at least ${tournament.minPlayers} players to start`);
        }
        await this.generateInitialMatches(tournament);
        return this.tournamentsRepository.update(id, { status: tournament_enum_1.TournamentStatus.ACTIVE });
    }
    async completeTournament(id, userId) {
        const tournament = await this.findById(id);
        if (tournament.creatorId !== parseInt(userId)) {
            throw new common_1.ForbiddenException('You are not authorized to complete this tournament');
        }
        if (tournament.status !== tournament_enum_1.TournamentStatus.ACTIVE) {
            throw new common_1.BadRequestException('Tournament is not active');
        }
        const allMatchesCompleted = await this.tournamentsRepository.areAllMatchesCompleted(id);
        if (!allMatchesCompleted) {
            throw new common_1.BadRequestException('All tournament matches must be completed first');
        }
        await this.processTournamentCompletion(tournament);
        return this.tournamentsRepository.update(id, { status: tournament_enum_1.TournamentStatus.COMPLETED });
    }
    async getTournamentMatches(tournamentId) {
        await this.findById(tournamentId);
        return this.tournamentsRepository.getTournamentMatches(tournamentId);
    }
    async getTournamentMatch(tournamentId, matchId) {
        await this.findById(tournamentId);
        const match = await this.tournamentsRepository.getTournamentMatch(matchId);
        if (!match || match.tournamentId !== parseInt(tournamentId)) {
            throw new common_1.NotFoundException(`Match with ID ${matchId} not found in tournament ${tournamentId}`);
        }
        return match;
    }
    async recordMatchResult(tournamentId, matchId, userId, recordMatchDto) {
        const tournament = await this.findById(tournamentId);
        const match = await this.getTournamentMatch(tournamentId, matchId);
        if (match.status === tournament_enum_1.MatchStatus.FINISHED || match.score) {
            throw new common_1.BadRequestException('Match result has already been recorded');
        }
        const isParticipant = match.playerAId === parseInt(userId) || match.playerBId === parseInt(userId);
        const isCreator = tournament.creatorId === parseInt(userId);
        if (!isParticipant && !isCreator) {
            throw new common_1.ForbiddenException('Only participants or tournament creator can record results');
        }
        if (isCreator) {
            const result = await this.tournamentsRepository.recordMatchResult(matchId, recordMatchDto);
            if (tournament.status === tournament_enum_1.TournamentStatus.ACTIVE) {
                await this.processNextStageMatch(tournament, match, recordMatchDto.winnerId);
            }
            if (tournament.isRanked) {
                const loserId = recordMatchDto.winnerId === match.playerAId ? match.playerBId : match.playerAId;
                await this.usersService.updateMatchStats(recordMatchDto.winnerId.toString(), true);
                await this.usersService.updateMatchStats(loserId.toString(), false);
            }
            return result;
        }
        else {
            return this.tournamentsRepository.confirmMatch(matchId, userId);
        }
    }
    async getTournamentStandings(tournamentId) {
        const tournament = await this.findById(tournamentId);
        switch (tournament.type) {
            case tournament_enum_1.TournamentType.SINGLE_ELIMINATION:
                return this.getSingleEliminationStandings(tournament);
            case tournament_enum_1.TournamentType.GROUPS_PLAYOFF:
                return this.getGroupsPlayoffStandings(tournament);
            case tournament_enum_1.TournamentType.LEAGUE:
                return this.getLeagueStandings(tournament);
            case tournament_enum_1.TournamentType.BLITZ:
                return this.getBlitzStandings(tournament);
            default:
                throw new common_1.BadRequestException(`Unsupported tournament type: ${tournament.type}`);
        }
    }
    async generateInitialMatches(tournament) {
        switch (tournament.type) {
            case tournament_enum_1.TournamentType.SINGLE_ELIMINATION:
                await this.generateSingleEliminationMatches(tournament);
                break;
            case tournament_enum_1.TournamentType.GROUPS_PLAYOFF:
                await this.generateGroupsPlayoffMatches(tournament);
                break;
            case tournament_enum_1.TournamentType.LEAGUE:
                await this.generateLeagueMatches(tournament);
                break;
            case tournament_enum_1.TournamentType.BLITZ:
                await this.generateBlitzMatches(tournament);
                break;
            default:
                throw new common_1.BadRequestException(`Unsupported tournament type: ${tournament.type}`);
        }
    }
    async generateSingleEliminationMatches(tournament) {
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        const shuffledPlayers = this.shuffleArray([...players]);
        const totalPlayers = this.nextPowerOfTwo(shuffledPlayers.length);
        const rounds = Math.log2(totalPlayers);
        const firstRoundMatches = [];
        for (let i = 0; i < shuffledPlayers.length; i += 2) {
            if (i + 1 >= shuffledPlayers.length) {
                firstRoundMatches.push({
                    tournamentId: tournament.id,
                    round: 1,
                    playerAId: shuffledPlayers[i].id,
                    playerBId: null,
                    status: tournament_enum_1.MatchStatus.SCHEDULED,
                    confirmedBy: [],
                    scheduledAt: new Date(tournament.startDate)
                });
            }
            else {
                firstRoundMatches.push({
                    tournamentId: tournament.id,
                    round: 1,
                    playerAId: shuffledPlayers[i].id,
                    playerBId: shuffledPlayers[i + 1].id,
                    status: tournament_enum_1.MatchStatus.SCHEDULED,
                    confirmedBy: [],
                    scheduledAt: new Date(tournament.startDate)
                });
            }
        }
        await this.tournamentsRepository.createMatches(tournament.id.toString(), firstRoundMatches);
        const formatDetails = tournament.formatDetails || {};
        formatDetails.bracket = {
            rounds,
            totalPlayers
        };
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
    }
    async generateGroupsPlayoffMatches(tournament) {
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        const shuffledPlayers = this.shuffleArray([...players]);
        const formatDetails = tournament.formatDetails || {};
        const groupCount = formatDetails.groupCount || Math.ceil(shuffledPlayers.length / 4);
        const playersPerGroup = Math.ceil(shuffledPlayers.length / groupCount);
        const advancingPerGroup = formatDetails.advancingPerGroup || 2;
        const groups = [];
        for (let i = 0; i < groupCount; i++) {
            const groupName = String.fromCharCode(65 + i);
            const groupPlayers = shuffledPlayers.slice(i * playersPerGroup, (i + 1) * playersPerGroup);
            groups.push({
                name: groupName,
                players: groupPlayers.map(p => p.id),
                table: groupPlayers.map(p => ({
                    playerId: p.id,
                    played: 0,
                    wins: 0,
                    losses: 0,
                    points: 0,
                    setsDiff: 0,
                    gamesDiff: 0
                }))
            });
            const groupMatches = [];
            for (let j = 0; j < groupPlayers.length; j++) {
                for (let k = j + 1; k < groupPlayers.length; k++) {
                    groupMatches.push({
                        tournamentId: tournament.id,
                        group: groupName,
                        playerAId: groupPlayers[j].id,
                        playerBId: groupPlayers[k].id,
                        status: tournament_enum_1.MatchStatus.SCHEDULED,
                        confirmedBy: [],
                        scheduledAt: new Date(tournament.startDate)
                    });
                }
            }
            await this.tournamentsRepository.createMatches(tournament.id.toString(), groupMatches);
        }
        formatDetails.groups = groups;
        formatDetails.advancingPerGroup = advancingPerGroup;
        formatDetails.playoffStarted = false;
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
    }
    async generateLeagueMatches(tournament) {
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        const matches = [];
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
                matches.push({
                    tournamentId: tournament.id,
                    playerAId: players[i].id,
                    playerBId: players[j].id,
                    status: tournament_enum_1.MatchStatus.SCHEDULED,
                    confirmedBy: [],
                    scheduledAt: new Date(tournament.startDate)
                });
            }
        }
        await this.tournamentsRepository.createMatches(tournament.id.toString(), matches);
        const formatDetails = tournament.formatDetails || {};
        formatDetails.leagueTable = players.map((p) => ({
            playerId: p.id,
            points: 0,
            played: 0,
            wins: 0,
            losses: 0,
            setsDiff: 0,
            gamesDiff: 0
        }));
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
    }
    async generateBlitzMatches(tournament) {
        const formatDetails = tournament.formatDetails || {};
        const matchType = formatDetails.matchType || 'short_sets';
        const rounds = formatDetails.rounds || 1;
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        let shuffledPlayers = this.shuffleArray([...players]);
        if (shuffledPlayers.length % 2 !== 0) {
            shuffledPlayers.push({ id: -1 });
        }
        const allMatches = [];
        for (let round = 1; round <= rounds; round++) {
            const roundMatches = [];
            for (let i = 0; i < shuffledPlayers.length; i += 2) {
                if (shuffledPlayers[i].id === -1 || shuffledPlayers[i + 1].id === -1) {
                    continue;
                }
                roundMatches.push({
                    tournamentId: tournament.id,
                    round,
                    playerAId: shuffledPlayers[i].id,
                    playerBId: shuffledPlayers[i + 1].id,
                    status: tournament_enum_1.MatchStatus.SCHEDULED,
                    confirmedBy: [],
                    scheduledAt: new Date(tournament.startDate)
                });
            }
            allMatches.push(...roundMatches);
            if (round < rounds) {
                const first = shuffledPlayers[0];
                const rest = shuffledPlayers.slice(1);
                shuffledPlayers = [first, ...this.rotateArray(rest)];
            }
        }
        await this.tournamentsRepository.createMatches(tournament.id.toString(), allMatches);
        formatDetails.blitzFormat = {
            matchType,
            rounds,
            playerScores: players.map((p) => ({
                playerId: p.id,
                points: 0,
                matchesPlayed: 0
            }))
        };
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
    }
    async processNextStageMatch(tournament, completedMatch, winnerId) {
        switch (tournament.type) {
            case tournament_enum_1.TournamentType.SINGLE_ELIMINATION:
                await this.processSingleEliminationNextMatch(tournament, completedMatch, winnerId);
                break;
            case tournament_enum_1.TournamentType.GROUPS_PLAYOFF:
                await this.updateGroupStandings(tournament, completedMatch, winnerId);
                await this.checkAndGeneratePlayoff(tournament);
                break;
            case tournament_enum_1.TournamentType.LEAGUE:
                await this.updateLeagueStandings(tournament, completedMatch, winnerId);
                break;
            case tournament_enum_1.TournamentType.BLITZ:
                await this.updateBlitzStandings(tournament, completedMatch, winnerId);
                break;
        }
    }
    async processSingleEliminationNextMatch(tournament, completedMatch, winnerId) {
        if (!completedMatch.round)
            return;
        const formatDetails = tournament.formatDetails || {};
        const bracketInfo = formatDetails.bracket || {};
        const totalRounds = bracketInfo.rounds || 0;
        if (completedMatch.round >= totalRounds)
            return;
        const matchesInCurrentRound = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), completedMatch.round);
        const currentRoundIndex = matchesInCurrentRound.findIndex((m) => m.id === completedMatch.id);
        const nextRound = completedMatch.round + 1;
        const nextRoundPosition = Math.floor(currentRoundIndex / 2);
        const isEvenMatch = currentRoundIndex % 2 === 0;
        const opponentMatchIndex = isEvenMatch ? currentRoundIndex + 1 : currentRoundIndex - 1;
        if (opponentMatchIndex < matchesInCurrentRound.length) {
            const opponentMatch = matchesInCurrentRound[opponentMatchIndex];
            if (opponentMatch.winnerId) {
                let playerAId, playerBId;
                if (isEvenMatch) {
                    playerAId = winnerId;
                    playerBId = opponentMatch.winnerId;
                }
                else {
                    playerAId = opponentMatch.winnerId;
                    playerBId = winnerId;
                }
                const existingNextMatch = await this.tournamentsRepository.getMatchByRoundAndPosition(tournament.id.toString(), nextRound, nextRoundPosition);
                if (!existingNextMatch) {
                    await this.tournamentsRepository.createMatches(tournament.id.toString(), [{
                            tournamentId: tournament.id,
                            round: nextRound,
                            playerAId,
                            playerBId,
                            status: tournament_enum_1.MatchStatus.SCHEDULED,
                            confirmedBy: [],
                            scheduledAt: new Date()
                        }]);
                }
                else {
                    await this.tournamentsRepository.updateMatch(existingNextMatch.id.toString(), {
                        playerAId,
                        playerBId
                    });
                }
            }
        }
        else {
            await this.tournamentsRepository.createMatches(tournament.id.toString(), [{
                    tournamentId: tournament.id,
                    round: nextRound,
                    playerAId: winnerId,
                    playerBId: null,
                    status: tournament_enum_1.MatchStatus.SCHEDULED,
                    confirmedBy: [],
                    scheduledAt: new Date()
                }]);
        }
    }
    async updateGroupStandings(tournament, match, winnerId) {
        if (!match.group)
            return;
        const formatDetails = tournament.formatDetails || {};
        const groups = formatDetails.groups || [];
        const group = groups.find((g) => g.name === match.group);
        if (!group)
            return;
        const { winner, loser, winnerSets, loserSets, winnerGames, loserGames } = this.parseScore(match.score || '', winnerId, match.playerAId, match.playerBId);
        const table = group.table || [];
        const winnerEntry = table.find((entry) => entry.playerId === winner);
        if (winnerEntry) {
            winnerEntry.played += 1;
            winnerEntry.wins += 1;
            if (winnerSets === 2 && loserSets === 0) {
                winnerEntry.points += 3;
            }
            else {
                winnerEntry.points += 2;
            }
            winnerEntry.setsDiff += (winnerSets - loserSets);
            winnerEntry.gamesDiff += (winnerGames - loserGames);
        }
        const loserEntry = table.find((entry) => entry.playerId === loser);
        if (loserEntry) {
            loserEntry.played += 1;
            loserEntry.losses += 1;
            if (loserSets === 1) {
                loserEntry.points += 1;
            }
            loserEntry.setsDiff += (loserSets - winnerSets);
            loserEntry.gamesDiff += (loserGames - winnerGames);
        }
        group.table = table.sort((a, b) => {
            if (a.points !== b.points)
                return b.points - a.points;
            if (a.setsDiff !== b.setsDiff)
                return b.setsDiff - a.setsDiff;
            return b.gamesDiff - a.gamesDiff;
        });
        const groupIndex = groups.findIndex((g) => g.name === match.group);
        if (groupIndex >= 0) {
            groups[groupIndex] = group;
        }
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails: { ...formatDetails, groups } });
    }
    async checkAndGeneratePlayoff(tournament) {
        const formatDetails = tournament.formatDetails || {};
        if (formatDetails.playoffStarted)
            return;
        const allGroupMatches = await this.tournamentsRepository.getGroupMatches(tournament.id.toString());
        const allCompleted = allGroupMatches.every((match) => match.status === tournament_enum_1.MatchStatus.FINISHED);
        if (!allCompleted)
            return;
        const groups = formatDetails.groups || [];
        const advancingPerGroup = formatDetails.advancingPerGroup || 2;
        const advancingPlayers = [];
        groups.forEach((group) => {
            const table = group.table || [];
            const advancing = table.slice(0, advancingPerGroup).map((entry) => entry.playerId);
            advancingPlayers.push(...advancing);
        });
        const playoffMatches = [];
        for (let i = 0; i < advancingPlayers.length; i += 2) {
            if (i + 1 < advancingPlayers.length) {
                playoffMatches.push({
                    tournamentId: tournament.id,
                    round: 1,
                    playerAId: advancingPlayers[i],
                    playerBId: advancingPlayers[i + 1],
                    status: tournament_enum_1.MatchStatus.SCHEDULED,
                    confirmedBy: [],
                    scheduledAt: new Date()
                });
            }
            else {
                playoffMatches.push({
                    tournamentId: tournament.id,
                    round: 1,
                    playerAId: advancingPlayers[i],
                    playerBId: null,
                    status: tournament_enum_1.MatchStatus.SCHEDULED,
                    confirmedBy: [],
                    scheduledAt: new Date()
                });
            }
        }
        await this.tournamentsRepository.createMatches(tournament.id.toString(), playoffMatches);
        formatDetails.playoffStarted = true;
        formatDetails.playoffBracket = {
            rounds: Math.ceil(Math.log2(advancingPlayers.length)),
            advancingPlayers
        };
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
    }
    async updateLeagueStandings(tournament, match, winnerId) {
        const formatDetails = tournament.formatDetails || {};
        const leagueTable = formatDetails.leagueTable || [];
        const { winner, loser, winnerSets, loserSets, winnerGames, loserGames } = this.parseScore(match.score || '', winnerId, match.playerAId, match.playerBId);
        const winnerEntry = leagueTable.find((entry) => entry.playerId === winner);
        if (winnerEntry) {
            winnerEntry.played += 1;
            winnerEntry.wins += 1;
            if (winnerSets === 2 && loserSets === 0) {
                winnerEntry.points += 3;
            }
            else {
                winnerEntry.points += 2;
            }
            winnerEntry.setsDiff += (winnerSets - loserSets);
            winnerEntry.gamesDiff += (winnerGames - loserGames);
        }
        const loserEntry = leagueTable.find((entry) => entry.playerId === loser);
        if (loserEntry) {
            loserEntry.played += 1;
            loserEntry.losses += 1;
            if (loserSets === 1) {
                loserEntry.points += 1;
            }
            loserEntry.setsDiff += (loserSets - winnerSets);
            loserEntry.gamesDiff += (loserGames - winnerGames);
        }
        formatDetails.leagueTable = leagueTable.sort((a, b) => {
            if (a.points !== b.points)
                return b.points - a.points;
            if (a.setsDiff !== b.setsDiff)
                return b.setsDiff - a.setsDiff;
            return b.gamesDiff - a.gamesDiff;
        });
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
    }
    async updateBlitzStandings(tournament, match, winnerId) {
        const formatDetails = tournament.formatDetails || {};
        const blitzFormat = formatDetails.blitzFormat || {};
        const playerScores = blitzFormat.playerScores || [];
        const loserId = winnerId === match.playerAId ? match.playerBId : match.playerAId;
        const winnerScore = playerScores.find((score) => score.playerId === winnerId);
        if (winnerScore) {
            winnerScore.points += 15;
            winnerScore.matchesPlayed += 1;
        }
        const loserScore = playerScores.find((score) => score.playerId === loserId);
        if (loserScore) {
            loserScore.points += 5;
            loserScore.matchesPlayed += 1;
        }
        blitzFormat.playerScores = playerScores.sort((a, b) => b.points - a.points);
        formatDetails.blitzFormat = blitzFormat;
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
    }
    async processTournamentCompletion(tournament) {
        let winners = [];
        switch (tournament.type) {
            case tournament_enum_1.TournamentType.SINGLE_ELIMINATION:
                winners = await this.determineSingleEliminationWinners(tournament);
                break;
            case tournament_enum_1.TournamentType.GROUPS_PLAYOFF:
                winners = await this.determineGroupsPlayoffWinners(tournament);
                break;
            case tournament_enum_1.TournamentType.LEAGUE:
                winners = await this.determineLeagueWinners(tournament);
                break;
            case tournament_enum_1.TournamentType.BLITZ:
                winners = await this.determineBlitzWinners(tournament);
                break;
        }
        const formatDetails = tournament.formatDetails || {};
        formatDetails.winners = winners;
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
        if (tournament.isRanked && winners.length > 0) {
            await this.usersService.updateTournamentStats(winners[0].toString(), true);
            await this.awardTournamentAchievements(tournament, winners);
        }
    }
    async determineSingleEliminationWinners(tournament) {
        const formatDetails = tournament.formatDetails || {};
        const bracketInfo = formatDetails.bracket || {};
        const totalRounds = bracketInfo.rounds || 0;
        const finalMatches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), totalRounds);
        if (finalMatches.length === 0 || !finalMatches[0].winnerId) {
            return [];
        }
        const winner = finalMatches[0].winnerId;
        const finalist = winner === finalMatches[0].playerAId ? finalMatches[0].playerBId : finalMatches[0].playerAId;
        const semifinalMatches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), totalRounds - 1);
        const semifinalistsIds = semifinalMatches.map((match) => [match.playerAId, match.playerBId]).flat().filter((id) => id !== null && id !== finalist && id !== winner);
        const thirdPlaceMatch = await this.tournamentsRepository.getThirdPlaceMatch(tournament.id.toString());
        let thirdPlace = null;
        if (thirdPlaceMatch && thirdPlaceMatch.winnerId) {
            thirdPlace = thirdPlaceMatch.winnerId;
        }
        else if (semifinalistsIds.length === 1) {
            thirdPlace = semifinalistsIds[0];
        }
        return [winner, finalist, thirdPlace].filter((id) => id !== null);
    }
    async determineGroupsPlayoffWinners(tournament) {
        const formatDetails = tournament.formatDetails || {};
        if (formatDetails.playoffStarted && formatDetails.playoffBracket) {
            const rounds = formatDetails.playoffBracket.rounds || 0;
            const finalMatches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), rounds);
            if (finalMatches.length === 0 || !finalMatches[0].winnerId) {
                return [];
            }
            const winner = finalMatches[0].winnerId;
            const finalist = winner === finalMatches[0].playerAId ? finalMatches[0].playerBId : finalMatches[0].playerAId;
            const thirdPlaceMatch = await this.tournamentsRepository.getThirdPlaceMatch(tournament.id.toString());
            let thirdPlace = null;
            if (thirdPlaceMatch && thirdPlaceMatch.winnerId) {
                thirdPlace = thirdPlaceMatch.winnerId;
            }
            else {
                const semifinalMatches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), rounds - 1);
                const semifinalistsIds = semifinalMatches.map((match) => [match.playerAId, match.playerBId]).flat().filter((id) => id !== null && id !== finalist && id !== winner);
                if (semifinalistsIds.length === 1) {
                    thirdPlace = semifinalistsIds[0];
                }
            }
            return [winner, finalist, thirdPlace].filter((id) => id !== null);
        }
        else {
            const groups = formatDetails.groups || [];
            const allPlayers = [];
            groups.forEach((group) => {
                const table = group.table || [];
                allPlayers.push(...table);
            });
            const sortedPlayers = allPlayers.sort((a, b) => {
                if (a.points !== b.points)
                    return b.points - a.points;
                if (a.setsDiff !== b.setsDiff)
                    return b.setsDiff - a.setsDiff;
                return b.gamesDiff - a.gamesDiff;
            });
            return sortedPlayers.slice(0, 3).map((player) => player.playerId);
        }
    }
    async determineLeagueWinners(tournament) {
        const formatDetails = tournament.formatDetails || {};
        const leagueTable = formatDetails.leagueTable || [];
        return leagueTable.slice(0, 3).map((entry) => entry.playerId);
    }
    async determineBlitzWinners(tournament) {
        const formatDetails = tournament.formatDetails || {};
        const blitzFormat = formatDetails.blitzFormat || {};
        const playerScores = blitzFormat.playerScores || [];
        return playerScores.slice(0, 3).map((score) => score.playerId);
    }
    async awardTournamentAchievements(tournament, winners) {
        if (winners.length === 0)
            return;
        await this.usersService.addAchievement(winners[0].toString(), 'tournament_win', {
            tournamentId: tournament.id,
            tournamentType: tournament.type,
            date: new Date(),
            title: `${tournament.type} Champion`,
            description: `Won ${tournament.title}`,
        });
        switch (tournament.type) {
            case tournament_enum_1.TournamentType.SINGLE_ELIMINATION:
                await this.usersService.addAchievement(winners[0].toString(), 'single_elimination_win', {
                    tournamentId: tournament.id,
                    date: new Date(),
                    title: 'Bracket Champion',
                    description: 'Won a Single Elimination tournament',
                });
                break;
            case tournament_enum_1.TournamentType.GROUPS_PLAYOFF:
                await this.usersService.addAchievement(winners[0].toString(), 'groups_playoff_win', {
                    tournamentId: tournament.id,
                    date: new Date(),
                    title: 'Group Master',
                    description: 'Won a Groups + Playoff tournament',
                });
                break;
            case tournament_enum_1.TournamentType.LEAGUE:
                await this.usersService.addAchievement(winners[0].toString(), 'league_win', {
                    tournamentId: tournament.id,
                    date: new Date(),
                    title: 'League Champion',
                    description: 'Won a League tournament',
                });
                break;
            case tournament_enum_1.TournamentType.BLITZ:
                await this.usersService.addAchievement(winners[0].toString(), 'blitz_win', {
                    tournamentId: tournament.id,
                    date: new Date(),
                    title: 'Speed Demon',
                    description: 'Won a Blitz tournament',
                });
                break;
        }
    }
    async getSingleEliminationStandings(tournament) {
        const formatDetails = tournament.formatDetails || {};
        const bracketInfo = formatDetails.bracket || {};
        const rounds = bracketInfo.rounds || 0;
        const matchesByRound = [];
        for (let i = 1; i <= rounds; i++) {
            const matches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), i);
            matchesByRound.push(matches);
        }
        const thirdPlaceMatch = await this.tournamentsRepository.getThirdPlaceMatch(tournament.id.toString());
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        return {
            type: tournament_enum_1.TournamentType.SINGLE_ELIMINATION,
            bracketInfo,
            matchesByRound,
            thirdPlaceMatch,
            players: players.map((p) => ({ id: p.id, username: p.username }))
        };
    }
    async getGroupsPlayoffStandings(tournament) {
        const formatDetails = tournament.formatDetails || {};
        const groups = formatDetails.groups || [];
        const playoffStarted = formatDetails.playoffStarted || false;
        const groupMatches = await this.tournamentsRepository.getGroupMatches(tournament.id.toString());
        let playoffInfo = null;
        if (playoffStarted && formatDetails.playoffBracket) {
            const rounds = formatDetails.playoffBracket.rounds || 0;
            const matchesByRound = [];
            for (let i = 1; i <= rounds; i++) {
                const matches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), i);
                matchesByRound.push(matches);
            }
            const thirdPlaceMatch = await this.tournamentsRepository.getThirdPlaceMatch(tournament.id.toString());
            playoffInfo = {
                bracketInfo: formatDetails.playoffBracket,
                matchesByRound,
                thirdPlaceMatch
            };
        }
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        return {
            type: tournament_enum_1.TournamentType.GROUPS_PLAYOFF,
            groups,
            groupMatches,
            playoffStarted,
            playoffInfo,
            players: players.map((p) => ({ id: p.id, username: p.username }))
        };
    }
    async getLeagueStandings(tournament) {
        const formatDetails = tournament.formatDetails || {};
        const leagueTable = formatDetails.leagueTable || [];
        const matches = await this.tournamentsRepository.getTournamentMatches(tournament.id.toString());
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        return {
            type: tournament_enum_1.TournamentType.LEAGUE,
            leagueTable,
            matches,
            players: players.map((p) => ({ id: p.id, username: p.username }))
        };
    }
    async getBlitzStandings(tournament) {
        const formatDetails = tournament.formatDetails || {};
        const blitzFormat = formatDetails.blitzFormat || {};
        const matches = await this.tournamentsRepository.getTournamentMatches(tournament.id.toString());
        const matchesByRound = matches.reduce((acc, match) => {
            if (!match.round)
                return acc;
            if (!acc[match.round]) {
                acc[match.round] = [];
            }
            acc[match.round].push(match);
            return acc;
        }, {});
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        return {
            type: tournament_enum_1.TournamentType.BLITZ,
            blitzFormat,
            matchesByRound,
            players: players.map((p) => ({ id: p.id, username: p.username }))
        };
    }
    parseScore(score, winnerId, playerAId, playerBId) {
        if (!score) {
            return {
                winner: winnerId,
                loser: winnerId === playerAId ? playerBId : playerAId,
                winnerSets: 2,
                loserSets: 0,
                winnerGames: 12,
                loserGames: 0
            };
        }
        const sets = score.split(',').map(set => set.trim());
        let winnerSets = 0;
        let loserSets = 0;
        let winnerGames = 0;
        let loserGames = 0;
        sets.forEach(set => {
            const [scoreA, scoreB] = set.split('-').map(Number);
            if ((playerAId === winnerId && scoreA > scoreB) || (playerBId === winnerId && scoreB > scoreA)) {
                winnerSets += 1;
                winnerGames += Math.max(scoreA, scoreB);
                loserGames += Math.min(scoreA, scoreB);
            }
            else {
                loserSets += 1;
                winnerGames += Math.min(scoreA, scoreB);
                loserGames += Math.max(scoreA, scoreB);
            }
        });
        return {
            winner: winnerId,
            loser: winnerId === playerAId ? playerBId : playerAId,
            winnerSets,
            loserSets,
            winnerGames,
            loserGames
        };
    }
    shuffleArray(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    nextPowerOfTwo(n) {
        if (n <= 0)
            return 1;
        n--;
        n |= n >> 1;
        n |= n >> 2;
        n |= n >> 4;
        n |= n >> 8;
        n |= n >> 16;
        return n + 1;
    }
    rotateArray(array) {
        if (array.length <= 1)
            return array;
        const result = [...array];
        const last = result.pop();
        if (last !== undefined) {
            result.unshift(last);
        }
        return result;
    }
    // Добавить следующий метод в класс TournamentsService
    /**
     * Получить турниры пользователя с фильтрацией
     */
    async getUserTournaments(userId, options = {}) {
        const userIdInt = parseInt(userId);
        const { status } = options;
        // Построение фильтра состояния
        let statusFilter = {};
        if (status) {
            switch (status.toUpperCase()) {
                case 'UPCOMING':
                    statusFilter = { status: tournament_enum_1.TournamentStatus.DRAFT };
                    break;
                case 'ACTIVE':
                    statusFilter = { status: tournament_enum_1.TournamentStatus.ACTIVE };
                    break;
                case 'FINISHED':
                    statusFilter = { status: tournament_enum_1.TournamentStatus.COMPLETED };
                    break;
                default:
                // По умолчанию не фильтруем
            }
        }
        // Найти все турниры, где участвует пользователь
        const tournaments = await this.prisma.tournament.findMany({
            where: {
                players: {
                    some: {
                        id: userIdInt // Ищем по id пользователя
                    }
                },
                ...statusFilter
            },
            orderBy: [
                { status: 'asc' }, // Сначала активные и предстоящие
                { startDate: 'desc' } // Затем по дате (новые в начале)
            ],
            include: {
                players: true,
                creator: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        });
        return tournaments.map((tournament) => ({
            id: tournament.id,
            title: tournament.title,
            status: tournament.status,
            type: tournament.type,
            startDate: tournament.startDate,
            endDate: tournament.endDate,
            location: tournament.locationName,
            participantsCount: tournament.players.length,
            organizerName: `${tournament.creator.firstName} ${tournament.creator.lastName || ''}`.trim(), // Изменено с organizer на creator
            isRanked: tournament.isRanked
        }));
    }
};
exports.TournamentsService = TournamentsService;
exports.TournamentsService = TournamentsService = TournamentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tournaments_repository_1.TournamentsRepository,
        users_service_1.UsersService,
        prisma_service_1.PrismaService])
], TournamentsService);
