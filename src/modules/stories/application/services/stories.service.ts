import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { StoriesRepository } from '../../infrastructure/repositories/stories.repository';
import { TelegramFileService } from '../../infrastructure/external/telegram-file.service';
import { TelegramService } from '../../../telegram/telegram.service';
import { CreateStoryDto } from '../dto/create-story.dto';
import { StoryResponseDto } from '../dto/story-response.dto';
import { StoryStatus, MediaType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

interface UserStoryGroup {
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
  stories: {
    id: number;
    type: MediaType;
    fileUrl: string;
    caption: string | null;
    publishedAt: Date;
    viewsCount: number;
  }[];
}

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(
    private readonly storiesRepository: StoriesRepository,
    private readonly telegramFileService: TelegramFileService,
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) {}

  async createStory(userId: number, createStoryDto: CreateStoryDto): Promise<StoryResponseDto> {
    try {
      const story = await this.storiesRepository.create({
        userId,
        telegramFileId: createStoryDto.telegramFileId,
        type: createStoryDto.type,
        caption: createStoryDto.caption,
        status: StoryStatus.pending, // Исправлено с PENDING на pending
      });
      
      this.logger.log(`Story ${story.id} created by user ${userId} and pending approval`);
      
      // Уведомляем администраторов о новой сторис на модерацию
      try {
        // Получаем ID админов из конфига
        const adminIds = this.configService.get<string>('ADMIN_IDS', '')?.split(',') || [];
        
        // Отправляем уведомления
        for (const adminId of adminIds) {
          await this.telegramService.sendNotification(
            adminId,
            `📱 Новая Story на модерацию!\n` +
            `ID: ${story.id}\n` +
            `Пользователь: ${userId}\n` +
            `Тип: ${story.type === MediaType.image ? 'Фото' : 'Видео'}\n\n` + // Исправлено с IMAGE на image
            `Используйте админ-панель для проверки.`
          ).catch(err => this.logger.warn(`Failed to notify admin ${adminId}: ${err}`));
        }
      } catch (error) {
        this.logger.warn(`Failed to notify admins about new story: ${error}`);
      }
      
      return this.mapToResponseDto(story);
    } catch (error) {
      this.logger.error(`Error creating story: ${error}`);
      throw error;
    }
  }

  async getPublicStories(limit = 20): Promise<StoryResponseDto[]> {
    const stories = await this.storiesRepository.findPublic(limit);
    return stories.map(story => this.mapToResponseDto(story));
  }

  /**
   * Получить сторис для отображения в формате "stories" (карусель аватарок)
   * Группирует по пользователям и возвращает структуру для отображения в UI
   */
  async getStoriesForCarousel(): Promise<UserStoryGroup[]> {
    const stories = await this.storiesRepository.findPublicGroupedByUser();
    
    // Группируем истории по пользователям
    const userGroups: Record<string, UserStoryGroup> = {};
    
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

  async getUserStories(userId: string | number): Promise<any[]> {
    const userIdInt = typeof userId === 'string' ? parseInt(userId) : userId;
    const stories = await this.storiesRepository.findByUserId(userIdInt);
    return stories.map(story => this.mapToResponseDto(story));
  }

  // Получение популярных историй
  async getPopularStories(limit = 10): Promise<any[]> {
    const stories = await this.storiesRepository.findPopular(limit);
    return stories.map(story => this.mapToResponseDto(story));
  }

  // Получение недавних историй
  async getRecentStories(limit = 10): Promise<any[]> {
    const stories = await this.storiesRepository.findRecent(limit);
    return stories.map(story => this.mapToResponseDto(story));
  }

  async getStoryById(id: number): Promise<StoryResponseDto> {
    const story = await this.storiesRepository.findById(id);
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    return this.mapToResponseDto(story);
  }

  // Обновление просмотров истории
  async recordView(storyId: number): Promise<void> {
    await this.storiesRepository.incrementViews(storyId);
  }

  /**
   * Получение URL файла из Telegram
   */
  async getFileUrl(storyId: number): Promise<{ url: string }> {
    const story = await this.storiesRepository.findById(storyId);
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    
    if (story.status !== StoryStatus.approved) { // Исправлено с APPROVED на approved
      throw new BadRequestException('Story is not published');
    }
    
    // Если путь уже есть, формируем URL
    if (story.telegramFilePath) {
      const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
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
      const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
      return {
        url: `https://api.telegram.org/file/bot${token}/${filePath}`
      };
    } catch (error) {
      this.logger.error(`Error getting file path for story ${storyId}: ${error}`);
      throw new BadRequestException('Could not get file path from Telegram');
    }
  }

  async getPendingStories(): Promise<StoryResponseDto[]> {
    const stories = await this.storiesRepository.findPending();
    return stories.map(story => this.mapToResponseDto(story));
  }

  async approveStory(storyId: number): Promise<StoryResponseDto> {
    const story = await this.storiesRepository.findById(storyId);
    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (story.status !== StoryStatus.pending) { // Исправлено с PENDING на pending
      throw new BadRequestException('Story is not pending approval');
    }

    const updatedStory = await this.storiesRepository.updateStatus(
      storyId, 
      StoryStatus.approved, // Исправлено с APPROVED на approved
      new Date()
    );
    
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

    if (story.status !== StoryStatus.pending) { // Исправлено с PENDING на pending
      throw new BadRequestException('Story is not pending approval');
    }

    const updatedStory = await this.storiesRepository.updateStatus(storyId, StoryStatus.rejected); // Исправлено с REJECTED на rejected
    
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

  private mapToResponseDto(story: any): StoryResponseDto {
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
}