import { RequestType, RequestStatus, PaymentType, RatingType } from '../enums/request-type.enum';
import { MatchType } from '@prisma/client'; // Fix the import path

export class RequestEntity {
  id: number;
  type: string; // Or use your RequestType enum
  title: string;
  description?: string;
  creatorId: number;
  creatorName?: string;
  locationName?: string;
  maxPlayers: number;
  currentPlayers: number;
  gameMode: string; // Or use your MatchType enum
  dateTime: Date;
  paymentType: string; // Or use your PaymentType enum
  ratingType: string; // Or use your RatingType enum
  formatInfo?: any;
  status: string; // Or use your RequestStatus enum
  participants?: any[];
  responses?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class RequestResponseEntity {
  id: number;
  requestId: number;
  userId: number;
  userName?: string;
  status: string; // Or use your ResponseStatus enum
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}