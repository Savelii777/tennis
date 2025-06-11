import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './application/services/auth.service';
import { TelegramAuthService } from './infrastructure/telegram/telegram-auth.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
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