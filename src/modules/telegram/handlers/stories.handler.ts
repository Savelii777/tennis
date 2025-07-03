import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf, Markup } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
import { StoriesService } from '../../stories/application/services/stories.service';
import { UsersService } from '../../users/application/services/users.service';
import { MediaType } from '@prisma/client';
import { CreateStoryDto } from '../../stories/application/dto/create-story.dto';
import { ProfileStep, UserState } from '../interfaces/profile-state.enum'; // Обновляем путь при необходимости

@Injectable()
export class StoriesHandler {
  private readonly logger = new Logger(StoriesHandler.name);

  constructor(
    private readonly stateService: StateService,
    private readonly keyboardService: KeyboardService,
    private readonly storiesService: StoriesService,
    private readonly usersService: UsersService,
  ) {}

  register(bot: Telegraf<Context>) {
    bot.action('stories', this.handleStories.bind(this));
    bot.action('create_story', this.handleCreateStory.bind(this));
    bot.action('my_stories', this.handleMyStories.bind(this));
    bot.action('popular_stories', this.handlePopularStories.bind(this));
    bot.action('recent_stories', this.handleRecentStories.bind(this));
    bot.action('back_to_stories', this.handleBackToStories.bind(this));
  }

  async handleStories(ctx: Context) {
    try {
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📤 Загрузить Story', 'create_story')],
        [Markup.button.callback('📋 Мои Stories', 'my_stories')],
        [Markup.button.callback('🔥 Популярные', 'popular_stories')],
        [Markup.button.callback('🕐 Недавние', 'recent_stories')],
        [Markup.button.callback('🔙 Назад в меню', 'main_menu')],
      ]);
      
