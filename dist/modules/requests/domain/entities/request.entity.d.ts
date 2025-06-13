export declare class RequestEntity {
    id: number;
    type: string;
    title: string;
    description?: string;
    creatorId: number;
    creatorName?: string;
    locationName?: string;
    maxPlayers: number;
    currentPlayers: number;
    gameMode: string;
    dateTime: Date;
    paymentType: string;
    ratingType: string;
    formatInfo?: any;
    status: string;
    participants?: any[];
    responses?: any[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class RequestResponseEntity {
    id: number;
    requestId: number;
    userId: number;
    userName?: string;
    status: string;
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}
