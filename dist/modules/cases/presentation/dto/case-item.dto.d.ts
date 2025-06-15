import { CaseItemType } from '@prisma/client';
export declare class CreateCaseItemDto {
    name: string;
    type: CaseItemType;
    payload: any;
    dropChance: number;
    imageUrl?: string;
    isActive?: boolean;
}
export declare class UpdateCaseItemDto {
    name?: string;
    type?: CaseItemType;
    payload?: any;
    dropChance?: number;
    imageUrl?: string;
    isActive?: boolean;
}
