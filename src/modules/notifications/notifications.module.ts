import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './application/services/notifications.service';
import { NotificationsController } from './presentation/controllers/notifications.controller';
import { NotificationsRepository } from './infrastructure/repositories/notifications.repository';
import { TelegramModule } from '../telegram/telegram.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module'; // Добавляем импорт AuthModule

@Module({
  imports: [
    AuthModule, // Добавляем AuthModule для JwtService
    forwardRef(() => TelegramModule), 
    forwardRef(() => UsersModule)
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}