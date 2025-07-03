import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCaseDto, UpdateCaseDto } from '../../presentation/dto/case.dto';
import { CreateCaseItemDto, UpdateCaseItemDto } from '../../presentation/dto/case-item.dto';
export declare class CasesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateCaseDto): Promise<{
        items: {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
        }[];
        _count: {
            openings: number;
            winnings: number;
        };
    } & {
        description: string;
        name: string;
        id: number;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        priceBalls: number;
    }>;
    findAll(includeInactive?: boolean): Promise<({
        items: {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
        }[];
        _count: {
            openings: number;
            winnings: number;
        };
    } & {
        description: string;
        name: string;
        id: number;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        priceBalls: number;
    })[]>;
    findById(id: number): Promise<({
        items: {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
        }[];
        _count: {
            openings: number;
            winnings: number;
        };
    } & {
        description: string;
        name: string;
        id: number;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        priceBalls: number;
    }) | null>;
    update(id: number, data: UpdateCaseDto): Promise<{
        items: {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
        }[];
        _count: {
            openings: number;
            winnings: number;
        };
    } & {
        description: string;
        name: string;
        id: number;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        priceBalls: number;
    }>;
    delete(id: number): Promise<{
        description: string;
        name: string;
        id: number;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        priceBalls: number;
    }>;
    createItem(caseId: number, data: CreateCaseItemDto): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.CaseItemType;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        payload: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        dropChance: number;
        imageUrl: string | null;
        caseId: number;
    }>;
    findItemsByCaseId(caseId: number, includeInactive?: boolean): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.CaseItemType;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        payload: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        dropChance: number;
        imageUrl: string | null;
        caseId: number;
    }[]>;
    findItemById(id: number): Promise<({
        case: {
            description: string;
            name: string;
            id: number;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            priceBalls: number;
        };
    } & {
        name: string;
        type: import(".prisma/client").$Enums.CaseItemType;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        payload: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        dropChance: number;
        imageUrl: string | null;
        caseId: number;
    }) | null>;
    updateItem(id: number, data: UpdateCaseItemDto): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.CaseItemType;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        payload: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        dropChance: number;
        imageUrl: string | null;
        caseId: number;
    }>;
    deleteItem(id: number): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.CaseItemType;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        payload: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        dropChance: number;
        imageUrl: string | null;
        caseId: number;
    }>;
    createOpening(data: any): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        caseId: number;
        ballsSpent: number;
    }>;
    createWinning(data: any): Promise<{
        case: {
            description: string;
            name: string;
            id: number;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            priceBalls: number;
        };
        item: {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        caseId: number;
        openingId: number;
        itemId: number;
        isProcessed: boolean;
        processedAt: Date | null;
        notes: string | null;
    }>;
    getUserOpenings(userId: number, page: number, limit: number): Promise<({
        case: {
            description: string;
            name: string;
            id: number;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            priceBalls: number;
        };
        winning: ({
            item: {
                name: string;
                type: import(".prisma/client").$Enums.CaseItemType;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                payload: import("@prisma/client/runtime/library").JsonValue;
                isActive: boolean;
                dropChance: number;
                imageUrl: string | null;
                caseId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            caseId: number;
            openingId: number;
            itemId: number;
            isProcessed: boolean;
            processedAt: Date | null;
            notes: string | null;
        }) | null;
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        caseId: number;
        ballsSpent: number;
    })[]>;
    findWinningById(id: number): Promise<({
        user: {
            id: number;
            username: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.Role;
            firstName: string;
            lastName: string | null;
            countryCode: string | null;
            telegramId: string;
            isVerified: boolean;
            cityId: number | null;
            sportId: number | null;
            authSource: import(".prisma/client").$Enums.AuthSource;
            lastLogin: Date | null;
            ballsBalance: number;
            casesOpened: number;
            telegramChatId: bigint | null;
            referralCode: string | null;
            referredBy: number | null;
        };
        case: {
            description: string;
            name: string;
            id: number;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            priceBalls: number;
        };
        item: {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        caseId: number;
        openingId: number;
        itemId: number;
        isProcessed: boolean;
        processedAt: Date | null;
        notes: string | null;
    }) | null>;
    updateWinning(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        caseId: number;
        openingId: number;
        itemId: number;
        isProcessed: boolean;
        processedAt: Date | null;
        notes: string | null;
    }>;
    getUserById(id: number): Promise<{
        id: number;
        ballsBalance: number;
    } | null>;
    getCaseStatistics(caseId: number): Promise<{
        totalOpenings: number;
        totalWinnings: number;
        itemStatistics: {
            item: {
                name: string;
                type: import(".prisma/client").$Enums.CaseItemType;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                payload: import("@prisma/client/runtime/library").JsonValue;
                isActive: boolean;
                dropChance: number;
                imageUrl: string | null;
                caseId: number;
            } | null;
            winCount: number;
            winRate: string;
        }[];
    }>;
    getAllCasesStatistics(): Promise<({
        _count: {
            openings: number;
            winnings: number;
        };
    } & {
        description: string;
        name: string;
        id: number;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        priceBalls: number;
    })[]>;
    getItemStatistics(itemId: number): Promise<{
        item: ({
            case: {
                _count: {
                    openings: number;
                };
            } & {
                description: string;
                name: string;
                id: number;
                image: string | null;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                priceBalls: number;
            };
        } & {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
        }) | null;
        winCount: number;
        totalOpenings: number;
        expectedWinRate: string;
        actualWinRate: string;
    }>;
}
