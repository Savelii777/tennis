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
exports.StoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stories_service_1 = require("../../application/services/stories.service");
const create_story_dto_1 = require("../../application/dto/create-story.dto");
const story_response_dto_1 = require("../../application/dto/story-response.dto");
const auth_guard_1 = require("../../../../common/guards/auth.guard");
let StoriesController = class StoriesController {
    constructor(storiesService) {
        this.storiesService = storiesService;
    }
    async getPublicStories() {
        return this.storiesService.getPublicStories();
    }
    async getMyStories(req) {
        return this.storiesService.getUserStories(req.user.id);
    }
    async getStoryById(id) {
        return this.storiesService.getStoryById(id);
    }
    async getFileUrl(id) {
        return this.storiesService.getFileUrl(id);
    }
    async createStory(createStoryDto, req) {
        return this.storiesService.createStory(req.user.id, createStoryDto);
    }
    // Админские эндпоинты
    async getPendingStories() {
        return this.storiesService.getPendingStories();
    }
    async approveStory(id) {
        return this.storiesService.approveStory(id);
    }
    async rejectStory(id) {
        return this.storiesService.rejectStory(id);
    }
    async deleteStory(id) {
        return this.storiesService.deleteStory(id);
    }
};
__decorate([
    (0, common_1.Get)('public'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить список опубликованных stories' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список stories успешно получен', type: [story_response_dto_1.StoryResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getPublicStories", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить мои stories' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список моих stories получен', type: [story_response_dto_1.StoryResponseDto] }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getMyStories", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить story по ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Story найдена', type: story_response_dto_1.StoryResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Story не найдена' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getStoryById", null);
__decorate([
    (0, common_1.Get)(':id/file'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить прямую ссылку на файл story' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ссылка на файл получена' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Story не одобрена или файл недоступен' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Story не найдена' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getFileUrl", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Создать новую story (используется ботом)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Story создана', type: story_response_dto_1.StoryResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Неверные данные или файл слишком большой' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_story_dto_1.CreateStoryDto, Object]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "createStory", null);
__decorate([
    (0, common_1.Get)('admin/pending'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard) // TODO: добавить AdminGuard
    ,
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить stories на модерации (только для админов)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список stories на модерации', type: [story_response_dto_1.StoryResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getPendingStories", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard) // TODO: добавить AdminGuard
    ,
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Одобрить story (только для админов)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Story одобрена', type: story_response_dto_1.StoryResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Story не в статусе ожидания' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Story не найдена' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "approveStory", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard) // TODO: добавить AdminGuard
    ,
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Отклонить story (только для админов)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Story отклонена', type: story_response_dto_1.StoryResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Story не в статусе ожидания' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Story не найдена' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "rejectStory", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard) // TODO: добавить AdminGuard
    ,
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Удалить story (только для админов)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Story удалена' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Story не найдена' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "deleteStory", null);
StoriesController = __decorate([
    (0, swagger_1.ApiTags)('stories'),
    (0, common_1.Controller)('stories'),
    __metadata("design:paramtypes", [stories_service_1.StoriesService])
], StoriesController);
exports.StoriesController = StoriesController;
