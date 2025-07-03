import { PrismaService } from '../../../../prisma/prisma.service';
import { StoryStatus, MediaType } from '@prisma/client';
export declare class StoriesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        userId: number;
        telegramFileId: string;
        type: MediaType;
        caption?: string;
        status: StoryStatus;
    }): Promise<{
        user: {
            id: number;
            username: string;
            firstName: string;
            lastName: string | null;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        caption: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        telegramFileId: string;
        telegramFilePath: string | null;
        status: import(".prisma/client").$Enums.StoryStatus;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
        publishedAt: Date | null;
    }>;
    findById(id: number): Promise<({
        user: {
            id: number;
            username: string;
            firstName: string;
            lastName: string | null;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        caption: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        telegramFileId: string;
        telegramFilePath: string | null;
        status: import(".prisma/client").$Enums.StoryStatus;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
        publishedAt: Date | null;
    }) | null>;
    findPublic(limit?: number): Promise<({
        user: {
            id: number;
            username: string;
            firstName: string;
            lastName: string | null;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        caption: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        telegramFileId: string;
        telegramFilePath: string | null;
        status: import(".prisma/client").$Enums.StoryStatus;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
        publishedAt: Date | null;
    })[]>;
    findPublicGroupedByUser(): Promise<({
        user: {
            id: number;
            username: string;
            firstName: string;
            lastName: string | null;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        caption: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        telegramFileId: string;
        telegramFilePath: string | null;
        status: import(".prisma/client").$Enums.StoryStatus;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
        publishedAt: Date | null;
    })[]>;
    findPopular(limit?: number): Promise<({
        user: {
            id: number;
            username: string;
            firstName: string;
            lastName: string | null;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        caption: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        telegramFileId: string;
        telegramFilePath: string | null;
        status: import(".prisma/client").$Enums.StoryStatus;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
        publishedAt: Date | null;
    })[]>;
    findRecent(limit?: number): Promise<({
        user: {
            id: number;
            username: string;
            firstName: string;
            lastName: string | null;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        caption: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        telegramFileId: string;
        telegramFilePath: string | null;
        status: import(".prisma/client").$Enums.StoryStatus;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
        publishedAt: Date | null;
    })[]>;
    findByUserId(userId: number): Promise<({
        user: {
            id: number;
            username: string;
            firstName: string;
            lastName: string | null;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        caption: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        telegramFileId: string;
        telegramFilePath: string | null;
        status: import(".prisma/client").$Enums.StoryStatus;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
        publishedAt: Date | null;
    })[]>;
    findPending(): Promise<({
        user: {
            id: number;
            username: string;
            firstName: string;
            lastName: string | null;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        caption: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        telegramFileId: string;
        telegramFilePath: string | null;
        status: import(".prisma/client").$Enums.StoryStatus;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
        publishedAt: Date | null;
    })[]>;
    updateStatus(id: number, status: StoryStatus, publishedAt?: Date): Promise<{
        user: {
            id: number;
            username: string;
            firstName: string;
            lastName: string | null;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        caption: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        telegramFileId: string;
        telegramFilePath: string | null;
        status: import(".prisma/client").$Enums.StoryStatus;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
        publishedAt: Date | null;
    }>;
    updateFilePath(id: number, telegramFilePath: string): Promise<{
        caption: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        telegramFileId: string;
        telegramFilePath: string | null;
        status: import(".prisma/client").$Enums.StoryStatus;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
        publishedAt: Date | null;
    }>;
    incrementViews(id: number): Promise<{
        caption: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        telegramFileId: string;
        telegramFilePath: string | null;
        status: import(".prisma/client").$Enums.StoryStatus;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
        publishedAt: Date | null;
    } | null>;
    private hasViewsCountField;
    private hasExpiresAtField;
}
