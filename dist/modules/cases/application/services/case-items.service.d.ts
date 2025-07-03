import { CasesRepository } from '../../infrastructure/repositories/cases.repository';
import { CreateCaseItemDto, UpdateCaseItemDto } from '../../presentation/dto/case-item.dto';
export declare class CaseItemsService {
    private readonly casesRepository;
    constructor(casesRepository: CasesRepository);
    createCaseItem(caseId: number, createItemDto: CreateCaseItemDto): Promise<{
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
    getCaseItems(caseId: number, includeInactive?: boolean): Promise<{
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
    updateCaseItem(itemId: number, updateItemDto: UpdateCaseItemDto): Promise<{
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
    deleteCaseItem(itemId: number): Promise<{
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
    toggleItemStatus(itemId: number): Promise<{
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
    private validateDropChances;
}
