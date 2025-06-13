import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { BotContext } from './interfaces/context.interface';
export declare class TelegramService {
    private readonly bot;
    private readonly configService;
    private readonly logger;
    constructor(bot: Telegraf<BotContext>, configService: ConfigService);
    sendMessage(chatId: number | string, text: string, extra?: any): Promise<any>;
    sendPhoto(chatId: number | string, photo: string, extra?: any): Promise<any>;
    sendMediaGroup(chatId: number | string, media: any[]): Promise<any>;
    sendNotification(userId: number | string, message: string): Promise<void>;
    private getTelegramChatId;
}
