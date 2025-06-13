import { TrainingType, CourtSurface, PaymentType } from '../../domain/enums/training-type.enum';
export declare class CreateTrainingDto {
    title: string;
    description?: string;
    locationName?: string;
    courtSurface?: CourtSurface;
    minLevel?: number;
    maxLevel?: number;
    maxSlots: number;
    paymentType: PaymentType;
    pricePerPerson?: number;
    dateTime: Date;
    endTime: Date;
    trainingType: TrainingType;
}
