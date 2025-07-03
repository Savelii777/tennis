import { CasesRepository } from '../../infrastructure/repositories/cases.repository';
import { CreateCaseDto, UpdateCaseDto } from '../../presentation/dto/case.dto';
export declare class CasesService {
    private readonly casesRepository;
    constructor(casesRepository: CasesRepository);
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
    getAllCases(includeInactive?: boolean): Promise<({
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
    getCaseById(id: number): Promise<{
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
    updateCase(id: number, updateCaseDto: UpdateCaseDto): Promise<{
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
    deleteCase(id: number): Promise<{
        description: string;
        name: string;
        id: number;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        priceBalls: number;
    }>;
    toggleCaseStatus(id: number): Promise<{
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
    getCaseStatistics(id: number): Promise<{
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
}
