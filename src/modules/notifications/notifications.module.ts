import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './application/services/notifications.service';
import { NotificationsRepository } from './infrastructure/repositories/notifications.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersModule } from '../users/users.module';
import { TelegramModule } from '../telegram/telegram.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => TelegramModule),
    forwardRef(() => AuthModule),
  ],
  providers: [NotificationsService, NotificationsRepository, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}