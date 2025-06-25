import { Context, Telegraf } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
export declare class TrainingsHandler {
    private readonly stateService;
    private readonly keyboardService;
    private readonly logger;
    constructor(stateService: StateService, keyboardService: KeyboardService);
    register(bot: Telegraf<Context>): void;
    handleTrainings(ctx: Context): Promise<void>;
    handleCreateTraining(ctx: Context): Promise<void>;
    handleFindTraining(ctx: Context): Promise<void>;
    handleTrainingInput(ctx: Context, text: string, userId: string): Promise<boolean>;
}
