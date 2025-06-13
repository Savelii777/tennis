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
exports.RespondRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const request_type_enum_1 = require("../../domain/enums/request-type.enum");
class RespondRequestDto {
    constructor() {
        this.status = request_type_enum_1.ResponseStatus.PENDING;
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({ enum: request_type_enum_1.ResponseStatus, default: request_type_enum_1.ResponseStatus.PENDING, description: 'Статус отклика' }),
    (0, class_validator_1.IsEnum)(request_type_enum_1.ResponseStatus),
    __metadata("design:type", String)
], RespondRequestDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Сообщение для создателя заявки' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RespondRequestDto.prototype, "message", void 0);
exports.RespondRequestDto = RespondRequestDto;
