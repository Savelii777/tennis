import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf, Markup } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';

@Injectable()
export class CasesHandler {
  private readonly logger = new Logger(CasesHandler.name);

  constructor(
    private readonly stateService: StateService,
    private readonly keyboardService: KeyboardService
  ) {}

  register(bot: Telegraf<Context>) {
    bot.action('open_case', this.handleOpenCase.bind(this));
    bot.action('buy_balls', this.handleBuyBalls.bind(this));
  }

  async handleCases(ctx: Context) {
    try {
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🎁 Открыть кейс', 'open_case')],
        [Markup.button.callback('💰 Купить мячи', 'buy_balls')]
      ]);
      
      await ctx.reply('🎁 **Кейсы**\n\nОткрывайте кейсы и получайте призы!', { 
        parse_mode: 'Markdown', 
        reply_markup: keyboard.reply_markup 
      });
    } catch (error) {
      this.logger.error(`Ошибка в handleCases: ${error}`);
      await ctx.reply('❌ Произошла ошибка при работе с кейсами');
    }
  }

  async handleOpenCase(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      await ctx.reply('🎁 Открытие кейса...');
    } catch (error) {
      this.logger.error(`Ошибка в handleOpenCase: ${error}`);
    }
  }

  async handleBuyBalls(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      await ctx.reply('💰 Покупка мячей...');
    } catch (error) {
      this.logger.error(`Ошибка в handleBuyBalls: ${error}`);
    }
  }
}