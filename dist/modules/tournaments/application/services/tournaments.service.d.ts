import { TournamentsRepository } from '../../infrastructure/repositories/tournaments.repository';
import { TournamentEntity } from '../../domain/entities/tournament.entity';
import { TournamentMatchEntity } from '../../domain/entities/tournament-match.entity';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';
import { RecordTournamentMatchDto } from '../dto/record-tournament-match.dto';
import { UsersService } from '../../../users/application/services/users.service';
import { PrismaService } from '../../../../prisma/prisma.service';
export declare class TournamentsService {
    private readonly tournamentsRepository;
    private readonly usersService;
    private readonly prisma;
    private readonly logger;
    constructor(tournamentsRepository: TournamentsRepository, usersService: UsersService, prisma: PrismaService);
    findAll(filters?: any): Promise<TournamentEntity[]>;
    findById(id: string): Promise<TournamentEntity>;
    findByCreator(creatorId: string): Promise<TournamentEntity[]>;
    create(userId: string, createTournamentDto: CreateTournamentDto): Promise<TournamentEntity>;
    update(id: string, userId: string, updateTournamentDto: UpdateTournamentDto): Promise<TournamentEntity>;
    delete(id: string, userId: string): Promise<void>;
    joinTournament(tournamentId: string, userId: string): Promise<any>;
    leaveTournament(tournamentId: string, userId: string): Promise<any>;
    startTournament(id: string, userId: string): Promise<TournamentEntity>;
    completeTournament(id: string, userId: string): Promise<TournamentEntity>;
    getTournamentMatches(tournamentId: string): Promise<TournamentMatchEntity[]>;
    getTournamentMatch(tournamentId: string, matchId: string): Promise<TournamentMatchEntity>;
    recordMatchResult(tournamentId: string, matchId: string, userId: string, recordMatchDto: RecordTournamentMatchDto): Promise<TournamentMatchEntity>;
    getTournamentStandings(tournamentId: string): Promise<any>;
    private generateInitialMatches;
    private generateSingleEliminationMatches;
    private generateGroupsPlayoffMatches;
    private generateLeagueMatches;
    private generateBlitzMatches;
    private processNextStageMatch;
    private processSingleEliminationNextMatch;
    private updateGroupStandings;
    private checkAndGeneratePlayoff;
    private updateLeagueStandings;
    private updateBlitzStandings;
    private processTournamentCompletion;
    private determineSingleEliminationWinners;
    private determineGroupsPlayoffWinners;
    private determineLeagueWinners;
    private determineBlitzWinners;
    private awardTournamentAchievements;
    private getSingleEliminationStandings;
    private getGroupsPlayoffStandings;
    private getLeagueStandings;
    private getBlitzStandings;
    private parseScore;
    private shuffleArray;
    private nextPowerOfTwo;
    private rotateArray;
    /**
     * Получить турниры пользователя с фильтрацией
     */
    getUserTournaments(userId: string, options?: {
        status?: string;
    }): Promise<any[]>;
}
