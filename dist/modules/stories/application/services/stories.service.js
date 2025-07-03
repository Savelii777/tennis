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
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
let StoriesService = StoriesService_1 = class StoriesService {
    constructor(storiesRepository, telegramFileService, telegramService, configService) {
        this.storiesRepository = storiesRepository;
        this.telegramFileService = telegramFileService;
        this.telegramService = telegramService;
        this.configService = configService;
        this.logger = new common_1.Logger(StoriesService_1.name);
    }
    async createStory(userId, createStoryDto) {
        try {
            const story = await this.storiesRepository.create({
                userId,
                telegramFileId: createStoryDto.telegramFileId,
                type: createStoryDto.type,
                caption: createStoryDto.caption,
                status: client_1.StoryStatus.pending, // Исправлено с PENDING на pending
            });
            this.logger.log(`Story ${story.id} created by user ${userId} and pending approval`);
            // Уведомляем администраторов о новой сторис на модерацию
            try {
                // Получаем ID админов из конфига
                const adminIds = this.configService.get('ADMIN_IDS', '')?.split(',') || [];
                // Отправляем уведомления
                for (const adminId of adminIds) {
                    await this.telegramService.sendNotification(adminId, `📱 Новая Story на модерацию!\n` +
                        `ID: ${story.id}\n` +
                        `Пользователь: ${userId}\n` +
                        `Тип: ${story.type === client_1.MediaType.image ? 'Фото' : 'Видео'}\n\n` + // Исправлено с IMAGE на image
                        `Используйте админ-панель для проверки.`).catch(err => this.logger.warn(`Failed to notify admin ${adminId}: ${err}`));
                }
            }
            catch (error) {
                this.logger.warn(`Failed to notify admins about new story: ${error}`);
            }
            return this.mapToResponseDto(story);
        }
        catch (error) {
            this.logger.error(`Error creating story: ${error}`);
            throw error;
        }
    }
    async getPublicStories(limit = 20) {
        const stories = await this.storiesRepository.findPublic(limit);
        return stories.map(story => this.mapToResponseDto(story));
    }
    /**
     * Получить сторис для отображения в формате "stories" (карусель аватарок)
     * Группирует по пользователям и возвращает структуру для отображения в UI
     */
    async getStoriesForCarousel() {
        const stories = await this.storiesRepository.findPublicGroupedByUser();
        // Группируем истории по пользователям
        const userGroups = {};
        for (const story of stories) {
            const userId = story.userId.toString();
            if (!userGroups[userId]) {
                userGroups[userId] = {
                    user: {
                        id: story.user?.id || story.userId,
                        name: story.user ? `${story.user.firstName} ${story.user.lastName || ''}`.trim() : 'Пользователь',
                        avatar: story.user?.profile?.avatarUrl || null,
                    },
                    stories: []
                };
            }
            // Добавляем историю в группу пользователя с URL для просмотра
            userGroups[userId].stories.push({
                id: story.id,
                type: story.type,
                fileUrl: `/stories/${story.id}/file`,
                caption: story.caption || null,
                publishedAt: story.publishedAt || story.createdAt,
                viewsCount: story.viewsCount || 0,
            });
        }
        // Преобразуем в массив и сортируем по времени последней истории
        return Object.values(userGroups).sort((a, b) => {
            const lastStoryA = new Date(a.stories[a.stories.length - 1].publishedAt).getTime();
            const lastStoryB = new Date(b.stories[b.stories.length - 1].publishedAt).getTime();
            return lastStoryB - lastStoryA; // От новых к старым
        });
    }
    async getUserStories(userId) {
        const userIdInt = typeof userId === 'string' ? parseInt(userId) : userId;
        const stories = await this.storiesRepository.findByUserId(userIdInt);
        return stories.map(story => this.mapToResponseDto(story));
    }
    // Получение популярных историй
    async getPopularStories(limit = 10) {
        const stories = await this.storiesRepository.findPopular(limit);
        return stories.map(story => this.mapToResponseDto(story));
    }
    // Получение недавних историй
    async getRecentStories(limit = 10) {
        const stories = await this.storiesRepository.findRecent(limit);
        return stories.map(story => this.mapToResponseDto(story));
    }
    async getStoryById(id) {
        const story = await this.storiesRepository.findById(id);
        if (!story) {
            throw new common_1.NotFoundException('Story not found');
        }
        return this.mapToResponseDto(story);
    }
    // Обновление просмотров истории
    async recordView(storyId) {
        await this.storiesRepository.incrementViews(storyId);
    }
    /**
     * Получение URL файла из Telegram
     */
    async getFileUrl(storyId) {
        const story = await this.storiesRepository.findById(storyId);
        if (!story) {
            throw new common_1.NotFoundException('Story not found');
        }
        if (story.status !== client_1.StoryStatus.approved) { // Исправлено с APPROVED на approved
            throw new common_1.BadRequestException('Story is not published');
        }
        // Если путь уже есть, формируем URL
        if (story.telegramFilePath) {
            const token = this.configService.get('TELEGRAM_BOT_TOKEN');
            return {
                url: `https://api.telegram.org/file/bot${token}/${story.telegramFilePath}`
            };
        }
        // Если пути нет, получаем его через Telegram API
        try {
            const filePath = await this.telegramFileService.getFilePath(story.telegramFileId);
            // Сохраняем путь в БД
            await this.storiesRepository.updateFilePath(storyId, filePath);
            // Формируем URL
            const token = this.configService.get('TELEGRAM_BOT_TOKEN');
            return {
                url: `https://api.telegram.org/file/bot${token}/${filePath}`
            };
        }
        catch (error) {
            this.logger.error(`Error getting file path for story ${storyId}: ${error}`);
            throw new common_1.BadRequestException('Could not get file path from Telegram');
        }
    }
    async getPendingStories() {
        const stories = await this.storiesRepository.findPending();
        return stories.map(story => this.mapToResponseDto(story));
    }
    async approveStory(storyId) {
        const story = await this.storiesRepository.findById(storyId);
        if (!story) {
            throw new common_1.NotFoundException('Story not found');
        }
        if (story.status !== client_1.StoryStatus.pending) { // Исправлено с PENDING на pending
            throw new common_1.BadRequestException('Story is not pending approval');
        }
        const updatedStory = await this.storiesRepository.updateStatus(storyId, client_1.StoryStatus.approved, // Исправлено с APPROVED на approved
        new Date());
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
        if (story.status !== client_1.StoryStatus.pending) { // Исправлено с PENDING на pending
            throw new common_1.BadRequestException('Story is not pending approval');
        }
        const updatedStory = await this.storiesRepository.updateStatus(storyId, client_1.StoryStatus.rejected); // Исправлено с REJECTED на rejected
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
    mapToResponseDto(story) {
        return {
            id: story.id,
            userId: story.userId,
            user: story.user ? {
                id: story.user.id,
                firstName: story.user.firstName,
                lastName: story.user.lastName,
                username: story.user.username,
                avatar: story.user.profile?.avatarUrl
            } : undefined,
            type: story.type,
            status: story.status,
            caption: story.caption || null,
            viewsCount: story.viewsCount || 0,
            likesCount: story.likesCount || 0,
            createdAt: story.createdAt,
            publishedAt: story.publishedAt,
            fileUrl: story.id ? `/stories/${story.id}/file` : undefined, // Исправлено с null на undefined
        };
    }
};
exports.StoriesService = StoriesService;
exports.StoriesService = StoriesService = StoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stories_repository_1.StoriesRepository,
        telegram_file_service_1.TelegramFileService,
        telegram_service_1.TelegramService,
        config_1.ConfigService])
], StoriesService);
