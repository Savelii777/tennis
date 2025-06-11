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
exports.TournamentsService = void 0;
const common_1 = require("@nestjs/common");
const tournaments_repository_1 = require("../../infrastructure/repositories/tournaments.repository");
const tournament_enum_1 = require("../../domain/enums/tournament.enum");
const users_service_1 = require("../../../users/application/services/users.service");
let TournamentsService = class TournamentsService {
    constructor(tournamentsRepository, usersService) {
        this.tournamentsRepository = tournamentsRepository;
        this.usersService = usersService;
    }
    async findAll(filters) {
        return this.tournamentsRepository.findAll(filters);
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
        // Check if start date is in the future
        if (new Date(createTournamentDto.startDate) < new Date()) {
            throw new common_1.BadRequestException('Tournament start date must be in the future');
        }
        // Check if end date is after start date
        if (new Date(createTournamentDto.endDate) <= new Date(createTournamentDto.startDate)) {
            throw new common_1.BadRequestException('Tournament end date must be after start date');
        }
        return this.tournamentsRepository.create(userId, createTournamentDto);
    }
    async update(id, userId, updateTournamentDto) {
        const tournament = await this.findById(id);
        // Only creator or admin can update
        if (tournament.creatorId !== parseInt(userId)) {
            throw new common_1.ForbiddenException('You are not authorized to update this tournament');
        }
        // Cannot modify COMPLETED tournaments
        if (tournament.status === tournament_enum_1.TournamentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot modify a completed tournament');
        }
        return this.tournamentsRepository.update(id, updateTournamentDto);
    }
    async delete(id, userId) {
        const tournament = await this.findById(id);
        // Only creator or admin can delete
        if (tournament.creatorId !== parseInt(userId)) {
            throw new common_1.ForbiddenException('You are not authorized to delete this tournament');
        }
        // Cannot delete ACTIVE or COMPLETED tournaments
        if (tournament.status !== tournament_enum_1.TournamentStatus.DRAFT) {
            throw new common_1.BadRequestException('Cannot delete an active or completed tournament');
        }
        return this.tournamentsRepository.delete(id);
    }
    async joinTournament(tournamentId, userId) {
        const tournament = await this.findById(tournamentId);
        // Check if tournament is open for registration
        if (tournament.status !== tournament_enum_1.TournamentStatus.DRAFT) {
            throw new common_1.BadRequestException('Tournament is not open for registration');
        }
        // Check if tournament is full
        if (tournament.currentPlayers >= tournament.maxPlayers) {
            throw new common_1.BadRequestException('Tournament is already full');
        }
        // Check if user is already registered
        const isRegistered = await this.tournamentsRepository.isPlayerRegistered(tournamentId, userId);
        if (isRegistered) {
            throw new common_1.BadRequestException('You are already registered for this tournament');
        }
        // Register user for tournament
        return this.tournamentsRepository.addPlayer(tournamentId, userId);
    }
    async leaveTournament(tournamentId, userId) {
        const tournament = await this.findById(tournamentId);
        // Check if tournament is still in draft
        if (tournament.status !== tournament_enum_1.TournamentStatus.DRAFT) {
            throw new common_1.BadRequestException('Cannot leave an active or completed tournament');
        }
        // Check if user is registered
        const isRegistered = await this.tournamentsRepository.isPlayerRegistered(tournamentId, userId);
        if (!isRegistered) {
            throw new common_1.BadRequestException('You are not registered for this tournament');
        }
        // Remove user from tournament
        return this.tournamentsRepository.removePlayer(tournamentId, userId);
    }
    async startTournament(id, userId) {
        const tournament = await this.findById(id);
        // Only creator can start
        if (tournament.creatorId !== parseInt(userId)) {
            throw new common_1.ForbiddenException('You are not authorized to start this tournament');
        }
        // Check if tournament can be started
        if (tournament.status !== tournament_enum_1.TournamentStatus.DRAFT) {
            throw new common_1.BadRequestException('Tournament is already active or completed');
        }
        // Check if tournament has enough players
        if (tournament.currentPlayers < tournament.minPlayers) {
            throw new common_1.BadRequestException(`Tournament requires at least ${tournament.minPlayers} players to start`);
        }
        // Generate initial matches based on tournament type
        await this.generateInitialMatches(tournament);
        // Update tournament status
        return this.tournamentsRepository.update(id, { status: tournament_enum_1.TournamentStatus.ACTIVE });
    }
    async completeTournament(id, userId) {
        const tournament = await this.findById(id);
        // Only creator can complete
        if (tournament.creatorId !== parseInt(userId)) {
            throw new common_1.ForbiddenException('You are not authorized to complete this tournament');
        }
        // Check if tournament can be completed
        if (tournament.status !== tournament_enum_1.TournamentStatus.ACTIVE) {
            throw new common_1.BadRequestException('Tournament is not active');
        }
        // Check if all matches are completed
        const allMatchesCompleted = await this.tournamentsRepository.areAllMatchesCompleted(id);
        if (!allMatchesCompleted) {
            throw new common_1.BadRequestException('All tournament matches must be completed first');
        }
        // Determine winners and update ratings if ranked
        await this.processTournamentCompletion(tournament);
        // Update tournament status
        return this.tournamentsRepository.update(id, { status: tournament_enum_1.TournamentStatus.COMPLETED });
    }
    async getTournamentMatches(tournamentId) {
        await this.findById(tournamentId); // Verify tournament exists
        return this.tournamentsRepository.getTournamentMatches(tournamentId);
    }
    async getTournamentMatch(tournamentId, matchId) {
        await this.findById(tournamentId); // Verify tournament exists
        const match = await this.tournamentsRepository.getTournamentMatch(matchId);
        if (!match || match.tournamentId !== parseInt(tournamentId)) {
            throw new common_1.NotFoundException(`Match with ID ${matchId} not found in tournament ${tournamentId}`);
        }
        return match;
    }
    async recordMatchResult(tournamentId, matchId, userId, recordMatchDto) {
        const tournament = await this.findById(tournamentId);
        const match = await this.getTournamentMatch(tournamentId, matchId);
        // Check if match can be recorded
        if (match.status === tournament_enum_1.MatchStatus.FINISHED || match.score) {
            throw new common_1.BadRequestException('Match result has already been recorded');
        }
        // Verify user is participant or creator
        const isParticipant = match.playerAId === parseInt(userId) || match.playerBId === parseInt(userId);
        const isCreator = tournament.creatorId === parseInt(userId);
        if (!isParticipant && !isCreator) {
            throw new common_1.ForbiddenException('Only participants or tournament creator can record results');
        }
        // Record result and confirm if creator
        if (isCreator) {
            // Creator's recording is final
            const result = await this.tournamentsRepository.recordMatchResult(matchId, recordMatchDto);
            // Process next stage if tournament is active
            if (tournament.status === tournament_enum_1.TournamentStatus.ACTIVE) {
                await this.processNextStageMatch(tournament, match, recordMatchDto.winnerId);
            }
            // Update player stats if ranked tournament
            if (tournament.isRanked) {
                const loserId = recordMatchDto.winnerId === match.playerAId ? match.playerBId : match.playerAId;
                // Update winner stats - add points to overall rating and match stats
                await this.usersService.updateMatchStats(recordMatchDto.winnerId.toString(), true);
                // Update loser stats - add points to overall rating and match stats 
                await this.usersService.updateMatchStats(loserId.toString(), false);
            }
            return result;
        }
        else {
            // If participant, just add confirmation
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
    // Private helper methods for tournament logic
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
        // Get players
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        // Shuffle players for random seeding
        const shuffledPlayers = this.shuffleArray([...players]);
        // Calculate rounds needed (log2 of next power of 2 >= players.length)
        const totalPlayers = this.nextPowerOfTwo(shuffledPlayers.length);
        const rounds = Math.log2(totalPlayers);
        // Generate first round matches
        const firstRoundMatches = [];
        for (let i = 0; i < shuffledPlayers.length; i += 2) {
            // If we have an odd number of players or reached the end, create a bye
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
        // Create matches in database
        await this.tournamentsRepository.createMatches(tournament.id.toString(), firstRoundMatches);
        // Update tournament format details with bracket information
        const formatDetails = tournament.formatDetails || {};
        formatDetails.bracket = {
            rounds,
            totalPlayers
        };
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
    }
    async generateGroupsPlayoffMatches(tournament) {
        // Get players
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        // Shuffle players for random group assignment
        const shuffledPlayers = this.shuffleArray([...players]);
        // Extract group configuration from tournament format details
        const formatDetails = tournament.formatDetails || {};
        const groupCount = formatDetails.groupCount || Math.ceil(shuffledPlayers.length / 4); // Default to groups of ~4
        const playersPerGroup = Math.ceil(shuffledPlayers.length / groupCount);
        const advancingPerGroup = formatDetails.advancingPerGroup || 2; // Default top 2 advance
        // Create groups
        const groups = [];
        for (let i = 0; i < groupCount; i++) {
            const groupName = String.fromCharCode(65 + i); // A, B, C, etc.
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
            // Generate all matches within group (round-robin)
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
            // Create group matches in database
            await this.tournamentsRepository.createMatches(tournament.id.toString(), groupMatches);
        }
        // Update tournament format details with group information
        formatDetails.groups = groups;
        formatDetails.advancingPerGroup = advancingPerGroup;
        formatDetails.playoffStarted = false;
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
    }
    async generateLeagueMatches(tournament) {
        // Get players
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        // Generate round-robin matches
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
        // Create league matches in database
        await this.tournamentsRepository.createMatches(tournament.id.toString(), matches);
        // Update tournament format details
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
        // Get tournament format details
        const formatDetails = tournament.formatDetails || {};
        const matchType = formatDetails.matchType || 'short_sets'; // Default to short sets
        const rounds = formatDetails.rounds || 1; // Default to 1 round
        // Get players
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        // Shuffle players for first round
        let shuffledPlayers = this.shuffleArray([...players]);
        // Handle case with odd number of players
        if (shuffledPlayers.length % 2 !== 0) {
            // Add a bye player
            shuffledPlayers.push({ id: -1 }); // Use -1 for bye
        }
        // Generate matches for each round
        const allMatches = [];
        for (let round = 1; round <= rounds; round++) {
            const roundMatches = [];
            for (let i = 0; i < shuffledPlayers.length; i += 2) {
                // Skip matches with bye player
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
            // Add round matches to all matches
            allMatches.push(...roundMatches);
            // Rotate players for next round (standard round-robin rotation)
            if (round < rounds) {
                const first = shuffledPlayers[0];
                const rest = shuffledPlayers.slice(1);
                shuffledPlayers = [first, ...this.rotateArray(rest)];
            }
        }
        // Create blitz matches in database
        await this.tournamentsRepository.createMatches(tournament.id.toString(), allMatches);
        // Update tournament format details
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
                // Check if all group matches are complete to start playoff
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
        // Only proceed for matches with a round
        if (!completedMatch.round)
            return;
        const formatDetails = tournament.formatDetails || {};
        const bracketInfo = formatDetails.bracket || {};
        const totalRounds = bracketInfo.rounds || 0;
        // Only create next match if this isn't the final round
        if (completedMatch.round >= totalRounds)
            return;
        // Calculate position in current round (0-indexed)
        const matchesInCurrentRound = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), completedMatch.round);
        const currentRoundIndex = matchesInCurrentRound.findIndex((m) => m.id === completedMatch.id);
        // Calculate position in next round (0-indexed)
        const nextRound = completedMatch.round + 1;
        const nextRoundPosition = Math.floor(currentRoundIndex / 2);
        // Check if opponent match is completed
        const isEvenMatch = currentRoundIndex % 2 === 0;
        const opponentMatchIndex = isEvenMatch ? currentRoundIndex + 1 : currentRoundIndex - 1;
        if (opponentMatchIndex < matchesInCurrentRound.length) {
            const opponentMatch = matchesInCurrentRound[opponentMatchIndex];
            // If opponent match is completed, create next round match
            if (opponentMatch.winnerId) {
                // Determine player positions
                let playerAId, playerBId;
                if (isEvenMatch) {
                    playerAId = winnerId;
                    playerBId = opponentMatch.winnerId;
                }
                else {
                    playerAId = opponentMatch.winnerId;
                    playerBId = winnerId;
                }
                // Check if next round match already exists
                const existingNextMatch = await this.tournamentsRepository.getMatchByRoundAndPosition(tournament.id.toString(), nextRound, nextRoundPosition);
                if (!existingNextMatch) {
                    // Create next round match
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
                    // Update existing match with players
                    await this.tournamentsRepository.updateMatch(existingNextMatch.id.toString(), {
                        playerAId,
                        playerBId
                    });
                }
            }
        }
        else {
            // No opponent match (this can happen with byes)
            // Create next round match with only this winner
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
            return; // Only for group matches
        const formatDetails = tournament.formatDetails || {};
        const groups = formatDetails.groups || [];
        // Find the group this match belongs to
        const group = groups.find((g) => g.name === match.group);
        if (!group)
            return;
        // Parse score to determine sets and games difference
        const { winner, loser, winnerSets, loserSets, winnerGames, loserGames } = this.parseScore(match.score || '', winnerId, match.playerAId, match.playerBId);
        // Update group table
        const table = group.table || [];
        // Update winner stats
        const winnerEntry = table.find((entry) => entry.playerId === winner);
        if (winnerEntry) {
            winnerEntry.played += 1;
            winnerEntry.wins += 1;
            // Points based on score (3 points for 2-0, 2 points for 2-1)
            if (winnerSets === 2 && loserSets === 0) {
                winnerEntry.points += 3;
            }
            else {
                winnerEntry.points += 2;
            }
            winnerEntry.setsDiff += (winnerSets - loserSets);
            winnerEntry.gamesDiff += (winnerGames - loserGames);
        }
        // Update loser stats
        const loserEntry = table.find((entry) => entry.playerId === loser);
        if (loserEntry) {
            loserEntry.played += 1;
            loserEntry.losses += 1;
            // Points for loser (1 point for 1-2, 0 points for 0-2)
            if (loserSets === 1) {
                loserEntry.points += 1;
            }
            loserEntry.setsDiff += (loserSets - winnerSets);
            loserEntry.gamesDiff += (loserGames - winnerGames);
        }
        // Sort table by points, sets difference, games difference
        group.table = table.sort((a, b) => {
            if (a.points !== b.points)
                return b.points - a.points;
            if (a.setsDiff !== b.setsDiff)
                return b.setsDiff - a.setsDiff;
            return b.gamesDiff - a.gamesDiff;
        });
        // Update group in format details
        const groupIndex = groups.findIndex((g) => g.name === match.group);
        if (groupIndex >= 0) {
            groups[groupIndex] = group;
        }
        // Update tournament format details
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails: { ...formatDetails, groups } });
    }
    async checkAndGeneratePlayoff(tournament) {
        const formatDetails = tournament.formatDetails || {};
        // If playoff has already started, don't generate it again
        if (formatDetails.playoffStarted)
            return;
        // Check if all group matches are completed
        const allGroupMatches = await this.tournamentsRepository.getGroupMatches(tournament.id.toString());
        const allCompleted = allGroupMatches.every((match) => match.status === tournament_enum_1.MatchStatus.FINISHED);
        if (!allCompleted)
            return;
        // All group matches are completed, start playoff
        const groups = formatDetails.groups || [];
        const advancingPerGroup = formatDetails.advancingPerGroup || 2;
        // Get advancing players from each group
        const advancingPlayers = [];
        groups.forEach((group) => {
            const table = group.table || [];
            const advancing = table.slice(0, advancingPerGroup).map((entry) => entry.playerId);
            advancingPlayers.push(...advancing);
        });
        // Generate playoff bracket (standard single elimination)
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
                // Odd number of players, one gets a bye
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
        // Create playoff matches
        await this.tournamentsRepository.createMatches(tournament.id.toString(), playoffMatches);
        // Update tournament format details
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
        // Parse score to determine sets and games difference
        const { winner, loser, winnerSets, loserSets, winnerGames, loserGames } = this.parseScore(match.score || '', winnerId, match.playerAId, match.playerBId);
        // Update league table
        // Update winner stats
        const winnerEntry = leagueTable.find((entry) => entry.playerId === winner);
        if (winnerEntry) {
            winnerEntry.played += 1;
            winnerEntry.wins += 1;
            // Points based on score (3 points for 2-0, 2 points for 2-1)
            if (winnerSets === 2 && loserSets === 0) {
                winnerEntry.points += 3;
            }
            else {
                winnerEntry.points += 2;
            }
            winnerEntry.setsDiff += (winnerSets - loserSets);
            winnerEntry.gamesDiff += (winnerGames - loserGames);
        }
        // Update loser stats
        const loserEntry = leagueTable.find((entry) => entry.playerId === loser);
        if (loserEntry) {
            loserEntry.played += 1;
            loserEntry.losses += 1;
            // Points for loser (1 point for 1-2, 0 points for 0-2)
            if (loserSets === 1) {
                loserEntry.points += 1;
            }
            loserEntry.setsDiff += (loserSets - winnerSets);
            loserEntry.gamesDiff += (loserGames - winnerGames);
        }
        // Sort table by points, sets difference, games difference
        formatDetails.leagueTable = leagueTable.sort((a, b) => {
            if (a.points !== b.points)
                return b.points - a.points;
            if (a.setsDiff !== b.setsDiff)
                return b.setsDiff - a.setsDiff;
            return b.gamesDiff - a.gamesDiff;
        });
        // Update tournament format details
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
    }
    async updateBlitzStandings(tournament, match, winnerId) {
        const formatDetails = tournament.formatDetails || {};
        const blitzFormat = formatDetails.blitzFormat || {};
        const playerScores = blitzFormat.playerScores || [];
        // Determine winner and loser
        const loserId = winnerId === match.playerAId ? match.playerBId : match.playerAId;
        // Update winner score
        const winnerScore = playerScores.find((score) => score.playerId === winnerId);
        if (winnerScore) {
            winnerScore.points += 15; // Winner gets 15 points
            winnerScore.matchesPlayed += 1;
        }
        // Update loser score
        const loserScore = playerScores.find((score) => score.playerId === loserId);
        if (loserScore) {
            loserScore.points += 5; // Loser gets 5 points for participation
            loserScore.matchesPlayed += 1;
        }
        // Sort player scores by points
        blitzFormat.playerScores = playerScores.sort((a, b) => b.points - a.points);
        // Update tournament format details
        formatDetails.blitzFormat = blitzFormat;
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
    }
    async processTournamentCompletion(tournament) {
        // Determine winners based on tournament type
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
        // Update tournament winners
        const formatDetails = tournament.formatDetails || {};
        formatDetails.winners = winners;
        await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
        // Award points and achievements to winners if tournament is ranked
        if (tournament.isRanked && winners.length > 0) {
            // Update winner stats - add tournament win
            await this.usersService.updateTournamentStats(winners[0].toString(), true);
            // Award achievements based on tournament type
            await this.awardTournamentAchievements(tournament, winners);
        }
    }
    async determineSingleEliminationWinners(tournament) {
        const formatDetails = tournament.formatDetails || {};
        const bracketInfo = formatDetails.bracket || {};
        const totalRounds = bracketInfo.rounds || 0;
        // Get final match
        const finalMatches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), totalRounds);
        if (finalMatches.length === 0 || !finalMatches[0].winnerId) {
            return [];
        }
        const winner = finalMatches[0].winnerId;
        const finalist = winner === finalMatches[0].playerAId ? finalMatches[0].playerBId : finalMatches[0].playerAId;
        // For third place, find losers of semifinals
        const semifinalMatches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), totalRounds - 1);
        const semifinalistsIds = semifinalMatches.map((match) => [match.playerAId, match.playerBId]).flat().filter((id) => id !== null && id !== finalist && id !== winner);
        // Get third place match if it exists
        const thirdPlaceMatch = await this.tournamentsRepository.getThirdPlaceMatch(tournament.id.toString());
        let thirdPlace = null;
        if (thirdPlaceMatch && thirdPlaceMatch.winnerId) {
            thirdPlace = thirdPlaceMatch.winnerId;
        }
        else if (semifinalistsIds.length === 1) {
            // If there's only one semifinalist (other than winner and finalist), they're third
            thirdPlace = semifinalistsIds[0];
        }
        return [winner, finalist, thirdPlace].filter((id) => id !== null);
    }
    async determineGroupsPlayoffWinners(tournament) {
        const formatDetails = tournament.formatDetails || {};
        // If tournament has playoff
        if (formatDetails.playoffStarted && formatDetails.playoffBracket) {
            // Similar to single elimination
            const rounds = formatDetails.playoffBracket.rounds || 0;
            // Get final match
            const finalMatches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), rounds);
            if (finalMatches.length === 0 || !finalMatches[0].winnerId) {
                return [];
            }
            const winner = finalMatches[0].winnerId;
            const finalist = winner === finalMatches[0].playerAId ? finalMatches[0].playerBId : finalMatches[0].playerAId;
            // For third place, check if there's a third-place match
            const thirdPlaceMatch = await this.tournamentsRepository.getThirdPlaceMatch(tournament.id.toString());
            let thirdPlace = null;
            if (thirdPlaceMatch && thirdPlaceMatch.winnerId) {
                thirdPlace = thirdPlaceMatch.winnerId;
            }
            else {
                // If no third place match, check semifinal losers
                const semifinalMatches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), rounds - 1);
                const semifinalistsIds = semifinalMatches.map((match) => [match.playerAId, match.playerBId]).flat().filter((id) => id !== null && id !== finalist && id !== winner);
                if (semifinalistsIds.length === 1) {
                    thirdPlace = semifinalistsIds[0];
                }
            }
            return [winner, finalist, thirdPlace].filter((id) => id !== null);
        }
        else {
            // No playoff, determine by group standings
            const groups = formatDetails.groups || [];
            const allPlayers = [];
            // Collect all players from all group tables
            groups.forEach((group) => {
                const table = group.table || [];
                allPlayers.push(...table);
            });
            // Sort by points, sets difference, games difference
            const sortedPlayers = allPlayers.sort((a, b) => {
                if (a.points !== b.points)
                    return b.points - a.points;
                if (a.setsDiff !== b.setsDiff)
                    return b.setsDiff - a.setsDiff;
                return b.gamesDiff - a.gamesDiff;
            });
            // Return top 3 player IDs
            return sortedPlayers.slice(0, 3).map((player) => player.playerId);
        }
    }
    async determineLeagueWinners(tournament) {
        const formatDetails = tournament.formatDetails || {};
        const leagueTable = formatDetails.leagueTable || [];
        // League table is already sorted by points
        return leagueTable.slice(0, 3).map((entry) => entry.playerId);
    }
    async determineBlitzWinners(tournament) {
        const formatDetails = tournament.formatDetails || {};
        const blitzFormat = formatDetails.blitzFormat || {};
        const playerScores = blitzFormat.playerScores || [];
        // Return top 3 player IDs by points
        return playerScores.slice(0, 3).map((score) => score.playerId);
    }
    async awardTournamentAchievements(tournament, winners) {
        if (winners.length === 0)
            return;
        // Award achievement to tournament winner
        await this.usersService.addAchievement(winners[0].toString(), 'tournament_win', {
            tournamentId: tournament.id,
            tournamentType: tournament.type,
            date: new Date(),
            title: `${tournament.type} Champion`,
            description: `Won ${tournament.title}`,
        });
        // Award tournament-specific achievements
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
    // Helper methods for tournament standings
    async getSingleEliminationStandings(tournament) {
        const formatDetails = tournament.formatDetails || {};
        const bracketInfo = formatDetails.bracket || {};
        const rounds = bracketInfo.rounds || 0;
        // Get all matches by round
        const matchesByRound = [];
        for (let i = 1; i <= rounds; i++) {
            const matches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), i);
            matchesByRound.push(matches);
        }
        // Get third place match if it exists
        const thirdPlaceMatch = await this.tournamentsRepository.getThirdPlaceMatch(tournament.id.toString());
        // Get players
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
        // Get all group matches
        const groupMatches = await this.tournamentsRepository.getGroupMatches(tournament.id.toString());
        // Get playoff info if playoff has started
        let playoffInfo = null;
        if (playoffStarted && formatDetails.playoffBracket) {
            const rounds = formatDetails.playoffBracket.rounds || 0;
            // Get matches by round
            const matchesByRound = [];
            for (let i = 1; i <= rounds; i++) {
                const matches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), i);
                matchesByRound.push(matches);
            }
            // Get third place match if it exists
            const thirdPlaceMatch = await this.tournamentsRepository.getThirdPlaceMatch(tournament.id.toString());
            playoffInfo = {
                bracketInfo: formatDetails.playoffBracket,
                matchesByRound,
                thirdPlaceMatch
            };
        }
        // Get players
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
        // Get all matches
        const matches = await this.tournamentsRepository.getTournamentMatches(tournament.id.toString());
        // Get players
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
        // Get all matches
        const matches = await this.tournamentsRepository.getTournamentMatches(tournament.id.toString());
        // Group matches by round
        const matchesByRound = matches.reduce((acc, match) => {
            if (!match.round)
                return acc;
            if (!acc[match.round]) {
                acc[match.round] = [];
            }
            acc[match.round].push(match);
            return acc;
        }, {});
        // Get players
        const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
        return {
            type: tournament_enum_1.TournamentType.BLITZ,
            blitzFormat,
            matchesByRound,
            players: players.map((p) => ({ id: p.id, username: p.username }))
        };
    }
    // Utility methods
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
        // Parse score format like "6-4, 7-5" or "6-4, 3-6, 10-8"
        const sets = score.split(',').map(set => set.trim());
        let winnerSets = 0;
        let loserSets = 0;
        let winnerGames = 0;
        let loserGames = 0;
        sets.forEach(set => {
            const [scoreA, scoreB] = set.split('-').map(Number);
            if ((playerAId === winnerId && scoreA > scoreB) || (playerBId === winnerId && scoreB > scoreA)) {
                // Winner won this set
                winnerSets += 1;
                winnerGames += Math.max(scoreA, scoreB);
                loserGames += Math.min(scoreA, scoreB);
            }
            else {
                // Winner lost this set
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
};
TournamentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tournaments_repository_1.TournamentsRepository,
        users_service_1.UsersService])
], TournamentsService);
exports.TournamentsService = TournamentsService;
