import { Controller, Post, Body, Headers, HttpCode, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Update } from 'nestjs-telegraf';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);
  
  constructor(private readonly configService: ConfigService) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Body() update: any,
    @Headers('x-telegram-bot-api-secret-token') secretToken: string,
  ) {
    // В режиме polling вебхуки не используются
    return { ok: true };
  }
}