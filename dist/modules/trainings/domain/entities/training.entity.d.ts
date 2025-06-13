import { TrainingType, TrainingState, CourtSurface, PaymentType } from '../enums/training-type.enum';
export declare class TrainingEntity {
    id: number;
    title: string;
    description?: string;
    creatorId: number;
    creatorName?: string;
    locationName?: string;
    courtSurface?: CourtSurface;
    minLevel?: number;
    maxLevel?: number;
    maxSlots: number;
    currentSlots: number;
    paymentType: PaymentType;
    pricePerPerson?: number;
    dateTime: Date;
    endTime: Date;
    status: TrainingState;
    trainingType: TrainingType;
    participants?: any[];
    createdAt: Date;
    updatedAt: Date;
}
