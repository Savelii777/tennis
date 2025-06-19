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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSettingsDto = exports.LanguageDto = exports.UpdateSettingsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateSettingsDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Язык интерфейса', enum: ['ru', 'en'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['ru', 'en']),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID города' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSettingsDto.prototype, "cityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID вида спорта' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSettingsDto.prototype, "sportId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Включить все уведомления' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "notificationsEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Telegram уведомления' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "notifyTelegram", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email уведомления' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "notifyEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Время напоминания о матчах', enum: ['1h', '1d', 'off'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['1h', '1d', 'off']),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "matchReminderTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Уведомления о результатах матчей' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "notifyMatchResults", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Уведомления о результатах турниров' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "notifyTournamentResults", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Показывать профиль публично' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "showProfilePublicly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Показывать рейтинг публично' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "showRatingPublicly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Разрешить приглашения на матчи' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "allowMatchInvites", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Требовать подтверждение матчей' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "requireMatchConfirm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Предпочитаемый пол соперников', enum: ['male', 'female', 'any'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['male', 'female', 'any']),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "preferredGender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Минимальный возраст соперников' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(16),
    (0, class_validator_1.Max)(80),
    __metadata("design:type", Number)
], UpdateSettingsDto.prototype, "preferredAgeMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Максимальный возраст соперников' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(16),
    (0, class_validator_1.Max)(80),
    __metadata("design:type", Number)
], UpdateSettingsDto.prototype, "preferredAgeMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Минимальный уровень NTRP соперников' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2.0),
    (0, class_validator_1.Max)(7.0),
    __metadata("design:type", Number)
], UpdateSettingsDto.prototype, "preferredLevelMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Максимальный уровень NTRP соперников' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2.0),
    (0, class_validator_1.Max)(7.0),
    __metadata("design:type", Number)
], UpdateSettingsDto.prototype, "preferredLevelMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Цветовая схема', enum: ['light', 'dark', 'auto'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['light', 'dark', 'auto']),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "theme", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Часовой пояс' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Telegram Chat ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "telegramChatId", void 0);
exports.UpdateSettingsDto = UpdateSettingsDto;
class LanguageDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Язык интерфейса', enum: ['ru', 'en'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['ru', 'en']),
    __metadata("design:type", String)
], LanguageDto.prototype, "language", void 0);
exports.LanguageDto = LanguageDto;
class NotificationSettingsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Включить все уведомления' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationSettingsDto.prototype, "notificationsEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Telegram уведомления' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationSettingsDto.prototype, "notifyTelegram", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email уведомления' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationSettingsDto.prototype, "notifyEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Время напоминания о матчах', enum: ['1h', '1d', 'off'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['1h', '1d', 'off']),
    __metadata("design:type", String)
], NotificationSettingsDto.prototype, "matchReminderTime", void 0);
exports.NotificationSettingsDto = NotificationSettingsDto;
