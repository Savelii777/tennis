import { StoriesRepository } from '../../infrastructure/repositories/stories.repository';
import { TelegramFileService } from '../../infrastructure/external/telegram-file.service';
import { TelegramService } from '../../../telegram/telegram.service';
import { CreateStoryDto } from '../dto/create-story.dto';
import { StoryResponseDto } from '../dto/story-response.dto';
import { MediaType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
interface UserStoryGroup {
    user: {
        id: number;
        name: string;
        avatar: string | null;
    };
    stories: {
        id: number;
        type: MediaType;
        fileUrl: string;
        caption: string | null;
        publishedAt: Date;
        viewsCount: number;
    }[];
}
export declare class StoriesService {
    private readonly storiesRepository;
    private readonly telegramFileService;
    private readonly telegramService;
    private readonly configService;
    private readonly logger;
    constructor(storiesRepository: StoriesRepository, telegramFileService: TelegramFileService, telegramService: TelegramService, configService: ConfigService);
    createStory(userId: number, createStoryDto: CreateStoryDto): Promise<StoryResponseDto>;
    getPublicStories(limit?: number): Promise<StoryResponseDto[]>;
    /**
     * Получить сторис для отображения в формате "stories" (карусель аватарок)
     * Группирует по пользователям и возвращает структуру для отображения в UI
     */
    getStoriesForCarousel(): Promise<UserStoryGroup[]>;
    getUserStories(userId: string | number): Promise<any[]>;
    getPopularStories(limit?: number): Promise<any[]>;
    getRecentStories(limit?: number): Promise<any[]>;
    getStoryById(id: number): Promise<StoryResponseDto>;
    recordView(storyId: number): Promise<void>;
    /**
     * Получение URL файла из Telegram
     */
    getFileUrl(storyId: number): Promise<{
        url: string;
    }>;
    getPendingStories(): Promise<StoryResponseDto[]>;
    approveStory(storyId: number): Promise<StoryResponseDto>;
    rejectStory(storyId: number): Promise<StoryResponseDto>;
    private mapToResponseDto;
}
export {};
