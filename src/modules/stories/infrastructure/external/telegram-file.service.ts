import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TelegramFileService {
  private readonly logger = new Logger(TelegramFileService.name);
  private readonly token: string = ''; // Инициализируем пустой строкой

  constructor(private readonly configService: ConfigService) {
    const configToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    
    if (!configToken) {
      this.logger.error('TELEGRAM_BOT_TOKEN is not defined in environment');
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    } else {
      this.token = configToken;
    }
  }

  /**
   * Получить путь к файлу по его ID в Telegram
   * @param fileId ID файла в Telegram
   */
  async getFilePath(fileId: string): Promise<string> {
    try {
      // Использование Telegram Bot API для получения информации о файле
      const response = await axios.get(`https://api.telegram.org/bot${this.token}/getFile`, {
        params: { file_id: fileId }
      });

      // Проверяем успешность запроса
      if (!response.data.ok) {
        throw new Error(`Telegram API error: ${response.data.description}`);
      }

      // Возвращаем путь к файлу
      return response.data.result.file_path;
    } catch (error) {
      this.logger.error(`Error getting file path: ${error}`);
      throw error;
    }
  }

  /**
   * Получить полный URL файла
   * @param filePath Путь к файлу
   */
  getFileUrl(filePath: string): string {
    return `https://api.telegram.org/file/bot${this.token}/${filePath}`;
  }
}