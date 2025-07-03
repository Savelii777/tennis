import { Controller, Post, Body, Headers, HttpCode, Logger, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Update } from 'nestjs-telegraf';
import { BotService } from './bot.service';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly botService: BotService
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Body() update: any,
    @Headers('x-telegram-bot-api-secret-token') secretToken: string,
  ) {
    this.logger.log(`📥 Получен webhook: ${JSON.stringify(update)}`);
    
    try {
      await this.botService.processUpdate(update);
      return { ok: true };
    } catch (error) {
      this.logger.error('❌ Ошибка обработки webhook:', error);
      return { ok: false, error: String(error) };
    }
  }

  @Get('info')
  async getBotInfo() {
    try {
      const info = await this.botService.getBotInfo();
      return { ok: true, result: info };
    } catch (error) {
      return { ok: false, error: String(error) };
    }
  }

  @Post('test')
  async testBot(@Body() body: any) {
    this.logger.log(`🧪 Тестовый вызов: ${JSON.stringify(body)}`);
    
    // Создаем тестовое обновление
    const testUpdate = {
      update_id: Date.now(),
      message: {
        message_id: 1,
        from: {
          id: 123456789,
          is_bot: false,
          first_name: "Test",
          username: "testuser"
        },
        chat: {
          id: 123456789,
          first_name: "Test",
          username: "testuser",
          type: "private"
        },
        date: Math.floor(Date.now() / 1000),
        text: body.text || "/start"
      }
    };

    try {
      await this.botService.processUpdate(testUpdate);
      return { ok: true, message: "Тестовое сообщение обработано" };
    } catch (error) {
      return { ok: false, error: String(error) };
    }
  }
}