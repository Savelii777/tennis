import { UserEntity } from './user.entity';
import { SportType } from '../enums/sport-type.enum';
export declare class UserProfileEntity {
    id: number;
    user_id: number;
    user: UserEntity;
    avatar_url?: string;
    city?: string;
    country_code?: string;
    sport_type: SportType;
    ntrp_rating?: number;
    rating_points: number;
    matches_played: number;
    match_wins: number;
    match_losses: number;
    tournaments_played: number;
    tournaments_won: number;
    last_activity?: Date;
    achievements?: any;
    is_public_profile: boolean;
    createdAt: Date;
    updatedAt: Date;
    constructor(partial: Partial<UserProfileEntity>);
    get winRate(): string;
}
