import { CasesRepository } from '../../infrastructure/repositories/cases.repository';
import { CreateCaseDto, UpdateCaseDto } from '../../presentation/dto/case.dto';
export declare class CasesService {
    private readonly casesRepository;
    constructor(casesRepository: CasesRepository);
    createCase(createCaseDto: CreateCaseDto): Promise<import(".prisma/client").Case & {
        items: import(".prisma/client").CaseItem[];
        _count: {
            openings: number;
            winnings: number;
        };
    }>;
    getAllCases(includeInactive?: boolean): Promise<(import(".prisma/client").Case & {
        items: import(".prisma/client").CaseItem[];
        _count: {
            openings: number;
            winnings: number;
        };
    })[]>;
    getCaseById(id: number): Promise<import(".prisma/client").Case & {
        items: import(".prisma/client").CaseItem[];
        _count: {
            openings: number;
            winnings: number;
        };
    }>;
    updateCase(id: number, updateCaseDto: UpdateCaseDto): Promise<import(".prisma/client").Case & {
        items: import(".prisma/client").CaseItem[];
        _count: {
            openings: number;
            winnings: number;
        };
    }>;
    deleteCase(id: number): Promise<import(".prisma/client").Case>;
    toggleCaseStatus(id: number): Promise<import(".prisma/client").Case & {
        items: import(".prisma/client").CaseItem[];
        _count: {
            openings: number;
            winnings: number;
        };
    }>;
    getCaseStatistics(id: number): Promise<{
        totalOpenings: number;
        totalWinnings: number;
        itemStatistics: {
            item: import(".prisma/client").CaseItem | null;
            winCount: number;
            winRate: string;
        }[];
    }>;
    getAllCasesStatistics(): Promise<(import(".prisma/client").Case & {
        _count: {
            openings: number;
            winnings: number;
        };
    })[]>;
}
