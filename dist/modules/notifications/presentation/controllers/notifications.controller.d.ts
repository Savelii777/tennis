import { NotificationsService } from '../../application/services/notifications.service';
import { NotificationFiltersDto } from '../dto/notification-filters.dto';
import { CreateNotificationDto } from '../dto/create-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any, filters: NotificationFiltersDto): Promise<{
        notifications: import("../../domain/interfaces/notification.interface").NotificationInterface[];
        unreadCount: number;
        pagination: {
            page: number;
            limit: number;
        };
    }>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
    markAsRead(notificationId: number, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    markAllAsRead(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    sendNotification(createNotificationDto: CreateNotificationDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
