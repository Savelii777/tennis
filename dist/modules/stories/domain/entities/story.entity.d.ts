import { MediaType } from '../enums/media-type.enum';
import { StoryStatus } from '../enums/story-status.enum';
import { IStory } from '../interfaces/story.interface';
export declare class StoryEntity implements IStory {
    readonly id: number;
    readonly userId: number;
    readonly telegramFileId: string;
    telegramFilePath?: string;
    readonly type: MediaType;
    status: StoryStatus;
    readonly createdAt: Date;
    publishedAt?: Date;
    readonly updatedAt: Date;
    constructor(data: IStory);
    approve(): void;
    reject(): void;
    isApproved(): boolean;
    isPending(): boolean;
    getFileUrl(botToken: string): string | null;
}
