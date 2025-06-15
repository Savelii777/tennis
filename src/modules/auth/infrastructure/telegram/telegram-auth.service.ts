import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { TelegramLoginDto } from '../../presentation/dto/telegram-login.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../../users/application/services/users.service';
import { User } from '../../../users/domain/entities/user.entity';

@Injectable()
export class TelegramAuthService {
  private readonly logger = new Logger('TelegramAuthService');

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  validateTelegramSignature(userId: string, hash: string): boolean {

    this.logger.log(`Валидация подписи для пользователя ${userId}`);
    return true;
  }

  async authenticateUser(telegramData: TelegramLoginDto): Promise<any> {
    const { id, username, first_name, last_name, photo_url } = telegramData;
    
    this.logger.log(`Аутентификация пользователя: ${username} (${id})`);
    
    let user = await this.usersService.findByTelegramId(id);
    
    if (!user) {
      this.logger.log('Создание нового пользователя');
      
      const userData = {
        telegram_id: id,
        username: username || `user_${id}`, 
        first_name,
        last_name: last_name || '',
        photo_url: photo_url || '',
      };
      
      user = await this.usersService.create(userData);
    }

    const payload = { 
      sub: user.id, 
      username: user.username, 
      telegramId: user.telegram_id 
    };
    
    const access_token = this.jwtService.sign(payload);
    
    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        telegram_id: user.telegram_id,
      },
    };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.error(`Ошибка верификации токена: ${error}`);
      throw new Error('Invalid token');
    }
  }
}