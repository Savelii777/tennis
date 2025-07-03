import { CasesRepository } from '../../infrastructure/repositories/cases.repository';
import { CreateCaseItemDto, UpdateCaseItemDto } from '../../presentation/dto/case-item.dto';
export declare class CaseItemsService {
    private readonly casesRepository;
    constructor(casesRepository: CasesRepository);
    createCaseItem(caseId: number, createItemDto: CreateCaseItemDto): Promise<{
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
    getCaseItems(caseId: number, includeInactive?: boolean): Promise<{
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
    updateCaseItem(itemId: number, updateItemDto: UpdateCaseItemDto): Promise<{
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
    deleteCaseItem(itemId: number): Promise<{
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
    toggleItemStatus(itemId: number): Promise<{
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
    private validateDropChances;
}
