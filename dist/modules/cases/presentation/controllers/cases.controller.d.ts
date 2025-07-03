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
    getCaseById(id: string): Promise<{
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
    getMyHistory(req: RequestWithUser, page?: string, limit?: string): Promise<({
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
}
export {};
