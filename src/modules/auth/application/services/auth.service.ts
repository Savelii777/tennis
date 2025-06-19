import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TelegramAuthService } from '../../infrastructure/telegram/telegram-auth.service';
import { UsersService } from '../../../users/application/services/users.service';
import { TelegramLoginDto } from '../../presentation/dto/telegram-login.dto';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { AchievementsService } from '../../../achievements/application/services/achievements.service';
import { SettingsService } from '../../../settings/settings.service';
import { RatingsService } from '../../../ratings/ratings.service'; // Добавляем импорт RatingsService

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private telegramAuthService: TelegramAuthService,
    private userService: UsersService,
    private readonly achievementsService: AchievementsService,
    private readonly settingsService: SettingsService,
    private readonly ratingsService: RatingsService, // Добавляем RatingsService
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

        // Создаем дефолтный рейтинг для нового пользователя
        try {
          await this.ratingsService.createDefaultRating(user.id);
          this.logger.log(`Created default rating for new user ${user.id}`);
        } catch (ratingError) {
          this.logger.error(`Failed to create rating for user ${user.id}:`, ratingError);
          // Не прерываем процесс регистрации из-за ошибки рейтинга
        }

        // Создаем дефолтные настройки для нового пользователя
        try {
          await this.settingsService.createDefaultSettings(user.id);
          this.logger.log(`Created default settings for new user ${user.id}`);
        } catch (settingsError) {
          this.logger.error(`Failed to create settings for user ${user.id}:`, settingsError);
          // Не прерываем процесс регистрации из-за ошибки настроек
        }

      } else {
        this.logger.log(`Existing user found: ${user.id}`);
        user = await this.userService.updateLastLogin(user.id.toString());

        // Проверяем, есть ли у существующего пользователя рейтинг
        try {
          const existingRating = await this.ratingsService.getRatingForUser(user.id);
          if (!existingRating) {
            await this.ratingsService.createDefaultRating(user.id);
            this.logger.log(`Created missing rating for existing user ${user.id}`);
          }
        } catch (ratingError) {
          this.logger.error(`Failed to check/create rating for existing user ${user.id}:`, ratingError);
        }

        // Проверяем, есть ли у существующего пользователя настройки
        try {
          const existingSettings = await this.settingsService.getUserSettings(user.id);
          if (!existingSettings) {
            await this.settingsService.createDefaultSettings(user.id);
            this.logger.log(`Created missing settings for existing user ${user.id}`);
          }
        } catch (settingsError) {
          this.logger.error(`Failed to check/create settings for existing user ${user.id}:`, settingsError);
        }
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
          this.logger.error(`Failed to check achievements for new user ${user.id}:`, achievementError);
        }
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          firstName: user.first_name,
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

      // Создаем рейтинг и настройки для нового пользователя
      try {
        await this.ratingsService.createDefaultRating(user.id);
        await this.settingsService.createDefaultSettings(user.id);
        this.logger.log(`Created rating and settings for new user: ${user.username} (ID: ${user.id})`);
      } catch (error) {
        this.logger.error(`Failed to create rating/settings for new user ${user.id}:`, error);
      }

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

    const user = await this.userService.create(userData);

    // Создаем рейтинг и настройки для нового пользователя
    try {
      await this.ratingsService.createDefaultRating(user.id);
      await this.settingsService.createDefaultSettings(user.id);
      this.logger.log(`Created rating and settings for new Telegram user ${user.id}`);
    } catch (error) {
      this.logger.error(`Failed to create rating/settings for new Telegram user ${user.id}:`, error);
    }

    return user;
  }

  async refreshToken(userId: string): Promise<any> {
    this.logger.log(`Обновление токена для пользователя: ${userId}`);
    const user = await this.userService.findById(userId);
    return this.generateTokens(user.id.toString(), user.username);
  }

  async logout(userId: string): Promise<any> {
    this.logger.log(`Выход пользователя: ${userId}`);
    return { message: 'Успешный выход из системы' };
  }

  /**
   * Получить рейтинг пользователя (вспомогательный метод)
   */
  async getUserRating(userId: string): Promise<any> {
    try {
      return await this.ratingsService.getRatingForUser(parseInt(userId));
    } catch (error) {
      this.logger.error(`Failed to get rating for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Получить настройки пользователя (вспомогательный метод)
   */
  async getUserSettings(userId: string): Promise<any> {
    try {
      return await this.settingsService.getUserSettings(parseInt(userId));
    } catch (error) {
      this.logger.error(`Failed to get settings for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Полная информация о пользователе (профиль + рейтинг + настройки)
   */
  async getFullUserProfile(userId: string): Promise<any> {
    try {
      const [user, rating, settings] = await Promise.all([
        this.getProfile(userId),
        this.getUserRating(userId),
        this.getUserSettings(userId),
      ]);

      return {
        user,
        rating,
        settings,
      };
    } catch (error) {
      this.logger.error(`Failed to get full profile for user ${userId}:`, error);
      throw error;
    }
  }
}