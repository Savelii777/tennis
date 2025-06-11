import { TournamentType } from '../../domain/enums/tournament.enum';
export declare class CreateTournamentDto {
    title: string;
    description?: string;
    type: TournamentType;
    startDate: Date;
    endDate: Date;
    formatDetails?: any;
    minPlayers: number;
    maxPlayers: number;
    isRanked: boolean;
    locationId?: number;
    locationName?: string;
}
