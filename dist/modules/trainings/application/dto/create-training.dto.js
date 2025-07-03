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
exports.CreateTrainingDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const training_type_enum_1 = require("../../domain/enums/training-type.enum");
const class_transformer_1 = require("class-transformer");
class CreateTrainingDto {
}
exports.CreateTrainingDto = CreateTrainingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Название тренировки' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTrainingDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Описание тренировки' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTrainingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Место проведения' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTrainingDto.prototype, "locationName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: training_type_enum_1.CourtSurface, description: 'Тип покрытия корта' }),
    (0, class_validator_1.IsEnum)(training_type_enum_1.CourtSurface),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTrainingDto.prototype, "courtSurface", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Минимальный NTRP уровень' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(7),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTrainingDto.prototype, "minLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Максимальный NTRP уровень' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(7),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTrainingDto.prototype, "maxLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Максимальное количество мест' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    __metadata("design:type", Number)
], CreateTrainingDto.prototype, "maxSlots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: training_type_enum_1.PaymentType, description: 'Тип оплаты' }),
    (0, class_validator_1.IsEnum)(training_type_enum_1.PaymentType),
    __metadata("design:type", String)
], CreateTrainingDto.prototype, "paymentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Цена за человека (если фиксированная цена)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTrainingDto.prototype, "pricePerPerson", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Дата и время начала тренировки', example: '2025-06-11T14:41:39.058Z' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_transformer_1.Transform)(({ value }) => value ? new Date(value) : null),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], CreateTrainingDto.prototype, "dateTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Дата и время окончания тренировки', example: '2025-06-11T16:41:39.058Z' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_transformer_1.Transform)(({ value }) => value ? new Date(value) : null),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], CreateTrainingDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: training_type_enum_1.TrainingType, description: 'Тип тренировки' }),
    (0, class_validator_1.IsEnum)(training_type_enum_1.TrainingType),
    __metadata("design:type", String)
], CreateTrainingDto.prototype, "trainingType", void 0);
