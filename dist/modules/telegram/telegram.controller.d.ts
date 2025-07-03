import { ConfigService } from '@nestjs/config';
import { BotService } from './bot.service';
export declare class TelegramController {
    private readonly configService;
    private readonly botService;
    private readonly logger;
    constructor(configService: ConfigService, botService: BotService);
    handleWebhook(update: any, secretToken: string): Promise<{
        ok: boolean;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
    }>;
    getBotInfo(): Promise<{
        ok: boolean;
        result: import("@telegraf/types").UserFromGetMe;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        result?: undefined;
    }>;
    testBot(body: any): Promise<{
        ok: boolean;
        message: string;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        message?: undefined;
    }>;
}
