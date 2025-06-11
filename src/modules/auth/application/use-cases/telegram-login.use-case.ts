import { Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { TelegramLoginDto } from '../../presentation/dto/telegram-login.dto';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class TelegramLoginUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(telegramLoginDto: TelegramLoginDto): Promise<{ access_token: string }> {
    const user: UserEntity = await this.authService.validateTelegramUser(telegramLoginDto);
    return this.authService.generateJwt(user);
  }
}