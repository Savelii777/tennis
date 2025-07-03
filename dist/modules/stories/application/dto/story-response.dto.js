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
exports.StoryResponseDto = exports.StoryUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class StoryUserDto {
}
exports.StoryUserDto = StoryUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], StoryUserDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Иван' }),
    __metadata("design:type", String)
], StoryUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Иванов' }),
    __metadata("design:type", String)
], StoryUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ivanov123' }),
    __metadata("design:type", String)
], StoryUserDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/avatar.jpg' }),
    __metadata("design:type", String)
], StoryUserDto.prototype, "avatar", void 0);
class StoryResponseDto {
}
exports.StoryResponseDto = StoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], StoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], StoryResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", StoryUserDto)
], StoryResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'IMAGE', enum: ['IMAGE', 'VIDEO'] }),
    __metadata("design:type", String)
], StoryResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED'] }),
    __metadata("design:type", String)
], StoryResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Великолепный матч!' }),
    __metadata("design:type", String)
], StoryResponseDto.prototype, "caption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    __metadata("design:type", Number)
], StoryResponseDto.prototype, "viewsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    __metadata("design:type", Number)
], StoryResponseDto.prototype, "likesCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T12:00:00Z' }),
    __metadata("design:type", Date)
], StoryResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2023-01-01T14:00:00Z' }),
    __metadata("design:type", Date)
], StoryResponseDto.prototype, "publishedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '/stories/1/file' }),
    __metadata("design:type", String)
], StoryResponseDto.prototype, "fileUrl", void 0);
