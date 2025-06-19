export declare class CreateNotificationDto {
    userId: number;
    type: string;
    message: string;
    payload?: any;
    sendTelegram?: boolean;
}
