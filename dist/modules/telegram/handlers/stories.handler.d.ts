import { Context, Telegraf } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
import { StoriesService } from '../../stories/application/services/stories.service';
import { UsersService } from '../../users/application/services/users.service';
export declare class StoriesHandler {
    private readonly stateService;
    private readonly keyboardService;
    private readonly storiesService;
    private readonly usersService;
    private readonly logger;
    constructor(stateService: StateService, keyboardService: KeyboardService, storiesService: StoriesService, usersService: UsersService);
    register(bot: Telegraf<Context>): void;
    handleStories(ctx: Context): Promise<void>;
    handleCreateStory(ctx: Context): Promise<void>;
    handlePhoto(ctx: Context): Promise<boolean>;
    handleVideo(ctx: Context): Promise<boolean>;
    handleStoryInput(ctx: Context, text: string, userId: string): Promise<boolean>;
    handleMyStories(ctx: Context): Promise<void>;
    handlePopularStories(ctx: Context): Promise<void>;
    handleRecentStories(ctx: Context): Promise<void>;
    handleBackToStories(ctx: Context): Promise<void>;
}
