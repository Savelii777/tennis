import { CasesRepository } from '../../infrastructure/repositories/cases.repository';
import { CreateCaseDto, UpdateCaseDto } from '../../presentation/dto/case.dto';
export declare class CasesService {
    private readonly casesRepository;
    constructor(casesRepository: CasesRepository);
    createCase(createCaseDto: CreateCaseDto): Promise<{
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
    getAllCases(includeInactive?: boolean): Promise<({
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
    getCaseById(id: number): Promise<{
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
    updateCase(id: number, updateCaseDto: UpdateCaseDto): Promise<{
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
    deleteCase(id: number): Promise<{
        description: string;
        name: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        isActive: boolean;
        image: string | null;
        priceBalls: number;
    }>;
    toggleCaseStatus(id: number): Promise<{
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
    getCaseStatistics(id: number): Promise<{
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
}
