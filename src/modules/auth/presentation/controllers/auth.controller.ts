import { Controller, Post, Body, UseGuards, Get, Request, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { TelegramLoginDto } from '../dto/telegram-login.dto';

interface RequestWithUser {
  user: {
    id: string;
  }
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private readonly authService: AuthService) {
    const path = 'login/telegram'; 
    this.logger.log(`Auth controller initialized. Login path: /auth/${path}`);
  }

  @Post('login/telegram')
  @ApiOperation({ summary: 'Login with Telegram' })
  @ApiResponse({ status: 201, description: 'Успешная авторизация' })
  @ApiResponse({ status: 400, description: 'Неверные данные запроса' })
  async loginWithTelegram(@Body() telegramLoginDto: TelegramLoginDto) {
    this.logger.log(`Попытка входа через Telegram: ${telegramLoginDto.username} (ID: ${telegramLoginDto.id})`);
    this.logger.debug(`Данные телеграм: ${JSON.stringify(telegramLoginDto)}`);
    
    try {
      const user = await this.authService.validateTelegramUser(telegramLoginDto);
      this.logger.log(`Пользователь валидирован: ${user.username} (ID: ${user.id})`);
      
      const jwtResult = await this.authService.generateJwt(user);
      this.logger.log(`JWT токен сгенерирован, длина: ${jwtResult.access_token.length}`);
      this.logger.debug(`Токен: ${jwtResult.access_token.substring(0, 20)}...`);
      
      return jwtResult;
    } catch (error) {
      this.logger.error(`Ошибка при входе: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @Get('profile')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  getProfile(@Request() request: RequestWithUser) {
    this.logger.log(`Запрос профиля пользователя: ${request.user.id}`);
    return this.authService.getProfile(request.user.id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  refreshToken(@Request() request: RequestWithUser) {
    this.logger.log(`Запрос обновления токена: ${request.user.id}`);
    return this.authService.refreshToken(request.user.id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  logout(@Request() request: RequestWithUser) {
    this.logger.log(`Запрос выхода: ${request.user.id}`);
    return this.authService.logout(request.user.id);
  }
}