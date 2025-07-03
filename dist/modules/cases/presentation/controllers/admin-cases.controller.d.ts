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
    getAllCases(includeInactive?: string): Promise<({
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
    getCaseById(id: string): Promise<{
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
    updateCase(id: string, updateCaseDto: UpdateCaseDto): Promise<{
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
    deleteCase(id: string): Promise<{
        name: string;
        description: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        image: string | null;
        priceBalls: number;
        isActive: boolean;
    }>;
    toggleCaseStatus(id: string): Promise<{
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
    createCaseItem(caseId: string, createItemDto: CreateCaseItemDto): Promise<{
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
    getCaseItems(caseId: string, includeInactive?: string): Promise<{
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
    updateCaseItem(itemId: string, updateItemDto: UpdateCaseItemDto): Promise<{
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
    deleteCaseItem(itemId: string): Promise<{
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
    toggleItemStatus(itemId: string): Promise<{
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
    getCaseStatistics(id: string): Promise<{
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
    getItemStatistics(itemId: string): Promise<{
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
    processWinning(winningId: string, notes?: string): Promise<{
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
}
