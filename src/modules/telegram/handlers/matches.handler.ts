import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf, Markup } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
import { UsersService } from '../../users/application/services/users.service';

@Injectable()
export class MatchesHandler {
  private readonly logger = new Logger(MatchesHandler.name);

  constructor(
    private readonly stateService: StateService,
    private readonly keyboardService: KeyboardService,
    private readonly usersService: UsersService
  ) {}

  register(bot: Telegraf<Context>) {
    bot.action('record_match', this.handleRecordMatch.bind(this));
  }

  async handleRecordMatch(ctx: Context) {
    try {
      await ctx.reply('📝 Запись результата матча');
    } catch (error) {
      this.logger.error(`Ошибка в handleRecordMatch: ${error}`);
      await ctx.reply('❌ Произошла ошибка при записи матча');
    }
  }

  async handleMatchInput(ctx: Context, text: string, userId: string): Promise<boolean> {
    // Заглушка для обработки ввода
    return false;
  }
}