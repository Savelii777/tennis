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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const settings_service_1 = require("./settings.service");
const settings_dto_1 = require("./dto/settings.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getMySettings(req) {
        return this.settingsService.getUserSettings(parseInt(req.user.id));
    }
    async updateSettings(req, updateData) {
        return this.settingsService.updateSettings(parseInt(req.user.id), updateData);
    }
    async updateLanguage(req, languageData) {
        return this.settingsService.updateLanguage(parseInt(req.user.id), languageData.language);
    }
    async updateNotificationSettings(req, notificationData) {
        return this.settingsService.updateNotificationSettings(parseInt(req.user.id), notificationData);
    }
    async toggleNotifications(req, data) {
        return this.settingsService.toggleNotifications(parseInt(req.user.id), data.enabled);
    }
    async getOpponentPreferences(req) {
        return this.settingsService.getOpponentPreferences(parseInt(req.user.id));
    }
};
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить настройки текущего пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Настройки пользователя' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getMySettings", null);
__decorate([
    (0, common_1.Patch)('update'),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить настройки пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Настройки обновлены' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_dto_1.UpdateSettingsDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)('language'),
    (0, swagger_1.ApiOperation)({ summary: 'Изменить язык интерфейса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Язык изменен' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_dto_1.LanguageDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateLanguage", null);
__decorate([
    (0, common_1.Post)('notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить настройки уведомлений' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Настройки уведомлений обновлены' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_dto_1.NotificationSettingsDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateNotificationSettings", null);
__decorate([
    (0, common_1.Post)('notifications/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Включить/отключить все уведомления' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Уведомления переключены' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "toggleNotifications", null);
__decorate([
    (0, common_1.Get)('preferences/opponents'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить предпочтения по соперникам' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Предпочтения по соперникам' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getOpponentPreferences", null);
SettingsController = __decorate([
    (0, swagger_1.ApiTags)('settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
exports.SettingsController = SettingsController;
