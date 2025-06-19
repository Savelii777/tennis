import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './application/services/auth.service';
import { TelegramAuthService } from './infrastructure/telegram/telegram-auth.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersModule } from '../users/users.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { SettingsModule } from '../settings/settings.module';
import { RatingsModule } from '../ratings/ratings.module'; // Добавляем RatingsModule

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => AchievementsModule),
    forwardRef(() => SettingsModule),
    forwardRef(() => RatingsModule), // Добавляем циклический импорт RatingsModule

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TelegramAuthService, PrismaService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}