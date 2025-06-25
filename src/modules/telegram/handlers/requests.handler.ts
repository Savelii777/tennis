import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf, Markup } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
import { UsersService } from '../../users/application/services/users.service';

@Injectable()
export class RequestsHandler {
  private readonly logger = new Logger(RequestsHandler.name);

  constructor(
    private readonly stateService: StateService,
    private readonly keyboardService: KeyboardService,
    private readonly usersService: UsersService
  ) {}

  register(bot: Telegraf<Context>) {
    bot.action('find_game', this.handleFindGame.bind(this));
    bot.action('create_request', this.handleCreateRequest.bind(this));
  }

  async handlePlay(ctx: Context) {
    try {
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔍 Найти игру', 'find_game')],
        [Markup.button.callback('➕ Создать заявку', 'create_request')]
      ]);
      
      await ctx.reply('🎾 **Игра**\n\nВыберите действие:', { 
        parse_mode: 'Markdown', 
        reply_markup: keyboard.reply_markup 
      });
    } catch (error) {
      this.logger.error(`Ошибка в handlePlay: ${error}`);
      await ctx.reply('❌ Произошла ошибка при обработке запроса');
    }
  }

  async handleFindGame(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      await ctx.reply('🔍 Поиск игры...');
    } catch (error) {
      this.logger.error(`Ошибка в handleFindGame: ${error}`);
    }
  }

  async handleCreateRequest(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      await ctx.reply('➕ Создание заявки...');
    } catch (error) {
      this.logger.error(`Ошибка в handleCreateRequest: ${error}`);
    }
  }

  async handleRequestInput(ctx: Context, text: string, userId: string): Promise<boolean> {
    // Заглушка для обработки ввода
    return false;
  }
}