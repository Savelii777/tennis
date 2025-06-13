import { Telegraf } from 'telegraf';
import { BotContext } from './interfaces/context.interface';
import { AuthService } from '../auth/application/services/auth.service';
import { UsersService } from '../users/application/services/users.service';
import { RequestsService } from '../requests/application/services/requests.service';
import { TournamentsService } from '../tournaments/application/services/tournaments.service';
import { TrainingsService } from '../trainings/application/services/trainings.service';
export declare class BotService {
    private readonly bot;
    private readonly authService;
    private readonly usersService;
    private readonly requestsService;
    private readonly tournamentsService;
    private readonly trainingsService;
    private readonly logger;
    private mainKeyboard;
    constructor(bot: Telegraf<BotContext>, authService: AuthService, usersService: UsersService, requestsService: RequestsService, tournamentsService: TournamentsService, trainingsService: TrainingsService);
    private setupBot;
    handleStart(ctx: BotContext): Promise<void>;
    handleProfile(ctx: BotContext): Promise<import("@telegraf/types").Message.TextMessage | undefined>;
    handleGames(ctx: BotContext): Promise<void>;
    handlePlay(ctx: BotContext): Promise<void>;
    handleResults(ctx: BotContext): Promise<void>;
    handleTournaments(ctx: BotContext): Promise<void>;
    handleTraining(ctx: BotContext): Promise<void>;
    handleStories(ctx: BotContext): Promise<void>;
    handleAiCoach(ctx: BotContext): Promise<void>;
    handleCases(ctx: BotContext): Promise<void>;
}
