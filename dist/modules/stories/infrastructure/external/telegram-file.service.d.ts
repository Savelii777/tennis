import { ConfigService } from '@nestjs/config';
import { ITelegramFileResponse } from '../../domain/interfaces/story.interface';
export declare class TelegramFileService {
    private readonly configService;
    private readonly logger;
    private readonly botToken;
    constructor(configService: ConfigService);
    getFile(fileId: string): Promise<ITelegramFileResponse | null>;
    getFileUrl(filePath: string): string;
    getBotToken(): string;
    validateFileSize(fileId: string, maxSizeMB?: number): Promise<boolean>;
}
