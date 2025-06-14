import { StoriesService } from '../../application/services/stories.service';
import { CreateStoryDto } from '../../application/dto/create-story.dto';
import { StoryResponseDto } from '../../application/dto/story-response.dto';
import { Request as ExpressRequest } from 'express';
interface RequestWithUser extends ExpressRequest {
    user: {
        id: number;
        username: string;
    };
}
export declare class StoriesController {
    private readonly storiesService;
    constructor(storiesService: StoriesService);
    getPublicStories(): Promise<StoryResponseDto[]>;
    getMyStories(req: RequestWithUser): Promise<StoryResponseDto[]>;
    getStoryById(id: number): Promise<StoryResponseDto>;
    getFileUrl(id: number): Promise<{
        url: string;
    }>;
    createStory(createStoryDto: CreateStoryDto, req: RequestWithUser): Promise<StoryResponseDto>;
    getPendingStories(): Promise<StoryResponseDto[]>;
    approveStory(id: number): Promise<StoryResponseDto>;
    rejectStory(id: number): Promise<StoryResponseDto>;
    deleteStory(id: number): Promise<void>;
}
export {};