      await ctx.editMessageText('📱 **Stories**\n\nДелитесь фото и видео с ваших матчей!', { 
        parse_mode: 'Markdown', 
        reply_markup: keyboard.reply_markup 
      });
    } catch (error) {
      this.logger.error(`Ошибка в handleStories: ${error}`);
      await ctx.reply('❌ Произошла ошибка при работе со сторис');
    }
  }

 async handleCreateStory(ctx: Context) {
  try {
    if (!ctx.from) return;

    await ctx.answerCbQuery();
    
    // Безопасная установка страницы в состоянии пользователя
    const userId = ctx.from.id.toString();
    const userState = this.stateService.getUserState(userId);
    
    const updatedUserState = {
      ...userState,
      page: 'stories' // Теперь это свойство правильно типизировано
    };
    this.stateService.setUserState(userId, updatedUserState);
    
    await ctx.reply(
      '📸 Отправьте фото или видео (до 30 секунд) для создания истории.\n\n' +
      'ℹ️ После отправки медиафайла вы сможете добавить описание.'
    );
  } catch (error) {
    this.logger.error(`Ошибка в handleCreateStory: ${error}`);
  }
}

 async handlePhoto(ctx: Context) {
  try {
    if (!ctx.from || !ctx.message || !('photo' in ctx.message)) return false;
    
    const userId = ctx.from.id.toString();
    const userState = this.stateService.getUserState(userId);
    
    // Проверяем страницу безопасным способом
    if (userState.page === 'stories') {
      // Получаем файл с наилучшим качеством
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      
      // Находим пользователя
      const user = await this.usersService.findByTelegramId(userId);
      if (!user) {
        await ctx.reply('❌ Пользователь не найден. Пожалуйста, выполните /start');
        return true;
      }
      
      // Безопасно обновляем состояние пользователя с новыми полями
      const updatedUserState = {
        ...userState,
        step: ProfileStep.AWAITING_STORY_DESCRIPTION,
        data: {
          ...userState.data,
          fileId: photo.file_id,
          fileType: MediaType.image
        }
      };
      this.stateService.setUserState(userId, updatedUserState);
      
      await ctx.reply(
        '📝 Отлично! Теперь введите описание для вашей Story (или отправьте "-" для публикации без описания):'
      );
      
      return true;
    }
    
    return false;
  } catch (error) {
    this.logger.error(`Ошибка в handlePhoto: ${error}`);
    await ctx.reply('❌ Произошла ошибка при загрузке фото');
    return true;
  }
}

  async handleVideo(ctx: Context) {
    try {
      if (!ctx.from || !ctx.message || !('video' in ctx.message)) return false;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      // Проверяем, загружает ли пользователь сторис
      if (userState.page === 'stories') {
        const video = ctx.message.video;
        
        // Проверяем длительность видео
        if (video.duration > 30) {
          await ctx.reply('❌ Видео слишком длинное. Максимальная длительность - 30 секунд.');
          return true;
        }
        
        // Находим пользователя в базе
        const user = await this.usersService.findByTelegramId(userId);
        if (!user) {
          await ctx.reply('❌ Пользователь не найден. Пожалуйста, выполните /start');
          return true;
        }
        
        // Сохраняем информацию о видео во временное состояние
        const updatedUserState: UserState = {
          ...userState,
          step: ProfileStep.AWAITING_STORY_DESCRIPTION,
          data: {
            ...userState.data,
            fileId: video.file_id,
            fileType: MediaType.video
          }
        };
        this.stateService.setUserState(userId, updatedUserState);
        
        // Запрашиваем описание для видео
        await ctx.reply(
          '📝 Отлично! Теперь введите описание для вашей Story (или отправьте "-" для публикации без описания):'
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Ошибка в handleVideo: ${error}`);
      await ctx.reply('❌ Произошла ошибка при загрузке видео');
      return true;
    }
  }

 async handleStoryInput(ctx: Context, text: string, userId: string): Promise<boolean> {
  try {
    const userState = this.stateService.getUserState(userId);
    
    // Проверяем состояние и наличие fileId безопасным способом
    if (userState.step === ProfileStep.AWAITING_STORY_DESCRIPTION && userState.data?.fileId) {
      // Находим пользователя
      const user = await this.usersService.findByTelegramId(userId);
      if (!user) {
        await ctx.reply('❌ Пользователь не найден. Пожалуйста, выполните /start');
        return true;
      }
      
      // Создаем DTO
      const createStoryDto: CreateStoryDto = {
        telegramFileId: userState.data.fileId,
        type: userState.data.fileType as MediaType,
        caption: text === '-' ? undefined : text
      };
      
      // Сохраняем сторис
      await this.storiesService.createStory(user.id, createStoryDto);
      
      // Сбрасываем состояние безопасным способом
      const resetUserState = {
        ...userState,
        step: ProfileStep.IDLE,
        data: {}, // Очищаем данные
        page: undefined // Удаляем страницу
      };
      this.stateService.setUserState(userId, resetUserState);
      
      // Отправляем подтверждение
      await ctx.reply(
        '✅ Ваша Story успешно создана и отправлена на модерацию!\n\n' +
        'После проверки модератором она станет доступна в разделе Stories.',
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('📋 Мои Stories', 'my_stories')],
            [Markup.button.callback('📤 Загрузить еще', 'create_story')],
            [Markup.button.callback('🔙 Назад', 'back_to_stories')]
          ]).reply_markup
        }
      );
      
      return true;
    }
    
    return false;
  } catch (error) {
    this.logger.error(`Ошибка в handleStoryInput: ${error}`);
    await ctx.reply('❌ Произошла ошибка при создании story');
    return true;
  }
}

  async handleMyStories(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      const userId = ctx.from.id.toString();
      
      // Находим пользователя в базе
      const user = await this.usersService.findByTelegramId(userId);
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }
      
      // Получаем истории пользователя
      const stories = await this.storiesService.getUserStories(user.id);
      
      if (stories.length === 0) {
        await ctx.reply(
          '📱 У вас пока нет Stories\n\n' +
          'Создайте свою первую историю, отправив фото или видео!',
          {
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('📤 Создать Story', 'create_story')],
              [Markup.button.callback('🔙 Назад', 'back_to_stories')]
            ]).reply_markup
          }
        );
        return;
      }
      
      // Форматируем и отображаем список историй
      let message = '📱 **Ваши Stories**\n\n';
      
      // Группируем по статусу
      const approved = stories.filter(s => s.status === 'APPROVED');
      const pending = stories.filter(s => s.status === 'PENDING');
      const rejected = stories.filter(s => s.status === 'REJECTED');
      
      if (approved.length > 0) {
        message += '✅ **Опубликованные:**\n';
        approved.slice(0, 5).forEach((story, i) => {
          message += `${i+1}. ${story.type === 'IMAGE' ? '📸' : '🎥'} ${formatDate(story.createdAt)}\n`;
          if (story.caption) message += `   "${story.caption}"\n`;
          message += `   👁️ ${story.viewsCount} просмотров\n\n`;
        });
      }
      
      if (pending.length > 0) {
        message += '⏳ **На модерации:**\n';
        pending.forEach((story, i) => {
          message += `${i+1}. ${story.type === 'IMAGE' ? '📸' : '🎥'} ${formatDate(story.createdAt)}\n\n`;
        });
      }
      
      if (rejected.length > 0) {
        message += '❌ **Отклоненные:**\n';
        rejected.slice(0, 3).forEach((story, i) => {
          message += `${i+1}. ${story.type === 'IMAGE' ? '📸' : '🎥'} ${formatDate(story.createdAt)}\n\n`;
        });
      }
      
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('📤 Создать новую Story', 'create_story')],
          [Markup.button.callback('🔙 Назад', 'back_to_stories')]
        ]).reply_markup
      });
      
    } catch (error) {
      this.logger.error(`Ошибка в handleMyStories: ${error}`);
      await ctx.reply('❌ Произошла ошибка при получении ваших историй');
    }
  }

  async handlePopularStories(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      // Получаем популярные истории
      const stories = await this.storiesService.getPopularStories(10);
      
      if (stories.length === 0) {
        await ctx.reply(
          '📱 Популярные Stories\n\n' +
          'Пока нет популярных историй. Станьте первым, кто создаст trending story!',
          {
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('📤 Создать Story', 'create_story')],
              [Markup.button.callback('🔙 Назад', 'back_to_stories')]
            ]).reply_markup
          }
        );
        return;
      }
      
      // Форматируем и отображаем списком
      let message = '🔥 **Популярные Stories**\n\n';
      
      stories.forEach((story, i) => {
        message += `${i+1}. ${story.type === 'IMAGE' ? '📸' : '🎥'} ${story.user.firstName} ${story.user.lastName || ''}\n`;
        if (story.caption) message += `   "${story.caption}"\n`;
        message += `   👁️ ${story.viewsCount} просмотров\n\n`;
      });
      
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('📤 Создать свою Story', 'create_story')],
          [Markup.button.callback('🔙 Назад', 'back_to_stories')]
        ]).reply_markup
      });
      
    } catch (error) {
      this.logger.error(`Ошибка в handlePopularStories: ${error}`);
      await ctx.reply('❌ Произошла ошибка при получении популярных историй');
    }
  }

  async handleRecentStories(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      // Получаем недавние истории
      const stories = await this.storiesService.getRecentStories(10);
      
      if (stories.length === 0) {
        await ctx.reply(
          '📱 Недавние Stories\n\n' +
          'Пока нет недавних историй. Станьте первым, кто создаст story!',
          {
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('📤 Создать Story', 'create_story')],
              [Markup.button.callback('🔙 Назад', 'back_to_stories')]
            ]).reply_markup
          }
        );
        return;
      }
      
      // Форматируем и отображаем списком
      let message = '🕐 **Недавние Stories**\n\n';
      
      stories.forEach((story, i) => {
        message += `${i+1}. ${story.type === 'IMAGE' ? '📸' : '🎥'} ${story.user.firstName} ${story.user.lastName || ''}\n`;
        message += `   ${formatTimeAgo(story.publishedAt || story.createdAt)}\n`;
        if (story.caption) message += `   "${story.caption}"\n\n`;
        else message += '\n';
      });
      
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('📤 Создать свою Story', 'create_story')],
          [Markup.button.callback('🔙 Назад', 'back_to_stories')]
        ]).reply_markup
      });
      
    } catch (error) {
      this.logger.error(`Ошибка в handleRecentStories: ${error}`);
      await ctx.reply('❌ Произошла ошибка при получении недавних историй');
    }
  }

  async handleBackToStories(ctx: Context) {
    return this.handleStories(ctx);
  }
}

// Вспомогательные функции форматирования
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffSec < 60) return `${diffSec} сек. назад`;
  if (diffMin < 60) return `${diffMin} мин. назад`;
  if (diffHour < 24) return `${diffHour} ч. назад`;
  if (diffDay < 30) return `${diffDay} дн. назад`;
  
  return formatDate(date);
}