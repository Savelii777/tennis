import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { TelegramLoginDto } from '../../presentation/dto/telegram-login.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../../users/application/services/users.service';
import { User } from '../../../users/domain/entities/user.entity';

@Injectable()
export class TelegramAuthService {
  private readonly botToken: string;
  private readonly apiUrl: string;
  private readonly logger = new Logger('TelegramAuthService');

  constructor(
    private configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {
    this.botToken = this.configService.get<string>('telegram.botToken') || '';
    this.apiUrl = this.configService.get<string>('TELEGRAM_API_URL') || '';
    
    this.logger.log(`Инициализирован с botToken: ${this.botToken ? 'настроен' : 'не настроен'}`);
    this.logger.log(`Инициализирован с apiUrl: ${this.apiUrl || 'не настроен'}`);
  }

  validateTelegramSignature(telegramId: string, hash: string): boolean {
    this.logger.log(`Валидация подписи Telegram для ID: ${telegramId}`);
    
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      this.logger.log(`Тестовая среда: валидация пропущена, возвращаем true`);
      return true;
    }
    
    this.logger.log(`Проверка подписи реализована частично, возвращаем true`);
    return true;
  }

  async getUserInfo(telegramId: string): Promise<any> {
    this.logger.log(`Получение информации пользователя Telegram ID: ${telegramId}`);
    return { id: telegramId };
  }

  async validateUser(telegramLoginDto: TelegramLoginDto): Promise<User | null> {
    const { id, username, first_name, auth_date } = telegramLoginDto;

    const user = await this.usersService.findByTelegramId(id);
    if (user) {
      return user;
    }

    return this.usersService.create({
      telegram_id: id,
      username,
      first_name,
    });
  }

  async login(user: User): Promise<{ access_token: string }> {
    const payload = { id: user.id, username: user.username, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}