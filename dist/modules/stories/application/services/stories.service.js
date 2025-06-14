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
var StoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoriesService = void 0;
const common_1 = require("@nestjs/common");
const stories_repository_1 = require("../../infrastructure/repositories/stories.repository");
const telegram_file_service_1 = require("../../infrastructure/external/telegram-file.service");
const telegram_service_1 = require("../../../telegram/telegram.service");
const story_status_enum_1 = require("../../domain/enums/story-status.enum");
let StoriesService = StoriesService_1 = class StoriesService {
    constructor(storiesRepository, telegramFileService, telegramService) {
        this.storiesRepository = storiesRepository;
        this.telegramFileService = telegramFileService;
        this.telegramService = telegramService;
        this.logger = new common_1.Logger(StoriesService_1.name);
    }
    async createStory(userId, createStoryDto) {
        // Валидация размера файла
        const isValidSize = await this.telegramFileService.validateFileSize(createStoryDto.telegramFileId);
        if (!isValidSize) {
            throw new common_1.BadRequestException('File size exceeds 50MB limit');
        }
        // Получаем информацию о файле из Telegram
        let telegramFilePath = createStoryDto.telegramFilePath;
        if (!telegramFilePath) {
            const fileInfo = await this.telegramFileService.getFile(createStoryDto.telegramFileId);
            telegramFilePath = fileInfo?.file_path || undefined;
        }
        const story = await this.storiesRepository.create({
            userId,
            telegramFileId: createStoryDto.telegramFileId,
            telegramFilePath,
            type: createStoryDto.type,
        });
        this.logger.log(`New story created: ${story.id} by user ${userId}`);
        return this.mapToResponseDto(story);
    }
    async getPublicStories() {
        const stories = await this.storiesRepository.findPublic();
        return stories.map(story => this.mapToResponseDto(story));
    }
    async getUserStories(userId) {
        const stories = await this.storiesRepository.findByUserId(userId);
        return stories.map(story => this.mapToResponseDto(story));
    }
    async getStoryById(id) {
        const story = await this.storiesRepository.findById(id);
        if (!story) {
            throw new common_1.NotFoundException('Story not found');
        }
        return this.mapToResponseDto(story);
    }
    async getFileUrl(storyId) {
        const story = await this.storiesRepository.findById(storyId);
        if (!story) {
            throw new common_1.NotFoundException('Story not found');
        }
        if (!story.isApproved()) {
            throw new common_1.BadRequestException('Story is not approved yet');
        }
        // Если file_path еще не кэширован, получаем его
        if (!story.telegramFilePath) {
            const fileInfo = await this.telegramFileService.getFile(story.telegramFileId);
            if (fileInfo?.file_path) {
                story.telegramFilePath = fileInfo.file_path;
                await this.storiesRepository.updateFilePath(story.id, fileInfo.file_path);
            }
        }
        if (!story.telegramFilePath) {
            throw new common_1.BadRequestException('Could not get file URL');
        }
        const url = this.telegramFileService.getFileUrl(story.telegramFilePath);
        return { url };
    }
    // Админские методы
    async getPendingStories() {
        const stories = await this.storiesRepository.findPendingForModeration();
        return stories.map(story => this.mapToResponseDto(story));
    }
    async approveStory(storyId) {
        const story = await this.storiesRepository.findById(storyId);
        if (!story) {
            throw new common_1.NotFoundException('Story not found');
        }
        if (!story.isPending()) {
            throw new common_1.BadRequestException('Story is not pending approval');
        }
        const updatedStory = await this.storiesRepository.updateStatus(storyId, story_status_enum_1.StoryStatus.APPROVED);
        // Уведомляем пользователя об одобрении
        try {
            await this.telegramService.sendNotification(updatedStory.userId, '✅ Ваша story была одобрена и опубликована!');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.warn(`Failed to send approval notification: ${errorMessage}`);
        }
        this.logger.log(`Story ${storyId} approved`);
        return this.mapToResponseDto(updatedStory);
    }
    async rejectStory(storyId) {
        const story = await this.storiesRepository.findById(storyId);
        if (!story) {
            throw new common_1.NotFoundException('Story not found');
        }
        if (!story.isPending()) {
            throw new common_1.BadRequestException('Story is not pending approval');
        }
        const updatedStory = await this.storiesRepository.updateStatus(storyId, story_status_enum_1.StoryStatus.REJECTED);
        // Уведомляем пользователя об отклонении
        try {
            await this.telegramService.sendNotification(updatedStory.userId, '❌ Ваша story была отклонена модератором');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.warn(`Failed to send rejection notification: ${errorMessage}`);
        }
        this.logger.log(`Story ${storyId} rejected`);
        return this.mapToResponseDto(updatedStory);
    }
    async deleteStory(storyId) {
        const story = await this.storiesRepository.findById(storyId);
        if (!story) {
            throw new common_1.NotFoundException('Story not found');
        }
        await this.storiesRepository.delete(storyId);
        this.logger.log(`Story ${storyId} deleted`);
    }
    mapToResponseDto(story) {
        const response = {
            id: story.id,
            userId: story.userId,
            telegramFileId: story.telegramFileId,
            telegramFilePath: story.telegramFilePath,
            type: story.type,
            status: story.status,
            createdAt: story.createdAt,
            publishedAt: story.publishedAt,
        };
        // Добавляем URL файла если story одобрена и есть file_path
        if (story.isApproved() && story.telegramFilePath) {
            const fileUrl = story.getFileUrl(this.telegramFileService.getBotToken());
            response.fileUrl = fileUrl || undefined;
        }
        return response;
    }
};
StoriesService = StoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stories_repository_1.StoriesRepository,
        telegram_file_service_1.TelegramFileService,
        telegram_service_1.TelegramService])
], StoriesService);
exports.StoriesService = StoriesService;
