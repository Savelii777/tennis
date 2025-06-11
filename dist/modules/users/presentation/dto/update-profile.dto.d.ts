import { SportType } from '../../domain/enums/sport-type.enum';
export declare class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    city?: string;
    countryCode?: string;
    sportType?: SportType;
    ntrpRating?: number;
    isPublicProfile?: boolean;
}
