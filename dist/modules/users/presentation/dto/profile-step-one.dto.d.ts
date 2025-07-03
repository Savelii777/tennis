import { SportType } from '../../domain/enums/sport-type.enum';
export declare class ProfileStepOneDto {
    firstName?: string;
    lastName?: string;
    city?: string;
    preferredCourt?: string;
    dominantHand?: string;
    preferredPlayTime?: string[];
    playsInTournaments?: boolean;
    weeklyPlayFrequency?: string;
    sportType: SportType;
}
