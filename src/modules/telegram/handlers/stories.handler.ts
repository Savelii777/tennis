import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf, Markup } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';

@Injectable()
export class StoriesHandler {
  private readonly logger = new Logger(StoriesHandler.name);

  constructor(
    private readonly stateService: StateService,
    private readonly keyboardService: KeyboardService
  ) {}

  register(bot: Telegraf<Context>) {
    bot.action('create_story', this.handleCreateStory.bind(this));
  }

  async handleStories(ctx: Context) {
    try {
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📱 Создать историю', 'create_story')]
      ]);
      
      await ctx.reply('📱 **Stories**\n\nПубликуйте свои фото и видео с корта!', { 
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
      await ctx.answerCbQuery();
      await ctx.reply('📱 Отправьте фото или видео для создания истории');
    } catch (error) {
      this.logger.error(`Ошибка в handleCreateStory: ${error}`);
    }
  }

  async handlePhoto(ctx: Context) {
    try {
      await ctx.reply('📸 Фото получено');
    } catch (error) {
      this.logger.error(`Ошибка в handlePhoto: ${error}`);
    }
  }

  async handleVideo(ctx: Context) {
    try {
      await ctx.reply('🎥 Видео получено');
    } catch (error) {
      this.logger.error(`Ошибка в handleVideo: ${error}`);
    }
  }

  async handleStoryInput(ctx: Context, text: string, userId: string): Promise<boolean> {
    // Заглушка для обработки ввода
    return false;
  }
}