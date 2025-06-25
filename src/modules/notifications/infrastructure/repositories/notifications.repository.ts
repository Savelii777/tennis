import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { NotificationInterface, NotificationFilters, NotificationPagination } from '../../domain/interfaces/notification.interface';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: number;
    type: string;
    message: string;
    payload?: any;
  }): Promise<NotificationInterface> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        message: data.message,
        data: data.payload || {}, // Если данные есть в payload, используем их
      },
    });
    
    return this.mapToEntity(notification);
  }

  async findByUserId(
    userId: number,
    filters: NotificationFilters,
    pagination: NotificationPagination,
  ): Promise<NotificationInterface[]> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(filters.isRead !== undefined && { isRead: filters.isRead }),
        ...(filters.type && { type: filters.type as any }),
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    }) as any;
  }

  async markAsRead(notificationId: number, userId: number): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async updateSentStatus(notificationId: number): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { sentAt: new Date() },
    });
  }

  // Добавляем метод mapToEntity для преобразования Prisma объекта в NotificationInterface
  private mapToEntity(notification: any): NotificationInterface {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      payload: notification.data, // в схеме Prisma поле называется 'data', но в интерфейсе - 'payload'
      isRead: notification.isRead,
      sentAt: notification.sentAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}