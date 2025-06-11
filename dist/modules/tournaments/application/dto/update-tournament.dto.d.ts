import { TournamentType, TournamentStatus } from '../../domain/enums/tournament.enum';
export declare class UpdateTournamentDto {
    title?: string;
    description?: string;
    type?: TournamentType;
    status?: TournamentStatus;
    startDate?: Date;
    endDate?: Date;
    formatDetails?: any;
    isRanked?: boolean;
    locationId?: number;
    locationName?: string;
}
