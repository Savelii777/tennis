import { Context, Telegraf } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
import { UsersService } from '../../users/application/services/users.service';
import { RatingsService } from '../../ratings/ratings.service';
import { BallsService } from '../../users/application/services/balls.service';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class ProfileHandler {
    private readonly stateService;
    private readonly keyboardService;
    private readonly usersService;
    private readonly ratingsService;
    private readonly ballsService;
    private readonly prisma;
    private readonly logger;
    constructor(stateService: StateService, keyboardService: KeyboardService, usersService: UsersService, ratingsService: RatingsService, ballsService: BallsService, prisma: PrismaService);
    register(bot: Telegraf<Context>): void;
    handleProfile(ctx: Context): Promise<void>;
    handleDetailedStats(ctx: Context): Promise<void>;
    handleUserAchievements(ctx: Context): Promise<void>;
    handleSetupProfileAction(ctx: Context): Promise<void>;
    handleTournamentsSelection(participates: boolean, ctx: Context): Promise<void>;
    handleLevelSelection(level: string, ctx: Context): Promise<void>;
    /**
     * Метод для сохранения данных профиля
     */
    completeProfileSetup(telegramUserId: string, profileData: any): Promise<void>;
    handleMatchHistory(ctx: Context): Promise<void>;
    handleUserGoals(ctx: Context): Promise<void>;
    handleBackToProfile(ctx: Context): Promise<void>;
    handleSettings(ctx: Context): Promise<void>;
    private getLevelText;
    private getDominantHandText;
    handleFrequencySelection(frequency: string, ctx: Context): Promise<void>;
    handleProfileInput(ctx: Context, text: string, userId: string): Promise<boolean>;
    processFrequencySelection(frequency: string, ctx: Context, userId: string, userState: any): Promise<boolean>;
    handleCity(ctx: Context, text: string, userId: string, userState: any): Promise<boolean>;
    handleCourt(ctx: Context, text: string, userId: string, userState: any): Promise<boolean>;
    handleHandSelection(hand: 'LEFT' | 'RIGHT', ctx: Context): Promise<void>;
    private handleFrequency;
    private handleTournaments;
    private handleLevel;
    formatProfileMessage(user: any): Promise<string>;
    handleProfileCommand(ctx: Context): Promise<void>;
}
