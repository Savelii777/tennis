import { CasesService } from '../../application/services/cases.service';
import { CaseOpeningService } from '../../application/services/case-opening.service';
import { Request as ExpressRequest } from 'express';
interface RequestWithUser extends ExpressRequest {
    user: {
        id: number;
        role: string;
        [key: string]: any;
    };
}
export declare class CasesController {
    private readonly casesService;
    private readonly caseOpeningService;
    constructor(casesService: CasesService, caseOpeningService: CaseOpeningService);
    getCases(): Promise<(import(".prisma/client").Case & {
        _count: {
            openings: number;
            winnings: number;
        };
        items: import(".prisma/client").CaseItem[];
    })[]>;
    getCaseById(id: string): Promise<import(".prisma/client").Case & {
        _count: {
            openings: number;
            winnings: number;
        };
        items: import(".prisma/client").CaseItem[];
    }>;
    openCase(id: string, req: RequestWithUser): Promise<{
        opening: import(".prisma/client").CaseOpening;
        winning: {
            item: any;
            id: number;
            openingId: number;
            userId: number;
            caseId: number;
            itemId: number;
            isProcessed: boolean;
            processedAt: Date | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            case: import(".prisma/client").Case;
        };
    }>;
    getMyHistory(req: RequestWithUser, page?: string, limit?: string): Promise<(import(".prisma/client").CaseOpening & {
        case: import(".prisma/client").Case;
        winning: (import(".prisma/client").CaseWinning & {
            item: import(".prisma/client").CaseItem;
        }) | null;
    })[]>;
}
export {};
