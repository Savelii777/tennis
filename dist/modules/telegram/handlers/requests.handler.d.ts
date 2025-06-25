import { Context, Telegraf } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
import { UsersService } from '../../users/application/services/users.service';
export declare class RequestsHandler {
    private readonly stateService;
    private readonly keyboardService;
    private readonly usersService;
    private readonly logger;
    constructor(stateService: StateService, keyboardService: KeyboardService, usersService: UsersService);
    register(bot: Telegraf<Context>): void;
    handlePlay(ctx: Context): Promise<void>;
    handleFindGame(ctx: Context): Promise<void>;
    handleCreateRequest(ctx: Context): Promise<void>;
    handleRequestInput(ctx: Context, text: string, userId: string): Promise<boolean>;
}
