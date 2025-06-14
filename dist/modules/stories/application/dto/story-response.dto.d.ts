import { MediaType } from '../../domain/enums/media-type.enum';
import { StoryStatus } from '../../domain/enums/story-status.enum';
export declare class StoryResponseDto {
    id: number;
    userId: number;
    telegramFileId: string;
    telegramFilePath?: string;
    type: MediaType;
    status: StoryStatus;
    createdAt: Date;
    publishedAt?: Date;
    fileUrl?: string;
    user?: {
        id: number;
        username?: string;
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
    };
}
