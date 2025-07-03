import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { TournamentsRepository } from '../../infrastructure/repositories/tournaments.repository';
import { TournamentEntity } from '../../domain/entities/tournament.entity';
import { TournamentMatchEntity } from '../../domain/entities/tournament-match.entity';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';
import { RecordTournamentMatchDto } from '../dto/record-tournament-match.dto';
import { TournamentStatus, TournamentType, MatchStatus } from '../../domain/enums/tournament.enum';
import { UsersService } from '../../../users/application/services/users.service';
import { AchievementsService } from '../../../achievements/application/services/achievements.service';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger(TournamentsService.name);

  constructor(
    private readonly tournamentsRepository: TournamentsRepository,
    private readonly usersService: UsersService,
    private readonly achievementsService: AchievementsService,
    private readonly prisma: PrismaService, // Добавляем prisma сервис

  ) {}

async findAll(filters?: any): Promise<TournamentEntity[]> {
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
  } catch (error) {
    this.logger.error(`❌ Ошибка в TournamentsService.findAll: ${error}`);
    throw error;
  }
}

  async findById(id: string): Promise<TournamentEntity> {
    const tournament = await this.tournamentsRepository.findById(id);
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
    return tournament;
  }

  async findByCreator(creatorId: string): Promise<TournamentEntity[]> {
    return this.tournamentsRepository.findByCreator(creatorId);
  }

  async create(userId: string, createTournamentDto: CreateTournamentDto): Promise<TournamentEntity> {
    if (new Date(createTournamentDto.startDate) < new Date()) {
      throw new BadRequestException('Tournament start date must be in the future');
    }

    if (new Date(createTournamentDto.endDate) <= new Date(createTournamentDto.startDate)) {
      throw new BadRequestException('Tournament end date must be after start date');
    }

    return this.tournamentsRepository.create(userId, createTournamentDto);
  }

  async update(id: string, userId: string, updateTournamentDto: UpdateTournamentDto): Promise<TournamentEntity> {
    const tournament = await this.findById(id);
    
    if (tournament.creatorId !== parseInt(userId)) {
      throw new ForbiddenException('You are not authorized to update this tournament');
    }
    
    if (tournament.status === TournamentStatus.COMPLETED) {
      throw new BadRequestException('Cannot modify a completed tournament');
    }
    
    return this.tournamentsRepository.update(id, updateTournamentDto);
  }

  async delete(id: string, userId: string): Promise<void> {
    const tournament = await this.findById(id);
    
    if (tournament.creatorId !== parseInt(userId)) {
      throw new ForbiddenException('You are not authorized to delete this tournament');
    }
    
    if (tournament.status !== TournamentStatus.DRAFT) {
      throw new BadRequestException('Cannot delete an active or completed tournament');
    }
    
    return this.tournamentsRepository.delete(id);
  }

  async joinTournament(tournamentId: string, userId: string): Promise<any> {
    const tournament = await this.findById(tournamentId);
    
    if (tournament.status !== TournamentStatus.DRAFT) {
      throw new BadRequestException('Tournament is not open for registration');
    }
    
    if (tournament.currentPlayers >= tournament.maxPlayers) {
      throw new BadRequestException('Tournament is already full');
    }
    
    const isRegistered = await this.tournamentsRepository.isPlayerRegistered(tournamentId, userId);
    if (isRegistered) {
      throw new BadRequestException('You are already registered for this tournament');
    }
    
    return this.tournamentsRepository.addPlayer(tournamentId, userId);
  }

  async leaveTournament(tournamentId: string, userId: string): Promise<any> {
    const tournament = await this.findById(tournamentId);
    
    if (tournament.status !== TournamentStatus.DRAFT) {
      throw new BadRequestException('Cannot leave an active or completed tournament');
    }
    
    const isRegistered = await this.tournamentsRepository.isPlayerRegistered(tournamentId, userId);
    if (!isRegistered) {
      throw new BadRequestException('You are not registered for this tournament');
    }
    
    return this.tournamentsRepository.removePlayer(tournamentId, userId);
  }

  async startTournament(id: string, userId: string): Promise<TournamentEntity> {
    const tournament = await this.findById(id);
    
    if (tournament.creatorId !== parseInt(userId)) {
      throw new ForbiddenException('You are not authorized to start this tournament');
    }
    
    if (tournament.status !== TournamentStatus.DRAFT) {
      throw new BadRequestException('Tournament is already active or completed');
    }
    
    if (tournament.currentPlayers < tournament.minPlayers) {
      throw new BadRequestException(`Tournament requires at least ${tournament.minPlayers} players to start`);
    }
    
    await this.generateInitialMatches(tournament);
    
    return this.tournamentsRepository.update(id, { status: TournamentStatus.ACTIVE });
  }

  async completeTournament(id: string, userId: string): Promise<TournamentEntity> {
    const tournament = await this.findById(id);
    
    if (tournament.creatorId !== parseInt(userId)) {
      throw new ForbiddenException('You are not authorized to complete this tournament');
    }
    
    if (tournament.status !== TournamentStatus.ACTIVE) {
      throw new BadRequestException('Tournament is not active');
    }
    
    const allMatchesCompleted = await this.tournamentsRepository.areAllMatchesCompleted(id);
    if (!allMatchesCompleted) {
      throw new BadRequestException('All tournament matches must be completed first');
    }
    
    await this.processTournamentCompletion(tournament);
    
    return this.tournamentsRepository.update(id, { status: TournamentStatus.COMPLETED });
  }

  async getTournamentMatches(tournamentId: string): Promise<TournamentMatchEntity[]> {
    await this.findById(tournamentId); 
    return this.tournamentsRepository.getTournamentMatches(tournamentId);
  }

  async getTournamentMatch(tournamentId: string, matchId: string): Promise<TournamentMatchEntity> {
    await this.findById(tournamentId);
    
    const match = await this.tournamentsRepository.getTournamentMatch(matchId);
    if (!match || match.tournamentId !== parseInt(tournamentId)) {
      throw new NotFoundException(`Match with ID ${matchId} not found in tournament ${tournamentId}`);
    }
    
    return match;
  }

  async recordMatchResult(
    tournamentId: string, 
    matchId: string, 
    userId: string, 
    recordMatchDto: RecordTournamentMatchDto
  ): Promise<TournamentMatchEntity> {
    const tournament = await this.findById(tournamentId);
    const match = await this.getTournamentMatch(tournamentId, matchId);
    
    if (match.status === MatchStatus.FINISHED || match.score) {
      throw new BadRequestException('Match result has already been recorded');
    }
    
    const isParticipant = match.playerAId === parseInt(userId) || match.playerBId === parseInt(userId);
    const isCreator = tournament.creatorId === parseInt(userId);
    
    if (!isParticipant && !isCreator) {
      throw new ForbiddenException('Only participants or tournament creator can record results');
    }
    
    if (isCreator) {
      const result = await this.tournamentsRepository.recordMatchResult(matchId, recordMatchDto);
      
      if (tournament.status === TournamentStatus.ACTIVE) {
        await this.processNextStageMatch(tournament, match, recordMatchDto.winnerId);
      }
      
      if (tournament.isRanked) {
        const loserId = recordMatchDto.winnerId === match.playerAId ? match.playerBId : match.playerAId;
        
        await this.usersService.updateMatchStats(recordMatchDto.winnerId.toString(), true);
        await this.usersService.updateMatchStats(loserId.toString(), false);

        // Триггеры достижений за матчи
        await this.achievementsService.checkAndAwardAchievements(recordMatchDto.winnerId.toString(), 'match_won');
        await this.achievementsService.checkAndAwardAchievements(loserId.toString(), 'match_played');
      }
      
      return result;
    } else {
      return this.tournamentsRepository.confirmMatch(matchId, userId);
    }
  }

  async getTournamentStandings(tournamentId: string): Promise<any> {
    const tournament = await this.findById(tournamentId);
    
    switch (tournament.type) {
      case TournamentType.SINGLE_ELIMINATION:
        return this.getSingleEliminationStandings(tournament);
      case TournamentType.GROUPS_PLAYOFF:
        return this.getGroupsPlayoffStandings(tournament);
      case TournamentType.LEAGUE:
        return this.getLeagueStandings(tournament);
      case TournamentType.BLITZ:
        return this.getBlitzStandings(tournament);
      default:
        throw new BadRequestException(`Unsupported tournament type: ${tournament.type}`);
    }
  }

  private async generateInitialMatches(tournament: TournamentEntity): Promise<void> {
    switch (tournament.type) {
      case TournamentType.SINGLE_ELIMINATION:
        await this.generateSingleEliminationMatches(tournament);
        break;
      case TournamentType.GROUPS_PLAYOFF:
        await this.generateGroupsPlayoffMatches(tournament);
        break;
      case TournamentType.LEAGUE:
        await this.generateLeagueMatches(tournament);
        break;
      case TournamentType.BLITZ:
        await this.generateBlitzMatches(tournament);
        break;
      default:
        throw new BadRequestException(`Unsupported tournament type: ${tournament.type}`);
    }
  }

  private async generateSingleEliminationMatches(tournament: TournamentEntity): Promise<void> {
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
          status: MatchStatus.SCHEDULED,
          confirmedBy: [],
          scheduledAt: new Date(tournament.startDate)
        });
      } else {
        firstRoundMatches.push({
          tournamentId: tournament.id,
          round: 1,
          playerAId: shuffledPlayers[i].id,
          playerBId: shuffledPlayers[i + 1].id,
          status: MatchStatus.SCHEDULED,
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

  private async generateGroupsPlayoffMatches(tournament: TournamentEntity): Promise<void> {
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
            status: MatchStatus.SCHEDULED,
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

  private async generateLeagueMatches(tournament: TournamentEntity): Promise<void> {
    const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
    
    const matches = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        matches.push({
          tournamentId: tournament.id,
          playerAId: players[i].id,
          playerBId: players[j].id,
          status: MatchStatus.SCHEDULED,
          confirmedBy: [],
          scheduledAt: new Date(tournament.startDate)
        });
      }
    }
    
    await this.tournamentsRepository.createMatches(tournament.id.toString(), matches);
    
    const formatDetails = tournament.formatDetails || {};
    formatDetails.leagueTable = players.map((p: any) => ({
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

  private async generateBlitzMatches(tournament: TournamentEntity): Promise<void> {
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
          status: MatchStatus.SCHEDULED,
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
      playerScores: players.map((p: any) => ({
        playerId: p.id,
        points: 0,
        matchesPlayed: 0
      }))
    };
    
    await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
  }

  private async processNextStageMatch(tournament: TournamentEntity, completedMatch: TournamentMatchEntity, winnerId: number): Promise<void> {
    switch (tournament.type) {
      case TournamentType.SINGLE_ELIMINATION:
        await this.processSingleEliminationNextMatch(tournament, completedMatch, winnerId);
        break;
      case TournamentType.GROUPS_PLAYOFF:
        await this.updateGroupStandings(tournament, completedMatch, winnerId);
        await this.checkAndGeneratePlayoff(tournament);
        break;
      case TournamentType.LEAGUE:
        await this.updateLeagueStandings(tournament, completedMatch, winnerId);
        break;
      case TournamentType.BLITZ:
        await this.updateBlitzStandings(tournament, completedMatch, winnerId);
        break;
    }
  }

  private async processSingleEliminationNextMatch(tournament: TournamentEntity, completedMatch: TournamentMatchEntity, winnerId: number): Promise<void> {
    if (!completedMatch.round) return;
    
    const formatDetails = tournament.formatDetails || {};
    const bracketInfo = formatDetails.bracket || {};
    const totalRounds = bracketInfo.rounds || 0;
    
    if (completedMatch.round >= totalRounds) return;
    
    const matchesInCurrentRound = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), completedMatch.round);
    const currentRoundIndex = matchesInCurrentRound.findIndex((m: TournamentMatchEntity) => m.id === completedMatch.id);
    
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
        } else {
          playerAId = opponentMatch.winnerId;
          playerBId = winnerId;
        }
        
        const existingNextMatch = await this.tournamentsRepository.getMatchByRoundAndPosition(
          tournament.id.toString(),
          nextRound,
          nextRoundPosition
        );
        
        if (!existingNextMatch) {
          await this.tournamentsRepository.createMatches(tournament.id.toString(), [{
            tournamentId: tournament.id,
            round: nextRound,
            playerAId,
            playerBId,
            status: MatchStatus.SCHEDULED,
            confirmedBy: [],
            scheduledAt: new Date()
          }]);
        } else {
          await this.tournamentsRepository.updateMatch(existingNextMatch.id.toString(), {
            playerAId,
            playerBId
          });
        }
      }
    } else {
     
      await this.tournamentsRepository.createMatches(tournament.id.toString(), [{
        tournamentId: tournament.id,
        round: nextRound,
        playerAId: winnerId,
        playerBId: null, 
        status: MatchStatus.SCHEDULED,
        confirmedBy: [],
        scheduledAt: new Date()
      }]);
    }
  }

  private async updateGroupStandings(tournament: TournamentEntity, match: TournamentMatchEntity, winnerId: number): Promise<void> {
    if (!match.group) return;
    
    const formatDetails = tournament.formatDetails || {};
    const groups = formatDetails.groups || [];
    
    const group = groups.find((g: any) => g.name === match.group);
    if (!group) return;
    
    const { winner, loser, winnerSets, loserSets, winnerGames, loserGames } = this.parseScore(match.score || '', winnerId, match.playerAId, match.playerBId);
    
    const table = group.table || [];
    
    const winnerEntry = table.find((entry: any) => entry.playerId === winner);
    if (winnerEntry) {
      winnerEntry.played += 1;
      winnerEntry.wins += 1;
      
      if (winnerSets === 2 && loserSets === 0) {
        winnerEntry.points += 3;
      } else {
        winnerEntry.points += 2;
      }
      
      winnerEntry.setsDiff += (winnerSets - loserSets);
      winnerEntry.gamesDiff += (winnerGames - loserGames);
    }
    
    const loserEntry = table.find((entry: any) => entry.playerId === loser);
    if (loserEntry) {
      loserEntry.played += 1;
      loserEntry.losses += 1;
      
      if (loserSets === 1) {
        loserEntry.points += 1;
      }
      
      loserEntry.setsDiff += (loserSets - winnerSets);
      loserEntry.gamesDiff += (loserGames - winnerGames);
    }
    
    group.table = table.sort((a: any, b: any) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.setsDiff !== b.setsDiff) return b.setsDiff - a.setsDiff;
      return b.gamesDiff - a.gamesDiff;
    });
    
    const groupIndex = groups.findIndex((g: any) => g.name === match.group);
    if (groupIndex >= 0) {
      groups[groupIndex] = group;
    }
    
    await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails: { ...formatDetails, groups } });
  }

  private async checkAndGeneratePlayoff(tournament: TournamentEntity): Promise<void> {
    const formatDetails = tournament.formatDetails || {};
    
    if (formatDetails.playoffStarted) return;
    
    const allGroupMatches = await this.tournamentsRepository.getGroupMatches(tournament.id.toString());
    const allCompleted = allGroupMatches.every((match: TournamentMatchEntity) => match.status === MatchStatus.FINISHED);
    
    if (!allCompleted) return;
    
    const groups = formatDetails.groups || [];
    const advancingPerGroup = formatDetails.advancingPerGroup || 2;
    
    const advancingPlayers: number[] = [];
    groups.forEach((group: any) => {
      const table = group.table || [];
      const advancing = table.slice(0, advancingPerGroup).map((entry: any) => entry.playerId);
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
          status: MatchStatus.SCHEDULED,
          confirmedBy: [],
          scheduledAt: new Date()
        });
      } else {
        playoffMatches.push({
          tournamentId: tournament.id,
          round: 1,
          playerAId: advancingPlayers[i],
          playerBId: null,
          status: MatchStatus.SCHEDULED,
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

  private async updateLeagueStandings(tournament: TournamentEntity, match: TournamentMatchEntity, winnerId: number): Promise<void> {
    const formatDetails = tournament.formatDetails || {};
    const leagueTable = formatDetails.leagueTable || [];
    
    const { winner, loser, winnerSets, loserSets, winnerGames, loserGames } = this.parseScore(match.score || '', winnerId, match.playerAId, match.playerBId);
    

    const winnerEntry = leagueTable.find((entry: any) => entry.playerId === winner);
    if (winnerEntry) {
      winnerEntry.played += 1;
      winnerEntry.wins += 1;
      
      if (winnerSets === 2 && loserSets === 0) {
        winnerEntry.points += 3;
      } else {
        winnerEntry.points += 2;
      }
      
      winnerEntry.setsDiff += (winnerSets - loserSets);
      winnerEntry.gamesDiff += (winnerGames - loserGames);
    }
    
    const loserEntry = leagueTable.find((entry: any) => entry.playerId === loser);
    if (loserEntry) {
      loserEntry.played += 1;
      loserEntry.losses += 1;
      
      if (loserSets === 1) {
        loserEntry.points += 1;
      }
      
      loserEntry.setsDiff += (loserSets - winnerSets);
      loserEntry.gamesDiff += (loserGames - winnerGames);
    }
    
    formatDetails.leagueTable = leagueTable.sort((a: any, b: any) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.setsDiff !== b.setsDiff) return b.setsDiff - a.setsDiff;
      return b.gamesDiff - a.gamesDiff;
    });
    
    await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
  }

  private async updateBlitzStandings(tournament: TournamentEntity, match: TournamentMatchEntity, winnerId: number): Promise<void> {
    const formatDetails = tournament.formatDetails || {};
    const blitzFormat = formatDetails.blitzFormat || {};
    const playerScores = blitzFormat.playerScores || [];
    
    const loserId = winnerId === match.playerAId ? match.playerBId : match.playerAId;
    
    const winnerScore = playerScores.find((score: any) => score.playerId === winnerId);
    if (winnerScore) {
      winnerScore.points += 15;
      winnerScore.matchesPlayed += 1;
    }
    
    const loserScore = playerScores.find((score: any) => score.playerId === loserId);
    if (loserScore) {
      loserScore.points += 5; 
      loserScore.matchesPlayed += 1;
    }
    
    blitzFormat.playerScores = playerScores.sort((a: any, b: any) => b.points - a.points);
    
    formatDetails.blitzFormat = blitzFormat;
    await this.tournamentsRepository.update(tournament.id.toString(), { formatDetails });
  }

  private async processTournamentCompletion(tournament: TournamentEntity): Promise<void> {
    let winners: number[] = [];
    
    switch (tournament.type) {
      case TournamentType.SINGLE_ELIMINATION:
        winners = await this.determineSingleEliminationWinners(tournament);
        break;
      case TournamentType.GROUPS_PLAYOFF:
        winners = await this.determineGroupsPlayoffWinners(tournament);
        break;
      case TournamentType.LEAGUE:
        winners = await this.determineLeagueWinners(tournament);
        break;
      case TournamentType.BLITZ:
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

  private async determineSingleEliminationWinners(tournament: TournamentEntity): Promise<number[]> {
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
    const semifinalistsIds = semifinalMatches.map((match: TournamentMatchEntity) => [match.playerAId, match.playerBId]).flat().filter((id: number | null) => id !== null && id !== finalist && id !== winner);
    
    const thirdPlaceMatch = await this.tournamentsRepository.getThirdPlaceMatch(tournament.id.toString());
    let thirdPlace = null;
    
    if (thirdPlaceMatch && thirdPlaceMatch.winnerId) {
      thirdPlace = thirdPlaceMatch.winnerId;
    } else if (semifinalistsIds.length === 1) {
      thirdPlace = semifinalistsIds[0];
    }
    
    return [winner, finalist, thirdPlace].filter((id): id is number => id !== null);
  }

  private async determineGroupsPlayoffWinners(tournament: TournamentEntity): Promise<number[]> {
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
      } else {
        const semifinalMatches = await this.tournamentsRepository.getMatchesByRound(tournament.id.toString(), rounds - 1);
        const semifinalistsIds = semifinalMatches.map((match: TournamentMatchEntity) => [match.playerAId, match.playerBId]).flat().filter((id: number | null) => id !== null && id !== finalist && id !== winner);
        
        if (semifinalistsIds.length === 1) {
          thirdPlace = semifinalistsIds[0];
        }
      }
      
      return [winner, finalist, thirdPlace].filter((id): id is number => id !== null);
    } else {
      const groups = formatDetails.groups || [];
      const allPlayers: any[] = [];
      
      groups.forEach((group: any) => {
        const table = group.table || [];
        allPlayers.push(...table);
      });
      
      const sortedPlayers = allPlayers.sort((a: any, b: any) => {
        if (a.points !== b.points) return b.points - a.points;
        if (a.setsDiff !== b.setsDiff) return b.setsDiff - a.setsDiff;
        return b.gamesDiff - a.gamesDiff;
      });
      
      return sortedPlayers.slice(0, 3).map((player: any) => player.playerId);
    }
  }

  private async determineLeagueWinners(tournament: TournamentEntity): Promise<number[]> {
    const formatDetails = tournament.formatDetails || {};
    const leagueTable = formatDetails.leagueTable || [];
    
    return leagueTable.slice(0, 3).map((entry: any) => entry.playerId);
  }

  private async determineBlitzWinners(tournament: TournamentEntity): Promise<number[]> {
    const formatDetails = tournament.formatDetails || {};
    const blitzFormat = formatDetails.blitzFormat || {};
    const playerScores = blitzFormat.playerScores || [];
    
    return playerScores.slice(0, 3).map((score: any) => score.playerId);
  }

  private async awardTournamentAchievements(tournament: TournamentEntity, winners: number[]): Promise<void> {
    if (winners.length === 0) return;

    const winnerId = winners[0];
    const tournamentPlayers = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
    const totalParticipants = tournamentPlayers.length;

    this.logger.log(`🏆 Присваиваем достижения за турнир ${tournament.title} (ID: ${tournament.id})`);
    this.logger.log(`🥇 Победитель: ${winnerId}, участников: ${totalParticipants}`);

    try {
      // Базовое достижение за победу в турнире
      await this.achievementsService.checkAndAwardSingleAchievement(winnerId.toString(), 'tournament_winner', {
        tournamentId: tournament.id,
        tournamentType: tournament.type,
        participantsCount: totalParticipants,
        isRanked: tournament.isRanked
      });

      // Достижения по типу турнира
      switch (tournament.type) {
        case TournamentType.SINGLE_ELIMINATION:
          await this.achievementsService.checkAndAwardSingleAchievement(winnerId.toString(), 'bracket_master', {
            tournamentId: tournament.id
          });
          break;
          
        case TournamentType.GROUPS_PLAYOFF:
          await this.achievementsService.checkAndAwardSingleAchievement(winnerId.toString(), 'group_champion', {
            tournamentId: tournament.id
          });
          break;
          
        case TournamentType.LEAGUE:
          await this.achievementsService.checkAndAwardSingleAchievement(winnerId.toString(), 'league_master', {
            tournamentId: tournament.id
          });
          break;
          
        case TournamentType.BLITZ:
          await this.achievementsService.checkAndAwardSingleAchievement(winnerId.toString(), 'speed_demon', {
            tournamentId: tournament.id
          });
          break;
      }

      // Достижения по количеству участников
      if (totalParticipants >= 8) {
        await this.achievementsService.checkAndAwardSingleAchievement(winnerId.toString(), 'crowd_pleaser', {
          participantsCount: totalParticipants
        });
      }

      if (totalParticipants >= 16) {
        await this.achievementsService.checkAndAwardSingleAchievement(winnerId.toString(), 'tournament_dominator', {
          participantsCount: totalParticipants
        });
      }

      // Достижения для рейтинговых турниров
      if (tournament.isRanked) {
        await this.achievementsService.checkAndAwardSingleAchievement(winnerId.toString(), 'ranked_champion', {
          tournamentId: tournament.id
        });
      }

      // Достижения для финалистов (2-е место)
      if (winners.length > 1 && winners[1]) {
        await this.achievementsService.checkAndAwardSingleAchievement(winners[1].toString(), 'tournament_finalist', {
          tournamentId: tournament.id,
          place: 2
        });
      }

      // Достижения для призеров (3-е место)
      if (winners.length > 2 && winners[2]) {
        await this.achievementsService.checkAndAwardSingleAchievement(winners[2].toString(), 'tournament_medalist', {
          tournamentId: tournament.id,
          place: 3
        });
      }

      // Достижения по серии побед в турнирах (проверяем историю)
      await this.checkTournamentStreaks(winnerId.toString());

      // Достижения по месяцам активности
      await this.checkMonthlyTournamentAchievements(winnerId.toString());

      this.logger.log(`✅ Достижения за турнир успешно присвоены`);

    } catch (error: any) {
      this.logger.error(`❌ Ошибка при присвоении достижений за турнир: ${error.message}`);
    }
  }

  /**
   * Проверяем серии побед в турнирах
   */
  private async checkTournamentStreaks(userId: string): Promise<void> {
    try {
      // Получаем последние турниры пользователя
      const recentTournaments = await this.prisma.tournament.findMany({
        where: {
          players: {
            some: { id: parseInt(userId) }
          },
          status: TournamentStatus.COMPLETED
        },
        orderBy: { endDate: 'desc' },
        take: 10, // Берем последние 10 турниров
      });

      // Подсчитываем серию побед
      let currentStreak = 0;
      for (const tournament of recentTournaments) {
        const formatDetails = tournament.formatDetails || {};
        const winners = (formatDetails as any)?.winners || [];
        
        if (winners.length > 0 && winners[0] === parseInt(userId)) {
          currentStreak++;
        } else {
          break; // Серия прервана
        }
      }

      // Присваиваем достижения за серии
      if (currentStreak >= 3) {
        await this.achievementsService.checkAndAwardSingleAchievement(userId, 'tournament_streak_3', {
          streakCount: currentStreak
        });
      }

      if (currentStreak >= 5) {
        await this.achievementsService.checkAndAwardSingleAchievement(userId, 'tournament_streak_5', {
          streakCount: currentStreak
        });
      }

      if (currentStreak >= 10) {
        await this.achievementsService.checkAndAwardSingleAchievement(userId, 'tournament_legend', {
          streakCount: currentStreak
        });
      }

    } catch (error: any) {
      this.logger.error(`❌ Ошибка при проверке серий турниров: ${error.message}`);
    }
  }

  /**
   * Проверяем месячные достижения в турнирах
   */
  private async checkMonthlyTournamentAchievements(userId: string): Promise<void> {
    try {
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // Считаем турниры, выигранные в этом месяце
      const monthlyWins = await this.prisma.tournament.count({
        where: {
          status: TournamentStatus.COMPLETED,
          endDate: {
            gte: startOfMonth,
            lte: endOfMonth
          },
          formatDetails: {
            path: ['winners', '0'],
            equals: parseInt(userId)
          }
        }
      });

      // Присваиваем достижения
      if (monthlyWins >= 3) {
        await this.achievementsService.checkAndAwardSingleAchievement(userId, 'monthly_champion', {
          winsInMonth: monthlyWins,
          month: `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`
        });
      }

      if (monthlyWins >= 5) {
        await this.achievementsService.checkAndAwardSingleAchievement(userId, 'monthly_dominator', {
          winsInMonth: monthlyWins,
          month: `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`
        });
      }

    } catch (error: any) {
      this.logger.error(`❌ Ошибка при проверке месячных достижений: ${error.message}`);
    }
  }

  private async getSingleEliminationStandings(tournament: TournamentEntity): Promise<any> {
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
      type: TournamentType.SINGLE_ELIMINATION,
      bracketInfo,
      matchesByRound,
      thirdPlaceMatch,
      players: players.map((p: any) => ({ id: p.id, username: p.username }))
    };
  }

  private async getGroupsPlayoffStandings(tournament: TournamentEntity): Promise<any> {
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
      type: TournamentType.GROUPS_PLAYOFF,
      groups,
      groupMatches,
      playoffStarted,
      playoffInfo,
      players: players.map((p: any) => ({ id: p.id, username: p.username }))
    };
  }

  private async getLeagueStandings(tournament: TournamentEntity): Promise<any> {
    const formatDetails = tournament.formatDetails || {};
    const leagueTable = formatDetails.leagueTable || [];
    
    const matches = await this.tournamentsRepository.getTournamentMatches(tournament.id.toString());
    
    const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
    
    return {
      type: TournamentType.LEAGUE,
      leagueTable,
      matches,
      players: players.map((p: any) => ({ id: p.id, username: p.username }))
    };
  }

  private async getBlitzStandings(tournament: TournamentEntity): Promise<any> {
    const formatDetails = tournament.formatDetails || {};
    const blitzFormat = formatDetails.blitzFormat || {};
    
    const matches = await this.tournamentsRepository.getTournamentMatches(tournament.id.toString());
    
    const matchesByRound = matches.reduce((acc: { [key: number]: TournamentMatchEntity[] }, match: TournamentMatchEntity) => {
      if (!match.round) return acc;
      
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      
      acc[match.round].push(match);
      return acc;
    }, {});
    
    const players = await this.tournamentsRepository.getTournamentPlayers(tournament.id.toString());
    
    return {
      type: TournamentType.BLITZ,
      blitzFormat,
      matchesByRound,
      players: players.map((p: any) => ({ id: p.id, username: p.username }))
    };
  }

  private parseScore(score: string, winnerId: number, playerAId: number, playerBId: number): any {
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
      } else {
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

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private nextPowerOfTwo(n: number): number {
    if (n <= 0) return 1;
    n--;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
  }

  private rotateArray<T>(array: T[]): T[] {
    if (array.length <= 1) return array;
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
async getUserTournaments(userId: string, options: { status?: string } = {}): Promise<any[]> {
  const userIdInt = parseInt(userId);
  const { status } = options;
  
  // Построение фильтра состояния
  let statusFilter: any = {};
  if (status) {
    switch(status.toUpperCase()) {
      case 'UPCOMING':
        statusFilter = { status: TournamentStatus.DRAFT };
        break;
      case 'ACTIVE':
        statusFilter = { status: TournamentStatus.ACTIVE };
        break;
      case 'FINISHED':
        statusFilter = { status: TournamentStatus.COMPLETED };
        break;
      default:
        // По умолчанию не фильтруем
    }
  }
  
  // Найти все турниры, где участвует пользователь
  const tournaments = await this.prisma.tournament.findMany({
    where: {
      players: { // Используем правильное имя связи из схемы
        some: {
          id: userIdInt // Ищем по id пользователя
        }
      },
      ...statusFilter
    },
    orderBy: [
      { status: 'asc' },  // Сначала активные и предстоящие
      { startDate: 'desc' } // Затем по дате (новые в начале)
    ],
    include: {
      players: true,
      creator: { // Изменено с organizer на creator
        select: { id: true, firstName: true, lastName: true }
      }
    }
  });
  
  return tournaments.map((tournament: any) => ({
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
}