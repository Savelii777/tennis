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
                name: string;
                description: string;
                id: number;
                updatedAt: Date;
                createdAt: Date;
                image: string | null;
                priceBalls: number;
                isActive: boolean;
            };
            id: number;
            updatedAt: Date;
            createdAt: Date;
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
            name: string;
            description: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            image: string | null;
            priceBalls: number;
            isActive: boolean;
        };
        winning: ({
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
            };
        } & {
            id: number;
            updatedAt: Date;
            createdAt: Date;
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
            firstName: string;
            lastName: string | null;
            sportType: string | null;
            id: number;
            telegramId: string;
            username: string;
            isVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
            countryCode: string | null;
            cityId: number | null;
            sportId: number | null;
            updatedAt: Date;
            createdAt: Date;
            authSource: import(".prisma/client").$Enums.AuthSource;
            lastLogin: Date | null;
            ballsBalance: number;
            casesOpened: number;
            telegramChatId: bigint | null;
            referralCode: string | null;
            referredBy: number | null;
        };
        case: {
            name: string;
            description: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            image: string | null;
            priceBalls: number;
            isActive: boolean;
        };
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
        };
    } & {
        id: number;
        updatedAt: Date;
        createdAt: Date;
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
        updatedAt: Date;
        createdAt: Date;
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
