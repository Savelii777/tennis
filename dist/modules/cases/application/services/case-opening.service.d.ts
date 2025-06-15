import { CasesRepository } from '../../infrastructure/repositories/cases.repository';
import { BallsService } from '../../../users/application/services/balls.service';
export declare class CaseOpeningService {
    private readonly casesRepository;
    private readonly ballsService;
    constructor(casesRepository: CasesRepository, ballsService: BallsService);
    openCase(userId: string, caseId: number): Promise<{
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
    getUserOpeningHistory(userId: string, page?: number, limit?: number): Promise<(import(".prisma/client").CaseOpening & {
        case: import(".prisma/client").Case;
        winning: (import(".prisma/client").CaseWinning & {
            item: import(".prisma/client").CaseItem;
        }) | null;
    })[]>;
    getWinningById(winningId: number): Promise<(import(".prisma/client").CaseWinning & {
        user: import(".prisma/client").User;
        case: import(".prisma/client").Case;
        item: import(".prisma/client").CaseItem;
    }) | null>;
    markWinningAsProcessed(winningId: number, notes?: string): Promise<import(".prisma/client").CaseWinning>;
    private selectRandomItem;
    private processPrize;
    private processVirtualPrize;
    private processActionPrize;
}
