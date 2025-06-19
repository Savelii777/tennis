import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TelegramAuthService } from '../../infrastructure/telegram/telegram-auth.service';
import { UsersService } from '../../../users/application/services/users.service';
import { TelegramLoginDto } from '../../presentation/dto/telegram-login.dto';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { AchievementsService } from '../../../achievements/application/services/achievements.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private telegramAuthService: TelegramAuthService,
    private userService: UsersService,
    private readonly achievementsService: AchievementsService,
  ) {}

  async loginTelegram(telegramLoginDto: TelegramLoginDto): Promise<any> {
    this.logger.log(`Telegram auth attempt for user: ${telegramLoginDto.username}`);

    try {
      let user = await this.userService.findByTelegramId(telegramLoginDto.id.toString());
      let isNewUser = false;

      if (!user) {
        this.logger.log(`Creating new user for Telegram ID: ${telegramLoginDto.id}`);
        user = await this.userService.createFromTelegram(telegramLoginDto);
        isNewUser = true;
      } else {
        this.logger.log(`Existing user found: ${user.id}`);
        user = await this.userService.updateLastLogin(user.id.toString());
      }

      // Проверяем, что user не null после создания/обновления
      if (!user) {
        throw new BadRequestException('Failed to create or find user');
      }

      const tokens = await this.generateTokens(user.id.toString(), user.username);

      // Безопасно проверяем достижения для нового пользователя
      if (isNewUser) {
        try {
          await this.achievementsService.checkAndAwardAchievements(
            user.id.toString(),
            'registration_completed'
          );
        } catch (achievementError) {
          // Логируем ошибку, но не прерываем процесс авторизации
          this.logger.error(`Failed to check achievements for new user ${user.id}:`, achievementError);
        }
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          firstName: user.first_name, // Исправляем имена полей
          lastName: user.last_name,
          telegramId: user.telegram_id,
          role: user.role,
          isVerified: user.is_verified,
          profile: user.profile,
        },
        tokens,
        isNewUser,
      };

    } catch (error) {
      this.logger.error(`Login failed for Telegram user ${telegramLoginDto.username}:`, error);
      throw new BadRequestException('Ошибка входа через Telegram');
    }
  }

  private async generateTokens(userId: string, username: string) {
    const payload = { sub: userId, username };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateTelegramUser(telegramLoginDto: TelegramLoginDto): Promise<UserEntity> {
    const { id, hash } = telegramLoginDto;
    this.logger.log(`Валидация пользователя Telegram: ${telegramLoginDto.username} (ID: ${id})`);
    
    const isValid = this.telegramAuthService.validateTelegramSignature(id, hash);
    this.logger.log(`Проверка подписи Telegram: ${isValid ? 'успешно' : 'неудачно'}`);

    if (!isValid) {
      this.logger.error(`Неверная подпись Telegram для ID: ${id}`);
      throw new Error('Invalid Telegram login');
    }

    let user = await this.userService.findByTelegramId(id);
    
    if (!user) {
      this.logger.log(`Пользователь не найден, создаем новый аккаунт для ${telegramLoginDto.username}`);
      user = await this.userService.create({
        telegram_id: id,
        username: telegramLoginDto.username || `user_${id}`,
        first_name: telegramLoginDto.first_name,
        last_name: telegramLoginDto.last_name,
      });
      this.logger.log(`Создан новый пользователь: ${user.username} (ID: ${user.id})`);
    } else {
      this.logger.log(`Пользователь найден: ${user.username} (ID: ${user.id})`);
    }
    
    return user;
  }

  async generateJwt(user: UserEntity): Promise<{ access_token: string }> {
    this.logger.log(`Генерация JWT для пользователя: ${user.username} (ID: ${user.id})`);
    const payload = { sub: user.id, username: user.username, role: user.role };
    this.logger.debug(`JWT payload: ${JSON.stringify(payload)}`);
    
    const token = this.jwtService.sign(payload);
    this.logger.debug(`JWT токен создан, длина: ${token.length}`);
    
    return {
      access_token: token,
    };
  }

  async validateUser(telegramId: string): Promise<UserEntity | null> {
    this.logger.log(`Валидация пользователя по Telegram ID: ${telegramId}`);
    return this.userService.findByTelegramId(telegramId);
  }

  async getProfile(userId: string): Promise<UserEntity> {
    this.logger.log(`Получение профиля пользователя: ${userId}`);
    return this.userService.findById(userId);
  }

  async findUserByTelegramId(telegramId: string): Promise<UserEntity | null> {
    return this.userService.findByTelegramId(telegramId);
  }
  
  async createUserFromTelegram(telegramData: any): Promise<UserEntity> {
    const userData = {
      telegram_id: telegramData.id,
      username: telegramData.username || `user_${telegramData.id}`, 
      first_name: telegramData.first_name,
      last_name: telegramData.last_name || null,
      photo_url: telegramData.photo_url || null,
    };

    return this.userService.create(userData);
  }

  async refreshToken(userId: string): Promise<any> {
    this.logger.log(`Обновление токена для пользователя: ${userId}`);
    const user = await this.userService.findById(userId);
    return this.generateJwt(user);
  }

  async logout(userId: string): Promise<any> {
    this.logger.log(`Выход пользователя: ${userId}`);
    return { success: true };
  }
}