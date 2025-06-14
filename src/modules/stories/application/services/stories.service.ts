import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StoriesRepository } from '../../infrastructure/repositories/stories.repository';
import { TelegramFileService } from '../../infrastructure/external/telegram-file.service';
import { TelegramService } from '../../../telegram/telegram.service';
import { StoryEntity } from '../../domain/entities/story.entity';
import { CreateStoryDto } from '../dto/create-story.dto';
import { StoryResponseDto } from '../dto/story-response.dto';
import { StoryStatus } from '../../domain/enums/story-status.enum';
import { MediaType } from '../../domain/enums/media-type.enum';

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(
    private readonly storiesRepository: StoriesRepository,
    private readonly telegramFileService: TelegramFileService,
    private readonly telegramService: TelegramService,
  ) {}

  async createStory(userId: number, createStoryDto: CreateStoryDto): Promise<StoryResponseDto> {
    // Валидация размера файла
    const isValidSize = await this.telegramFileService.validateFileSize(createStoryDto.telegramFileId);
    if (!isValidSize) {
      throw new BadRequestException('File size exceeds 50MB limit');
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

  async getPublicStories(): Promise<StoryResponseDto[]> {
    const stories = await this.storiesRepository.findPublic();
    return stories.map(story => this.mapToResponseDto(story));
  }

  async getUserStories(userId: number): Promise<StoryResponseDto[]> {
    const stories = await this.storiesRepository.findByUserId(userId);
    return stories.map(story => this.mapToResponseDto(story));
  }

  async getStoryById(id: number): Promise<StoryResponseDto> {
    const story = await this.storiesRepository.findById(id);
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    return this.mapToResponseDto(story);
  }

  async getFileUrl(storyId: number): Promise<{ url: string }> {
    const story = await this.storiesRepository.findById(storyId);
    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (!story.isApproved()) {
      throw new BadRequestException('Story is not approved yet');
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
      throw new BadRequestException('Could not get file URL');
    }

    const url = this.telegramFileService.getFileUrl(story.telegramFilePath);
    return { url };
  }

  // Админские методы
  async getPendingStories(): Promise<StoryResponseDto[]> {
    const stories = await this.storiesRepository.findPendingForModeration();
    return stories.map(story => this.mapToResponseDto(story));
  }

  async approveStory(storyId: number): Promise<StoryResponseDto> {
    const story = await this.storiesRepository.findById(storyId);
    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (!story.isPending()) {
      throw new BadRequestException('Story is not pending approval');
    }

    const updatedStory = await this.storiesRepository.updateStatus(storyId, StoryStatus.APPROVED);
    
    // Уведомляем пользователя об одобрении
    try {
      await this.telegramService.sendNotification(
        updatedStory.userId,
        '✅ Ваша story была одобрена и опубликована!'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to send approval notification: ${errorMessage}`);
    }

    this.logger.log(`Story ${storyId} approved`);
    return this.mapToResponseDto(updatedStory);
  }

  async rejectStory(storyId: number): Promise<StoryResponseDto> {
    const story = await this.storiesRepository.findById(storyId);
    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (!story.isPending()) {
      throw new BadRequestException('Story is not pending approval');
    }

    const updatedStory = await this.storiesRepository.updateStatus(storyId, StoryStatus.REJECTED);
    
    // Уведомляем пользователя об отклонении
    try {
      await this.telegramService.sendNotification(
        updatedStory.userId,
        '❌ Ваша story была отклонена модератором'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to send rejection notification: ${errorMessage}`);
    }

    this.logger.log(`Story ${storyId} rejected`);
    return this.mapToResponseDto(updatedStory);
  }

  async deleteStory(storyId: number): Promise<void> {
    const story = await this.storiesRepository.findById(storyId);
    if (!story) {
      throw new NotFoundException('Story not found');
    }

    await this.storiesRepository.delete(storyId);
    this.logger.log(`Story ${storyId} deleted`);
  }

  private mapToResponseDto(story: StoryEntity): StoryResponseDto {
    const response: StoryResponseDto = {
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
}