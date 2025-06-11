export declare enum SportType {
    TENNIS = "TENNIS",
    PADEL = "PADEL"
}
export declare class UserProfileDto {
    username: string;
    firstName: string;
    lastName?: string;
    avatarUrl?: string;
    city?: string;
    countryCode?: string;
    sportType: SportType;
    ntrpRating?: number;
    ratingPoints: number;
    matchesPlayed: number;
    matchWins: number;
    matchLosses: number;
    tournamentsPlayed: number;
    tournamentsWon: number;
    achievements?: Record<string, any>;
    isPublicProfile: boolean;
}
