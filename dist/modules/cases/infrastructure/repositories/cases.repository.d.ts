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
            updatedAt: Date;
            createdAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            caseId: number;
            imageUrl: string | null;
        }[];
        _count: {
            openings: number;
            winnings: number;
        };
    } & {
        name: string;
        description: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        image: string | null;
        priceBalls: number;
        isActive: boolean;
    }>;
    findAll(includeInactive?: boolean): Promise<({
        items: {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            caseId: number;
            imageUrl: string | null;
        }[];
        _count: {
            openings: number;
            winnings: number;
        };
    } & {
        name: string;
        description: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        image: string | null;
        priceBalls: number;
        isActive: boolean;
    })[]>;
    findById(id: number): Promise<({
        items: {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            caseId: number;
            imageUrl: string | null;
        }[];
        _count: {
            openings: number;
            winnings: number;
        };
    } & {
        name: string;
        description: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        image: string | null;
        priceBalls: number;
        isActive: boolean;
    }) | null>;
    update(id: number, data: UpdateCaseDto): Promise<{
        items: {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            caseId: number;
            imageUrl: string | null;
        }[];
        _count: {
            openings: number;
            winnings: number;
        };
    } & {
        name: string;
        description: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        image: string | null;
        priceBalls: number;
        isActive: boolean;
    }>;
    delete(id: number): Promise<{
        name: string;
        description: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        image: string | null;
        priceBalls: number;
        isActive: boolean;
    }>;
    createItem(caseId: number, data: CreateCaseItemDto): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.CaseItemType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        payload: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        dropChance: number;
        caseId: number;
        imageUrl: string | null;
    }>;
    findItemsByCaseId(caseId: number, includeInactive?: boolean): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.CaseItemType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        payload: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        dropChance: number;
        caseId: number;
        imageUrl: string | null;
    }[]>;
    findItemById(id: number): Promise<({
        case: {
            name: string;
            description: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            image: string | null;
            priceBalls: number;
            isActive: boolean;
        };
    } & {
        name: string;
        type: import(".prisma/client").$Enums.CaseItemType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        payload: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        dropChance: number;
        caseId: number;
        imageUrl: string | null;
    }) | null>;
    updateItem(id: number, data: UpdateCaseItemDto): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.CaseItemType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        payload: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        dropChance: number;
        caseId: number;
        imageUrl: string | null;
    }>;
    deleteItem(id: number): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.CaseItemType;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        payload: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        dropChance: number;
        caseId: number;
        imageUrl: string | null;
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
            name: string;
            description: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            image: string | null;
            priceBalls: number;
            isActive: boolean;
        };
        item: {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            caseId: number;
            imageUrl: string | null;
        };
    } & {
        id: number;
        updatedAt: Date;
        createdAt: Date;
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
            name: string;
            description: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            image: string | null;
            priceBalls: number;
            isActive: boolean;
        };
        winning: ({
            item: {
                name: string;
                type: import(".prisma/client").$Enums.CaseItemType;
                id: number;
                updatedAt: Date;
                createdAt: Date;
                payload: import("@prisma/client/runtime/library").JsonValue;
                isActive: boolean;
                dropChance: number;
                caseId: number;
                imageUrl: string | null;
            };
        } & {
            id: number;
            updatedAt: Date;
            createdAt: Date;
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
            firstName: string;
            lastName: string | null;
            sportType: string | null;
            id: number;
            telegramId: string;
            username: string;
            isVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
            countryCode: string | null;
            cityId: number | null;
            sportId: number | null;
            updatedAt: Date;
            createdAt: Date;
            authSource: import(".prisma/client").$Enums.AuthSource;
            lastLogin: Date | null;
            ballsBalance: number;
            casesOpened: number;
            telegramChatId: bigint | null;
            referralCode: string | null;
            referredBy: number | null;
        };
        case: {
            name: string;
            description: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            image: string | null;
            priceBalls: number;
            isActive: boolean;
        };
        item: {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            caseId: number;
            imageUrl: string | null;
        };
    } & {
        id: number;
        updatedAt: Date;
        createdAt: Date;
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
        updatedAt: Date;
        createdAt: Date;
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
                updatedAt: Date;
                createdAt: Date;
                payload: import("@prisma/client/runtime/library").JsonValue;
                isActive: boolean;
                dropChance: number;
                caseId: number;
                imageUrl: string | null;
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
        name: string;
        description: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        image: string | null;
        priceBalls: number;
        isActive: boolean;
    })[]>;
    getItemStatistics(itemId: number): Promise<{
        item: ({
            case: {
                _count: {
                    openings: number;
                };
            } & {
                name: string;
                description: string;
                id: number;
                updatedAt: Date;
                createdAt: Date;
                image: string | null;
                priceBalls: number;
                isActive: boolean;
            };
        } & {
            name: string;
            type: import(".prisma/client").$Enums.CaseItemType;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            dropChance: number;
            caseId: number;
            imageUrl: string | null;
        }) | null;
        winCount: number;
        totalOpenings: number;
        expectedWinRate: string;
        actualWinRate: string;
    }>;
}
