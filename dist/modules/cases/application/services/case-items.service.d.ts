import { CasesRepository } from '../../infrastructure/repositories/cases.repository';
import { CreateCaseItemDto, UpdateCaseItemDto } from '../../presentation/dto/case-item.dto';
export declare class CaseItemsService {
    private readonly casesRepository;
    constructor(casesRepository: CasesRepository);
    createCaseItem(caseId: number, createItemDto: CreateCaseItemDto): Promise<import(".prisma/client").CaseItem>;
    getCaseItems(caseId: number, includeInactive?: boolean): Promise<import(".prisma/client").CaseItem[]>;
    updateCaseItem(itemId: number, updateItemDto: UpdateCaseItemDto): Promise<import(".prisma/client").CaseItem>;
    deleteCaseItem(itemId: number): Promise<import(".prisma/client").CaseItem>;
    toggleItemStatus(itemId: number): Promise<import(".prisma/client").CaseItem>;
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
    private validateDropChances;
}
