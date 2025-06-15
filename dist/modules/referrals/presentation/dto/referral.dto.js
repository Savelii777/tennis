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
exports.RegisterByReferralDto = exports.GenerateInviteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GenerateInviteDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Базовый URL для генерации ссылки',
        example: 'https://yourapp.com'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], GenerateInviteDto.prototype, "baseUrl", void 0);
exports.GenerateInviteDto = GenerateInviteDto;
class RegisterByReferralDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Реферальный код пригласившего',
        example: 'ABC123XY'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterByReferralDto.prototype, "referralCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Telegram ID нового пользователя',
        example: '123456789'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterByReferralDto.prototype, "telegram_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Username пользователя',
        example: 'newuser'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterByReferralDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Имя пользователя',
        example: 'Новый'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterByReferralDto.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Фамилия пользователя',
        example: 'Пользователь'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterByReferralDto.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL фото профиля',
        example: 'https://example.com/photo.jpg'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], RegisterByReferralDto.prototype, "photo_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Источник перехода',
        example: 'telegram'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterByReferralDto.prototype, "source", void 0);
exports.RegisterByReferralDto = RegisterByReferralDto;
