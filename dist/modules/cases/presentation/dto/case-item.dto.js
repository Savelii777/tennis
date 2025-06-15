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
exports.UpdateCaseItemDto = exports.CreateCaseItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateCaseItemDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Название приза', example: '50 теннисных мячей' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCaseItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Тип приза',
        enum: client_1.CaseItemType,
        example: client_1.CaseItemType.VIRTUAL
    }),
    (0, class_validator_1.IsEnum)(client_1.CaseItemType),
    __metadata("design:type", String)
], CreateCaseItemDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Данные приза в JSON формате',
        example: { balls: 50 }
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateCaseItemDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Шанс выпадения (от 0.01 до 1.0)',
        example: 0.3
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.Max)(1.0),
    __metadata("design:type", Number)
], CreateCaseItemDto.prototype, "dropChance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL изображения приза' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCaseItemDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Активен ли приз', example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCaseItemDto.prototype, "isActive", void 0);
exports.CreateCaseItemDto = CreateCaseItemDto;
class UpdateCaseItemDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Название приза' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCaseItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Тип приза', enum: client_1.CaseItemType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CaseItemType),
    __metadata("design:type", String)
], UpdateCaseItemDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Данные приза в JSON формате' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateCaseItemDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Шанс выпадения (от 0.01 до 1.0)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.Max)(1.0),
    __metadata("design:type", Number)
], UpdateCaseItemDto.prototype, "dropChance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL изображения приза' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCaseItemDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Активен ли приз' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCaseItemDto.prototype, "isActive", void 0);
exports.UpdateCaseItemDto = UpdateCaseItemDto;
