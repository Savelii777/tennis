export declare enum RequestType {
    GAME = "GAME",
    TRAINING = "TRAINING",
    TOURNAMENT = "TOURNAMENT"
}
export declare enum GameMode {
    SINGLES = "SINGLES",
    DOUBLES = "DOUBLES",
    MIXED = "MIXED"
}
export declare class CreateRequestDto {
    type: RequestType;
    title: string;
    description: string;
    gameMode: GameMode;
    dateTime: Date;
    location: string;
    maxPlayers: number;
    playerLevel?: string;
    locationName?: string;
    paymentType?: string;
    ratingType?: string;
    formatInfo?: any;
}
