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
exports.ProfileStepTwoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ProfileStepTwoDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ONE_HANDED', 'TWO_HANDED'] }),
    (0, class_validator_1.IsEnum)(['ONE_HANDED', 'TWO_HANDED']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfileStepTwoDto.prototype, "backhandType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['HARD', 'CLAY', 'GRASS', 'CARPET'] }),
    (0, class_validator_1.IsEnum)(['HARD', 'CLAY', 'GRASS', 'CARPET']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfileStepTwoDto.prototype, "preferredSurface", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['UNIVERSAL', 'DEFENSIVE', 'AGGRESSIVE', 'NET_PLAYER', 'BASIC'] }),
    (0, class_validator_1.IsEnum)(['UNIVERSAL', 'DEFENSIVE', 'AGGRESSIVE', 'NET_PLAYER', 'BASIC']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfileStepTwoDto.prototype, "playingStyle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['SERVE', 'FOREHAND', 'BACKHAND', 'VOLLEY', 'SMASH'] }),
    (0, class_validator_1.IsEnum)(['SERVE', 'FOREHAND', 'BACKHAND', 'VOLLEY', 'SMASH']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfileStepTwoDto.prototype, "favoriteShot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfileStepTwoDto.prototype, "racket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ANY', 'MEN', 'WOMEN', 'SAME_LEVEL', 'STRONGER', 'WEAKER'] }),
    (0, class_validator_1.IsEnum)(['ANY', 'MEN', 'WOMEN', 'SAME_LEVEL', 'STRONGER', 'WEAKER']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfileStepTwoDto.prototype, "opponentPreference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['BEGINNER', 'AMATEUR', 'CONFIDENT', 'TOURNAMENT', 'SEMI_PRO'] }),
    (0, class_validator_1.IsEnum)(['BEGINNER', 'AMATEUR', 'CONFIDENT', 'TOURNAMENT', 'SEMI_PRO']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfileStepTwoDto.prototype, "selfAssessedLevel", void 0);
exports.ProfileStepTwoDto = ProfileStepTwoDto;
