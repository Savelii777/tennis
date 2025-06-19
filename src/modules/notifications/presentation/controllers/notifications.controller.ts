import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from '../../application/services/notifications.service';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { NotificationFiltersDto } from '../dto/notification-filters.dto';
import { CreateNotificationDto } from '../dto/create-notification.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить уведомления пользователя' })
  @ApiResponse({ status: 200, description: 'Список уведомлений' })
  async getNotifications(
    @Req() req: any,
    @Query() filters: NotificationFiltersDto,
  ) {
    const userId = req.user.id;
    
    const notifications = await this.notificationsService.getNotifications(
      userId,
      {
        isRead: filters.isRead,
        type: filters.type,
      },
      {
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    );

    const unreadCount = await this.notificationsService.getUnreadCount(userId);

    return {
      notifications,
      unreadCount,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Получить количество непрочитанных уведомлений' })
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.id;
    const count = await this.notificationsService.getUnreadCount(userId);
    
    return { unreadCount: count };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Отметить уведомление как прочитанное' })
  async markAsRead(
    @Param('id', ParseIntPipe) notificationId: number,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    await this.notificationsService.markAsRead(notificationId, userId);
    
    return { success: true, message: 'Уведомление отмечено как прочитанное' };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Отметить все уведомления как прочитанные' })
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.id;
    await this.notificationsService.markAllAsRead(userId);
    
    return { success: true, message: 'Все уведомления отмечены как прочитанные' };
  }

  @Post('send')
  @ApiOperation({ summary: 'Отправить уведомление (системный метод)' })
  async sendNotification(@Body() createNotificationDto: CreateNotificationDto) {
    await this.notificationsService.createNotification(createNotificationDto);
    
    return { success: true, message: 'Уведомление отправлено' };
  }
}