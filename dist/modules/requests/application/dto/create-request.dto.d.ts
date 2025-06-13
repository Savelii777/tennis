import { RequestType, PaymentType, RatingType } from '../../domain/enums/request-type.enum';
import { MatchType } from '@prisma/client';
export declare class CreateRequestDto {
    type: RequestType;
    title: string;
    description?: string;
    locationName?: string;
    maxPlayers: number;
    gameMode: MatchType;
    dateTime: Date;
    paymentType: PaymentType;
    ratingType: RatingType;
    formatInfo?: Record<string, any>;
}
