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
            firstName: string;
            lastName: string | null;
            id: number;
            username: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        status: import(".prisma/client").$Enums.StoryStatus;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        publishedAt: Date | null;
        caption: string | null;
        telegramFileId: string;
        telegramFilePath: string | null;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
    }>;
    findById(id: number): Promise<({
        user: {
            firstName: string;
            lastName: string | null;
            id: number;
            username: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        status: import(".prisma/client").$Enums.StoryStatus;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        publishedAt: Date | null;
        caption: string | null;
        telegramFileId: string;
        telegramFilePath: string | null;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
    }) | null>;
    findPublic(limit?: number): Promise<({
        user: {
            firstName: string;
            lastName: string | null;
            id: number;
            username: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        status: import(".prisma/client").$Enums.StoryStatus;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        publishedAt: Date | null;
        caption: string | null;
        telegramFileId: string;
        telegramFilePath: string | null;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
    })[]>;
    findPublicGroupedByUser(): Promise<({
        user: {
            firstName: string;
            lastName: string | null;
            id: number;
            username: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        status: import(".prisma/client").$Enums.StoryStatus;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        publishedAt: Date | null;
        caption: string | null;
        telegramFileId: string;
        telegramFilePath: string | null;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
    })[]>;
    findPopular(limit?: number): Promise<({
        user: {
            firstName: string;
            lastName: string | null;
            id: number;
            username: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        status: import(".prisma/client").$Enums.StoryStatus;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        publishedAt: Date | null;
        caption: string | null;
        telegramFileId: string;
        telegramFilePath: string | null;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
    })[]>;
    findRecent(limit?: number): Promise<({
        user: {
            firstName: string;
            lastName: string | null;
            id: number;
            username: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        status: import(".prisma/client").$Enums.StoryStatus;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        publishedAt: Date | null;
        caption: string | null;
        telegramFileId: string;
        telegramFilePath: string | null;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
    })[]>;
    findByUserId(userId: number): Promise<({
        user: {
            firstName: string;
            lastName: string | null;
            id: number;
            username: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        status: import(".prisma/client").$Enums.StoryStatus;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        publishedAt: Date | null;
        caption: string | null;
        telegramFileId: string;
        telegramFilePath: string | null;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
    })[]>;
    findPending(): Promise<({
        user: {
            firstName: string;
            lastName: string | null;
            id: number;
            username: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        status: import(".prisma/client").$Enums.StoryStatus;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        publishedAt: Date | null;
        caption: string | null;
        telegramFileId: string;
        telegramFilePath: string | null;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
    })[]>;
    updateStatus(id: number, status: StoryStatus, publishedAt?: Date): Promise<{
        user: {
            firstName: string;
            lastName: string | null;
            id: number;
            username: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
    } & {
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        status: import(".prisma/client").$Enums.StoryStatus;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        publishedAt: Date | null;
        caption: string | null;
        telegramFileId: string;
        telegramFilePath: string | null;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
    }>;
    updateFilePath(id: number, telegramFilePath: string): Promise<{
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        status: import(".prisma/client").$Enums.StoryStatus;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        publishedAt: Date | null;
        caption: string | null;
        telegramFileId: string;
        telegramFilePath: string | null;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
    }>;
    incrementViews(id: number): Promise<{
        type: import(".prisma/client").$Enums.MediaType;
        id: number;
        status: import(".prisma/client").$Enums.StoryStatus;
        updatedAt: Date;
        createdAt: Date;
        userId: number;
        publishedAt: Date | null;
        caption: string | null;
        telegramFileId: string;
        telegramFilePath: string | null;
        viewsCount: number;
        likesCount: number;
        expiresAt: Date | null;
    } | null>;
    private hasViewsCountField;
    private hasExpiresAtField;
}
