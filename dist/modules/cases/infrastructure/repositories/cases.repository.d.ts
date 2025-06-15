import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCaseDto, UpdateCaseDto } from '../../presentation/dto/case.dto';
import { CreateCaseItemDto, UpdateCaseItemDto } from '../../presentation/dto/case-item.dto';
export declare class CasesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateCaseDto): Promise<import(".prisma/client").Case & {
        _count: {
            openings: number;
            winnings: number;
        };
        items: import(".prisma/client").CaseItem[];
    }>;
    findAll(includeInactive?: boolean): Promise<(import(".prisma/client").Case & {
        _count: {
            openings: number;
            winnings: number;
        };
        items: import(".prisma/client").CaseItem[];
    })[]>;
    findById(id: number): Promise<(import(".prisma/client").Case & {
        _count: {
            openings: number;
            winnings: number;
        };
        items: import(".prisma/client").CaseItem[];
    }) | null>;
    update(id: number, data: UpdateCaseDto): Promise<import(".prisma/client").Case & {
        _count: {
            openings: number;
            winnings: number;
        };
        items: import(".prisma/client").CaseItem[];
    }>;
    delete(id: number): Promise<import(".prisma/client").Case>;
    createItem(caseId: number, data: CreateCaseItemDto): Promise<import(".prisma/client").CaseItem>;
    findItemsByCaseId(caseId: number, includeInactive?: boolean): Promise<import(".prisma/client").CaseItem[]>;
    findItemById(id: number): Promise<(import(".prisma/client").CaseItem & {
        case: import(".prisma/client").Case;
    }) | null>;
    updateItem(id: number, data: UpdateCaseItemDto): Promise<import(".prisma/client").CaseItem>;
    deleteItem(id: number): Promise<import(".prisma/client").CaseItem>;
    createOpening(data: any): Promise<import(".prisma/client").CaseOpening>;
    createWinning(data: any): Promise<import(".prisma/client").CaseWinning & {
        case: import(".prisma/client").Case;
        item: import(".prisma/client").CaseItem;
    }>;
    getUserOpenings(userId: number, page: number, limit: number): Promise<(import(".prisma/client").CaseOpening & {
        case: import(".prisma/client").Case;
        winning: (import(".prisma/client").CaseWinning & {
            item: import(".prisma/client").CaseItem;
        }) | null;
    })[]>;
    findWinningById(id: number): Promise<(import(".prisma/client").CaseWinning & {
        user: import(".prisma/client").User;
        case: import(".prisma/client").Case;
        item: import(".prisma/client").CaseItem;
    }) | null>;
    updateWinning(id: number, data: any): Promise<import(".prisma/client").CaseWinning>;
    getUserById(id: number): Promise<{
        id: number;
        ballsBalance: number;
    } | null>;
    getCaseStatistics(caseId: number): Promise<{
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
    getItemStatistics(itemId: number): Promise<{
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
}
