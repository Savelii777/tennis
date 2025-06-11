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
exports.CreateMatchDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const match_enum_1 = require("../../domain/enums/match.enum");
class CreateMatchDto {
    constructor() {
        this.state = match_enum_1.MatchState.DRAFT;
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({ enum: match_enum_1.MatchType, description: 'Type of match' }),
    (0, class_validator_1.IsEnum)(match_enum_1.MatchType),
    __metadata("design:type", String)
], CreateMatchDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: match_enum_1.MatchState, default: match_enum_1.MatchState.DRAFT, description: 'State of match' }),
    (0, class_validator_1.IsEnum)(match_enum_1.MatchState),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMatchDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Number, description: 'Player 1 ID' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMatchDto.prototype, "player1Id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Number, description: 'Player 2 ID' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMatchDto.prototype, "player2Id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Number, description: 'Optional ID (can be used for doubles partner)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMatchDto.prototype, "optionalId", void 0);
exports.CreateMatchDto = CreateMatchDto;
