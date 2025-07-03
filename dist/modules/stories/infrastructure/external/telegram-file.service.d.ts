import { ConfigService } from '@nestjs/config';
export declare class TelegramFileService {
    private readonly configService;
    private readonly logger;
    private readonly token;
    constructor(configService: ConfigService);
    /**
     * Получить путь к файлу по его ID в Telegram
     * @param fileId ID файла в Telegram
     */
    getFilePath(fileId: string): Promise<string>;
    /**
     * Получить полный URL файла
     * @param filePath Путь к файлу
     */
    getFileUrl(filePath: string): string;
}
