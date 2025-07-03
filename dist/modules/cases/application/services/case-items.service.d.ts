import { CasesRepository } from '../../infrastructure/repositories/cases.repository';
import { CreateCaseItemDto, UpdateCaseItemDto } from '../../presentation/dto/case-item.dto';
export declare class CaseItemsService {
    private readonly casesRepository;
    constructor(casesRepository: CasesRepository);
    createCaseItem(caseId: number, createItemDto: CreateCaseItemDto): Promise<{
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
    getCaseItems(caseId: number, includeInactive?: boolean): Promise<{
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
    updateCaseItem(itemId: number, updateItemDto: UpdateCaseItemDto): Promise<{
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
    deleteCaseItem(itemId: number): Promise<{
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
    toggleItemStatus(itemId: number): Promise<{
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
    private validateDropChances;
}
