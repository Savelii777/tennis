import { StoriesRepository } from '../../infrastructure/repositories/stories.repository';
import { TelegramFileService } from '../../infrastructure/external/telegram-file.service';
import { TelegramService } from '../../../telegram/telegram.service';
import { CreateStoryDto } from '../dto/create-story.dto';
import { StoryResponseDto } from '../dto/story-response.dto';
export declare class StoriesService {
    private readonly storiesRepository;
    private readonly telegramFileService;
    private readonly telegramService;
    private readonly logger;
    constructor(storiesRepository: StoriesRepository, telegramFileService: TelegramFileService, telegramService: TelegramService);
    createStory(userId: number, createStoryDto: CreateStoryDto): Promise<StoryResponseDto>;
    getPublicStories(): Promise<StoryResponseDto[]>;
    /**
     * Получить истории пользователя
     */
    getUserStories(userId: string | number): Promise<any[]>;
    getStoryById(id: number): Promise<StoryResponseDto>;
    getFileUrl(storyId: number): Promise<{
        url: string;
    }>;
    getPendingStories(): Promise<StoryResponseDto[]>;
    approveStory(storyId: number): Promise<StoryResponseDto>;
    rejectStory(storyId: number): Promise<StoryResponseDto>;
    deleteStory(storyId: number): Promise<void>;
    private mapToResponseDto;
}
