import { CasesService } from '../../application/services/cases.service';
import { CaseItemsService } from '../../application/services/case-items.service';
import { CaseOpeningService } from '../../application/services/case-opening.service';
import { CreateCaseDto, UpdateCaseDto } from '../dto/case.dto';
import { CreateCaseItemDto, UpdateCaseItemDto } from '../dto/case-item.dto';
export declare class AdminCasesController {
    private readonly casesService;
    private readonly caseItemsService;
    private readonly caseOpeningService;
    constructor(casesService: CasesService, caseItemsService: CaseItemsService, caseOpeningService: CaseOpeningService);
    createCase(createCaseDto: CreateCaseDto): Promise<{
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
    getAllCases(includeInactive?: string): Promise<({
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
    getCaseById(id: string): Promise<{
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
    updateCase(id: string, updateCaseDto: UpdateCaseDto): Promise<{
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
    deleteCase(id: string): Promise<{
        description: string;
        name: string;
        id: number;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        priceBalls: number;
    }>;
    toggleCaseStatus(id: string): Promise<{
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
    createCaseItem(caseId: string, createItemDto: CreateCaseItemDto): Promise<{
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
    getCaseItems(caseId: string, includeInactive?: string): Promise<{
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
    updateCaseItem(itemId: string, updateItemDto: UpdateCaseItemDto): Promise<{
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
    deleteCaseItem(itemId: string): Promise<{
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
    toggleItemStatus(itemId: string): Promise<{
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
    getCaseStatistics(id: string): Promise<{
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
    getItemStatistics(itemId: string): Promise<{
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
    processWinning(winningId: string, notes?: string): Promise<{
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
}
