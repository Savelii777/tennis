import { ConfigService } from '@nestjs/config';
export declare class TelegramController {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    handleWebhook(update: any, secretToken: string): Promise<{
        ok: boolean;
    }>;
}
