import { StoriesService } from '../../application/services/stories.service';
import { CreateStoryDto } from '../../application/dto/create-story.dto';
import { StoryResponseDto } from '../../application/dto/story-response.dto';
import { Response } from 'express';
import { RequestWithUser } from '../../../auth/interfaces/request-with-user.interface';
export declare class StoriesController {
    private readonly storiesService;
    constructor(storiesService: StoriesService);
    getPublicStories(): Promise<StoryResponseDto[]>;
    getStoriesForCarousel(): Promise<any>;
    getPopularStories(): Promise<StoryResponseDto[]>;
    getUserStories(userId: number): Promise<StoryResponseDto[]>;
    getStoryById(id: number): Promise<StoryResponseDto>;
    getStoryFile(id: number, res: Response): Promise<void>;
    createStory(createStoryDto: CreateStoryDto, req: RequestWithUser): Promise<StoryResponseDto>;
    getPendingStories(): Promise<StoryResponseDto[]>;
    approveStory(id: number): Promise<StoryResponseDto>;
    rejectStory(id: number): Promise<StoryResponseDto>;
}
