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
    getAllCases(includeInactive?: boolean): Promise<({
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
    getCaseById(id: number): Promise<{
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
    updateCase(id: number, updateCaseDto: UpdateCaseDto): Promise<{
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
    deleteCase(id: number): Promise<{
        name: string;
        description: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
        image: string | null;
        priceBalls: number;
        isActive: boolean;
    }>;
    toggleCaseStatus(id: number): Promise<{
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
    getCaseStatistics(id: number): Promise<{
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
}
