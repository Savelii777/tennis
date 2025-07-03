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
    getCases(): Promise<({
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
    getCaseById(id: string): Promise<{
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
    openCase(id: string, req: RequestWithUser): Promise<{
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
                updatedAt: Date;
                createdAt: Date;
                isActive: boolean;
                image: string | null;
                priceBalls: number;
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
    getMyHistory(req: RequestWithUser, page?: string, limit?: string): Promise<({
        case: {
            description: string;
            name: string;
            id: number;
            updatedAt: Date;
            createdAt: Date;
            isActive: boolean;
            image: string | null;
            priceBalls: number;
        };
        winning: ({
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
}
export {};
