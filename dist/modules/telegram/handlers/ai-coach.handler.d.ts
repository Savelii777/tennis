import { Context, Telegraf } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
export declare class AiCoachHandler {
    private readonly stateService;
    private readonly keyboardService;
    private readonly logger;
    constructor(stateService: StateService, keyboardService: KeyboardService);
    register(bot: Telegraf<Context>): void;
    handleAICoach(ctx: Context): Promise<void>;
    handleAskCoach(ctx: Context): Promise<void>;
    handleAIInput(ctx: Context, text: string, userId: string): Promise<boolean>;
}
