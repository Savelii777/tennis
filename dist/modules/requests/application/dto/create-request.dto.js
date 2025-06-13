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
exports.CreateRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const request_type_enum_1 = require("../../domain/enums/request-type.enum");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
class CreateRequestDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ enum: request_type_enum_1.RequestType, description: 'Тип заявки' }),
    (0, class_validator_1.IsEnum)(request_type_enum_1.RequestType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Название заявки' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Описание заявки' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Место проведения' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "locationName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Максимальное количество участников' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    __metadata("design:type", Number)
], CreateRequestDto.prototype, "maxPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.MatchType, description: 'Режим игры' }),
    (0, class_validator_1.IsEnum)(client_1.MatchType),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "gameMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Дата и время проведения', example: '2025-06-11T14:41:39.058Z' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_transformer_1.Transform)(({ value }) => value ? new Date(value) : null),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], CreateRequestDto.prototype, "dateTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: request_type_enum_1.PaymentType, description: 'Тип оплаты' }),
    (0, class_validator_1.IsEnum)(request_type_enum_1.PaymentType),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "paymentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: request_type_enum_1.RatingType, description: 'Влияет на рейтинг' }),
    (0, class_validator_1.IsEnum)(request_type_enum_1.RatingType),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "ratingType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Дополнительная информация о формате' }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateRequestDto.prototype, "formatInfo", void 0);
exports.CreateRequestDto = CreateRequestDto;
