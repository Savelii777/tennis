export interface NotificationInterface {
    id: number;
    userId: number;
    type: string;
    message: string;
    payload?: any;
    isRead: boolean;
    sentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateNotificationData {
    userId: number;
    type: string;
    message: string;
    payload?: any;
    sendTelegram?: boolean;
    data?: any;
}
export interface NotificationFilters {
    isRead?: boolean;
    type?: string;
}
export interface NotificationPagination {
    page: number;
    limit: number;
}
