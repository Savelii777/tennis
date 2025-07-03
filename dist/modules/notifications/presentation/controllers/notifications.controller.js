"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("../../application/services/notifications.service");
const auth_guard_1 = require("../../../../common/guards/auth.guard");
const notification_filters_dto_1 = require("../dto/notification-filters.dto");
const create_notification_dto_1 = require("../dto/create-notification.dto");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async getNotifications(req, filters) {
        const userId = req.user.id;
        const notifications = await this.notificationsService.getNotifications(userId, {
            isRead: filters.isRead,
            type: filters.type,
        }, {
            page: filters.page || 1,
            limit: filters.limit || 20,
        });
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
    async getUnreadCount(req) {
        const userId = req.user.id;
        const count = await this.notificationsService.getUnreadCount(userId);
        return { unreadCount: count };
    }
    async markAsRead(notificationId, req) {
        const userId = req.user.id;
        await this.notificationsService.markAsRead(notificationId, userId);
        return { success: true, message: 'Уведомление отмечено как прочитанное' };
    }
    async markAllAsRead(req) {
        const userId = req.user.id;
        await this.notificationsService.markAllAsRead(userId);
        return { success: true, message: 'Все уведомления отмечены как прочитанные' };
    }
    async sendNotification(createNotificationDto) {
        await this.notificationsService.createNotification(createNotificationDto);
        return { success: true, message: 'Уведомление отправлено' };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить уведомления пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список уведомлений' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notification_filters_dto_1.NotificationFiltersDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить количество непрочитанных уведомлений' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Отметить уведомление как прочитанное' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)('mark-all-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Отметить все уведомления как прочитанные' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiOperation)({ summary: 'Отправить уведомление (системный метод)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendNotification", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
