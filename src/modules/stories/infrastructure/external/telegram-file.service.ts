import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITelegramFileResponse } from '../../domain/interfaces/story.interface';

@Injectable()
export class TelegramFileService {
  private readonly logger = new Logger(TelegramFileService.name);
  private readonly botToken: string;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }
    this.botToken = token;
  }

  async getFile(fileId: string): Promise<ITelegramFileResponse | null> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/getFile?file_id=${fileId}`
      );

      if (!response.ok) {
        this.logger.error(`Failed to get file info: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      
      if (!data.ok) {
        this.logger.error(`Telegram API error: ${data.description}`);
        return null;
      }

      return data.result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting file from Telegram: ${errorMessage}`);
      return null;
    }
  }

  getFileUrl(filePath: string): string {
    return `https://api.telegram.org/file/bot${this.botToken}/${filePath}`;
  }

  getBotToken(): string {
    return this.botToken;
  }

  async validateFileSize(fileId: string, maxSizeMB = 50): Promise<boolean> {
    const fileInfo = await this.getFile(fileId);
    if (!fileInfo || !fileInfo.file_size) return true; // Allow if we can't check size
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return fileInfo.file_size <= maxSizeBytes;
  }
}