import { MediaType } from '../enums/media-type.enum';
import { StoryStatus } from '../enums/story-status.enum';
import { IStory } from '../interfaces/story.interface';

export class StoryEntity implements IStory {
  public readonly id: number;
  public readonly userId: number;
  public readonly telegramFileId: string;
  public telegramFilePath?: string;
  public readonly type: MediaType;
  public status: StoryStatus;
  public readonly createdAt: Date;
  public publishedAt?: Date;
  public readonly updatedAt: Date;

  constructor(data: IStory) {
    this.id = data.id;
    this.userId = data.userId;
    this.telegramFileId = data.telegramFileId;
    this.telegramFilePath = data.telegramFilePath;
    this.type = data.type;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.publishedAt = data.publishedAt;
    this.updatedAt = data.updatedAt;
  }

  public approve(): void {
    this.status = StoryStatus.APPROVED;
    this.publishedAt = new Date();
  }

  public reject(): void {
    this.status = StoryStatus.REJECTED;
  }

  public isApproved(): boolean {
    return this.status === StoryStatus.APPROVED;
  }

  public isPending(): boolean {
    return this.status === StoryStatus.PENDING;
  }

  public getFileUrl(botToken: string): string | null {
    if (!this.telegramFilePath) return null;
    return `https://api.telegram.org/file/bot${botToken}/${this.telegramFilePath}`;
  }
}