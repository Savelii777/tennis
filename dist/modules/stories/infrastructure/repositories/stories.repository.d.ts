import { PrismaService } from '../../../../prisma/prisma.service';
import { StoryEntity } from '../../domain/entities/story.entity';
import { ICreateStoryData } from '../../domain/interfaces/story.interface';
import { StoryStatus } from '../../domain/enums/story-status.enum';
export declare class StoriesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: ICreateStoryData): Promise<StoryEntity>;
    findById(id: number): Promise<StoryEntity | null>;
    findPublic(limit?: number): Promise<StoryEntity[]>;
    findByUserId(userId: number): Promise<StoryEntity[]>;
    findPendingForModeration(): Promise<StoryEntity[]>;
    updateStatus(id: number, status: StoryStatus): Promise<StoryEntity>;
    updateFilePath(id: number, filePath: string): Promise<StoryEntity>;
    delete(id: number): Promise<void>;
    private mapToEntity;
}
