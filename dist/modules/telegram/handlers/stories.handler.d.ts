import { Context, Telegraf } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
export declare class StoriesHandler {
    private readonly stateService;
    private readonly keyboardService;
    private readonly logger;
    constructor(stateService: StateService, keyboardService: KeyboardService);
    register(bot: Telegraf<Context>): void;
    handleStories(ctx: Context): Promise<void>;
    handleCreateStory(ctx: Context): Promise<void>;
    handlePhoto(ctx: Context): Promise<void>;
    handleVideo(ctx: Context): Promise<void>;
    handleStoryInput(ctx: Context, text: string, userId: string): Promise<boolean>;
}
