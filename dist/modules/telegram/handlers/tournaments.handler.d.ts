import { Context, Telegraf } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
import { UsersService } from '../../users/application/services/users.service';
export declare class TournamentsHandler {
    private readonly stateService;
    private readonly keyboardService;
    private readonly usersService;
    private readonly logger;
    constructor(stateService: StateService, keyboardService: KeyboardService, usersService: UsersService);
    register(bot: Telegraf<Context>): void;
    handleTournaments(ctx: Context): Promise<void>;
    handleCreateTournament(ctx: Context): Promise<void>;
    handleFindTournament(ctx: Context): Promise<void>;
    handleLocations(ctx: Context): Promise<void>;
    handleTournamentInput(ctx: Context, text: string, userId: string): Promise<boolean>;
}
