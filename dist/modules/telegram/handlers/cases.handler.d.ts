import { Context, Telegraf } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
export declare class CasesHandler {
    private readonly stateService;
    private readonly keyboardService;
    private readonly logger;
    constructor(stateService: StateService, keyboardService: KeyboardService);
    register(bot: Telegraf<Context>): void;
    handleCases(ctx: Context): Promise<void>;
    handleOpenCase(ctx: Context): Promise<void>;
    handleBuyBalls(ctx: Context): Promise<void>;
}
