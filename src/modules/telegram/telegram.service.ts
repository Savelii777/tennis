import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { BotContext } from './interfaces/context.interface';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<BotContext>,
    private readonly configService: ConfigService,
  ) {}

  // Методы для отправки сообщений пользователям
  async sendMessage(chatId: number | string, text: string, extra?: any): Promise<any> {
    try {
      return await this.bot.telegram.sendMessage(chatId, text, extra);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending message to ${chatId}: ${errorMsg}`);
      throw error;
    }
  }

  async sendPhoto(chatId: number | string, photo: string, extra?: any): Promise<any> {
    try {
      return await this.bot.telegram.sendPhoto(chatId, photo, extra);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending photo to ${chatId}: ${errorMsg}`);
      throw error;
    }
  }

  async sendMediaGroup(chatId: number | string, media: any[]): Promise<any> {
    try {
      return await this.bot.telegram.sendMediaGroup(chatId, media);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending media group to ${chatId}: ${errorMsg}`);
      throw error;
    }
  }

  // Метод для отправки уведомлений пользователям
  async sendNotification(userId: number | string, message: string): Promise<void> {
    try {
      // Находим telegramChatId пользователя по userId
      const telegramChatId = await this.getTelegramChatId(userId);
      
      if (telegramChatId) {
        await this.bot.telegram.sendMessage(telegramChatId, message);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending notification to user ${userId}: ${errorMsg}`);
    }
  }

  // Вспомогательный метод для получения telegramChatId
  private async getTelegramChatId(userId: number | string): Promise<number | null> {
    // В будущем здесь будет логика получения telegramChatId из базы данных
    return null;
  }
}