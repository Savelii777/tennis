import { MediaType } from '../enums/media-type.enum';
import { StoryStatus } from '../enums/story-status.enum';
export interface IStory {
    id: number;
    userId: number;
    telegramFileId: string;
    telegramFilePath?: string;
    type: MediaType;
    status: StoryStatus;
    createdAt: Date;
    publishedAt?: Date;
    updatedAt: Date;
}
export interface ICreateStoryData {
    userId: number;
    telegramFileId: string;
    type: MediaType;
    telegramFilePath?: string;
}
export interface ITelegramFileResponse {
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    file_path?: string;
}
