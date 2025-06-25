import { PrismaService } from '../../../../prisma/prisma.service';
import { NotificationInterface, NotificationFilters, NotificationPagination } from '../../domain/interfaces/notification.interface';
export declare class NotificationsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        userId: number;
        type: string;
        message: string;
        payload?: any;
    }): Promise<NotificationInterface>;
    findByUserId(userId: number, filters: NotificationFilters, pagination: NotificationPagination): Promise<NotificationInterface[]>;
    markAsRead(notificationId: number, userId: number): Promise<void>;
    markAllAsRead(userId: number): Promise<void>;
    getUnreadCount(userId: number): Promise<number>;
    updateSentStatus(notificationId: number): Promise<void>;
    private mapToEntity;
}
