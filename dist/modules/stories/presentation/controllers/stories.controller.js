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
const auth_guard_1 = require("../../../../common/guards/auth.guard");
const create_story_dto_1 = require("../../application/dto/create-story.dto");
const story_response_dto_1 = require("../../application/dto/story-response.dto");
let StoriesController = class StoriesController {
    constructor(storiesService) {
        this.storiesService = storiesService;
    }
    // Получить все публичные сторис
    async getPublicStories() {
        return this.storiesService.getPublicStories();
    }
    // Получить сторис для отображения в формате карусели с группировкой по пользователям
    async getStoriesForCarousel() {
        return this.storiesService.getStoriesForCarousel();
    }
    // Получить популярные сторис
    async getPopularStories() {
        return this.storiesService.getPopularStories();
    }
    // Получить сторис пользователя
    async getUserStories(userId) {
        return this.storiesService.getUserStories(userId);
    }
    // Получить инфо о сторис
    async getStoryById(id) {
        return this.storiesService.getStoryById(id);
    }
    // Получить файл сторис
    async getStoryFile(id, res) {
        try {
            const { url } = await this.storiesService.getFileUrl(id);
            // Записываем просмотр
            await this.storiesService.recordView(id);
            // Перенаправляем на файл
            return res.redirect(url);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException(error.message);
            }
            if (error instanceof common_1.BadRequestException) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    // Создание сторис (используется ботом)
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
};
exports.StoriesController = StoriesController;
__decorate([
    (0, common_1.Get)('public'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить все публичные сторис' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список публичных сторис', type: [story_response_dto_1.StoryResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getPublicStories", null);
__decorate([
    (0, common_1.Get)('carousel'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить сторис для отображения в формате карусели' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Сторис для карусели', type: 'object' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getStoriesForCarousel", null);
__decorate([
    (0, common_1.Get)('popular'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить популярные сторис' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список популярных сторис', type: [story_response_dto_1.StoryResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getPopularStories", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить сторис пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список сторис пользователя', type: [story_response_dto_1.StoryResponseDto] }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getUserStories", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить информацию о сторис' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Информация о сторис', type: story_response_dto_1.StoryResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Сторис не найдена' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getStoryById", null);
__decorate([
    (0, common_1.Get)(':id/file'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить прямую ссылку на файл сторис' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'URL файла' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Сторис не найдена' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getStoryFile", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Создать новую сторис (используется ботом)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Сторис создана', type: story_response_dto_1.StoryResponseDto }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Получить сторис на модерации (только для админов)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список сторис на модерации', type: [story_response_dto_1.StoryResponseDto] }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Одобрить сторис (только для админов)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Сторис одобрена', type: story_response_dto_1.StoryResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Сторис не в статусе ожидания' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Сторис не найдена' }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Отклонить сторис (только для админов)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Сторис отклонена', type: story_response_dto_1.StoryResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Сторис не в статусе ожидания' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Сторис не найдена' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "rejectStory", null);
exports.StoriesController = StoriesController = __decorate([
    (0, swagger_1.ApiTags)('stories'),
    (0, common_1.Controller)('stories'),
    __metadata("design:paramtypes", [stories_service_1.StoriesService])
], StoriesController);
