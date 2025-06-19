import { AchievementCode } from '../enums/achievement-codes.enum';
export interface AchievementDefinition {
    code: AchievementCode;
    name: string;
    description: string;
    icon: string;
    category: AchievementCategory;
    condition: string;
    isSecret?: boolean;
}
export declare enum AchievementCategory {
    ACTIVITY = "activity",
    MATCHES = "matches",
    VICTORIES = "victories",
    TOURNAMENTS = "tournaments",
    SOCIAL = "social",
    SKILLS = "skills",
    SPECIAL = "special"
}
export interface UserAchievementDto {
    id: number;
    code: string;
    awardedAt: Date;
    metadata?: any;
    definition: AchievementDefinition;
}
export interface AchievementCheckContext {
    userId: string;
    eventType: AchievementEventType;
    eventData?: any;
}
export declare enum AchievementEventType {
    REGISTRATION_COMPLETED = "registration_completed",
    MATCH_PLAYED = "match_played",
    MATCH_WON = "match_won",
    TOURNAMENT_PARTICIPATED = "tournament_participated",
    TOURNAMENT_WON = "tournament_won",
    MESSAGE_SENT = "message_sent",
    REFERRAL_REGISTERED = "referral_registered",
    LOGIN = "login"
}
