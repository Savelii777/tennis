import { TournamentsService } from '../../application/services/tournaments.service';
import { CreateTournamentDto } from '../../application/dto/create-tournament.dto';
import { UpdateTournamentDto } from '../../application/dto/update-tournament.dto';
import { RecordTournamentMatchDto } from '../../application/dto/record-tournament-match.dto';
import { Request as ExpressRequest } from 'express';
interface RequestWithUser extends ExpressRequest {
    user: {
        id: string;
    };
}
export declare class TournamentsController {
    private readonly tournamentsService;
    constructor(tournamentsService: TournamentsService);
    findAll(filters?: any): Promise<import("../../domain/entities/tournament.entity").TournamentEntity[]>;
    findOne(id: string): Promise<import("../../domain/entities/tournament.entity").TournamentEntity>;
    create(createTournamentDto: CreateTournamentDto, req: RequestWithUser): Promise<import("../../domain/entities/tournament.entity").TournamentEntity>;
    update(id: string, updateTournamentDto: UpdateTournamentDto, req: RequestWithUser): Promise<import("../../domain/entities/tournament.entity").TournamentEntity>;
    remove(id: string, req: RequestWithUser): Promise<void>;
    joinTournament(id: string, req: RequestWithUser): Promise<any>;
    leaveTournament(id: string, req: RequestWithUser): Promise<any>;
    getTournamentPlayers(id: string): Promise<any[]>;
    startTournament(id: string, req: RequestWithUser): Promise<import("../../domain/entities/tournament.entity").TournamentEntity>;
    completeTournament(id: string, req: RequestWithUser): Promise<import("../../domain/entities/tournament.entity").TournamentEntity>;
    getTournamentMatches(id: string): Promise<import("../../domain/entities/tournament-match.entity").TournamentMatchEntity[]>;
    getTournamentMatch(id: string, matchId: string): Promise<import("../../domain/entities/tournament-match.entity").TournamentMatchEntity>;
    recordMatchResult(id: string, matchId: string, recordMatchDto: RecordTournamentMatchDto, req: RequestWithUser): Promise<import("../../domain/entities/tournament-match.entity").TournamentMatchEntity>;
    getTournamentStandings(id: string): Promise<any>;
}
export {};
