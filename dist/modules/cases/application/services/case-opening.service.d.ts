import { CasesRepository } from '../../infrastructure/repositories/cases.repository';
import { BallsService } from '../../../users/application/services/balls.service';
export declare class CaseOpeningService {
    private readonly casesRepository;
    private readonly ballsService;
    constructor(casesRepository: CasesRepository, ballsService: BallsService);
    openCase(userId: string, caseId: number): Promise<{
        opening: {
            id: number;
            createdAt: Date;
            userId: number;
            caseId: number;
            ballsSpent: number;
        };
        winning: {
            item: any;
            case: {
                description: string;
                name: string;
                id: number;
                image: string | null;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                priceBalls: number;
            };
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            caseId: number;
            openingId: number;
            itemId: number;
            isProcessed: boolean;
            processedAt: Date | null;
            notes: string | null;
        };
    }>;
    getUserOpeningHistory(userId: string, page?: number, limit?: number): Promise<({
        case: {
            description: string;
            name: string;
            id: number;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            priceBalls: number;
        };
        winning: ({
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
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            caseId: number;
            openingId: number;
            itemId: number;
            isProcessed: boolean;
            processedAt: Date | null;
            notes: string | null;
        }) | null;
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        caseId: number;
        ballsSpent: number;
    })[]>;
    getWinningById(winningId: number): Promise<({
        user: {
            id: number;
            username: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.Role;
            firstName: string;
            lastName: string | null;
            countryCode: string | null;
            telegramId: string;
            isVerified: boolean;
            cityId: number | null;
            sportId: number | null;
            authSource: import(".prisma/client").$Enums.AuthSource;
            lastLogin: Date | null;
            ballsBalance: number;
            casesOpened: number;
            telegramChatId: bigint | null;
            referralCode: string | null;
            referredBy: number | null;
        };
        case: {
            description: string;
            name: string;
            id: number;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            priceBalls: number;
        };
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
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        caseId: number;
        openingId: number;
        itemId: number;
        isProcessed: boolean;
        processedAt: Date | null;
        notes: string | null;
    }) | null>;
    markWinningAsProcessed(winningId: number, notes?: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        caseId: number;
        openingId: number;
        itemId: number;
        isProcessed: boolean;
        processedAt: Date | null;
        notes: string | null;
    }>;
    private selectRandomItem;
    private processPrize;
    private processVirtualPrize;
    private processActionPrize;
}
