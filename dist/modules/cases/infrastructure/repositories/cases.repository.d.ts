import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCaseDto, UpdateCaseDto } from '../../presentation/dto/case.dto';
import { CreateCaseItemDto, UpdateCaseItemDto } from '../../presentation/dto/case-item.dto';
export declare class CasesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateCaseDto): Promise<{
        _count: {
            openings: number;
            winnings: number;
        };
        items: {
            payload: import("@prisma/client/runtime/library").JsonValue;
            type: import(".prisma/client").$Enums.CaseItemType;
            name: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
        }[];
    } & {
        description: string;
        name: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        isActive: boolean;
        image: string | null;
        priceBalls: number;
    }>;
    findAll(includeInactive?: boolean): Promise<({
        _count: {
            openings: number;
            winnings: number;
        };
        items: {
            payload: import("@prisma/client/runtime/library").JsonValue;
            type: import(".prisma/client").$Enums.CaseItemType;
            name: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
        }[];
    } & {
        description: string;
        name: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        isActive: boolean;
        image: string | null;
        priceBalls: number;
    })[]>;
    findById(id: number): Promise<({
        _count: {
            openings: number;
            winnings: number;
        };
        items: {
            payload: import("@prisma/client/runtime/library").JsonValue;
            type: import(".prisma/client").$Enums.CaseItemType;
            name: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
        }[];
    } & {
        description: string;
        name: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        isActive: boolean;
        image: string | null;
        priceBalls: number;
    }) | null>;
    update(id: number, data: UpdateCaseDto): Promise<{
        _count: {
            openings: number;
            winnings: number;
        };
        items: {
            payload: import("@prisma/client/runtime/library").JsonValue;
            type: import(".prisma/client").$Enums.CaseItemType;
            name: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
        }[];
    } & {
        description: string;
        name: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        isActive: boolean;
        image: string | null;
        priceBalls: number;
    }>;
    delete(id: number): Promise<{
        description: string;
        name: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        isActive: boolean;
        image: string | null;
        priceBalls: number;
    }>;
    createItem(caseId: number, data: CreateCaseItemDto): Promise<{
        payload: import("@prisma/client/runtime/library").JsonValue;
        type: import(".prisma/client").$Enums.CaseItemType;
        name: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        isActive: boolean;
        dropChance: number;
        imageUrl: string | null;
        caseId: number;
    }>;
    findItemsByCaseId(caseId: number, includeInactive?: boolean): Promise<{
        payload: import("@prisma/client/runtime/library").JsonValue;
        type: import(".prisma/client").$Enums.CaseItemType;
        name: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
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
            updatedAt: Date;
            createdAt: Date;
            isActive: boolean;
            image: string | null;
            priceBalls: number;
        };
    } & {
        payload: import("@prisma/client/runtime/library").JsonValue;
        type: import(".prisma/client").$Enums.CaseItemType;
        name: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        isActive: boolean;
        dropChance: number;
        imageUrl: string | null;
        caseId: number;
    }) | null>;
    updateItem(id: number, data: UpdateCaseItemDto): Promise<{
        payload: import("@prisma/client/runtime/library").JsonValue;
        type: import(".prisma/client").$Enums.CaseItemType;
        name: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        isActive: boolean;
        dropChance: number;
        imageUrl: string | null;
        caseId: number;
    }>;
    deleteItem(id: number): Promise<{
        payload: import("@prisma/client/runtime/library").JsonValue;
        type: import(".prisma/client").$Enums.CaseItemType;
        name: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
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
            updatedAt: Date;
            createdAt: Date;
            isActive: boolean;
            image: string | null;
            priceBalls: number;
        };
        item: {
            payload: import("@prisma/client/runtime/library").JsonValue;
            type: import(".prisma/client").$Enums.CaseItemType;
            name: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
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
            description: string;
            name: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            isActive: boolean;
            image: string | null;
            priceBalls: number;
        };
        winning: ({
            item: {
                payload: import("@prisma/client/runtime/library").JsonValue;
                type: import(".prisma/client").$Enums.CaseItemType;
                name: string;
                id: number;
                updatedAt: Date;
                createdAt: Date;
                isActive: boolean;
                dropChance: number;
                imageUrl: string | null;
                caseId: number;
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
            id: number;
            telegramId: string;
            username: string;
            firstName: string;
            lastName: string | null;
            isVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
            countryCode: string | null;
            cityId: number | null;
            sportId: number | null;
            sportType: string | null;
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
            description: string;
            name: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            isActive: boolean;
            image: string | null;
            priceBalls: number;
        };
        item: {
            payload: import("@prisma/client/runtime/library").JsonValue;
            type: import(".prisma/client").$Enums.CaseItemType;
            name: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            isActive: boolean;
            dropChance: number;
            imageUrl: string | null;
            caseId: number;
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
                payload: import("@prisma/client/runtime/library").JsonValue;
                type: import(".prisma/client").$Enums.CaseItemType;
                name: string;
                id: number;
                updatedAt: Date;
                createdAt: Date;
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
        updatedAt: Date;
        createdAt: Date;
        isActive: boolean;
        image: string | null;
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
                updatedAt: Date;
                createdAt: Date;
                isActive: boolean;
                image: string | null;
                priceBalls: number;
            };
        } & {
            payload: import("@prisma/client/runtime/library").JsonValue;
            type: import(".prisma/client").$Enums.CaseItemType;
            name: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
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
