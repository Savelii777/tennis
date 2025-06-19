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
    createCase(createCaseDto: CreateCaseDto): Promise<import(".prisma/client").Case & {
        items: import(".prisma/client").CaseItem[];
        _count: {
            openings: number;
            winnings: number;
        };
    }>;
    getAllCases(includeInactive?: string): Promise<(import(".prisma/client").Case & {
        items: import(".prisma/client").CaseItem[];
        _count: {
            openings: number;
            winnings: number;
        };
    })[]>;
    getCaseById(id: string): Promise<import(".prisma/client").Case & {
        items: import(".prisma/client").CaseItem[];
        _count: {
            openings: number;
            winnings: number;
        };
    }>;
    updateCase(id: string, updateCaseDto: UpdateCaseDto): Promise<import(".prisma/client").Case & {
        items: import(".prisma/client").CaseItem[];
        _count: {
            openings: number;
            winnings: number;
        };
    }>;
    deleteCase(id: string): Promise<import(".prisma/client").Case>;
    toggleCaseStatus(id: string): Promise<import(".prisma/client").Case & {
        items: import(".prisma/client").CaseItem[];
        _count: {
            openings: number;
            winnings: number;
        };
    }>;
    createCaseItem(caseId: string, createItemDto: CreateCaseItemDto): Promise<import(".prisma/client").CaseItem>;
    getCaseItems(caseId: string, includeInactive?: string): Promise<import(".prisma/client").CaseItem[]>;
    updateCaseItem(itemId: string, updateItemDto: UpdateCaseItemDto): Promise<import(".prisma/client").CaseItem>;
    deleteCaseItem(itemId: string): Promise<import(".prisma/client").CaseItem>;
    toggleItemStatus(itemId: string): Promise<import(".prisma/client").CaseItem>;
    getCaseStatistics(id: string): Promise<{
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
    getItemStatistics(itemId: string): Promise<{
        item: (import(".prisma/client").CaseItem & {
            case: import(".prisma/client").Case & {
                _count: {
                    openings: number;
                };
            };
        }) | null;
        winCount: number;
        totalOpenings: number;
        expectedWinRate: string;
        actualWinRate: string;
    }>;
    processWinning(winningId: string, notes?: string): Promise<import(".prisma/client").CaseWinning>;
}
