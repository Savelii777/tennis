import { Module, forwardRef } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module'; // Добавляем импорт

@Module({
  imports: [
    forwardRef(() => AuthModule), // Добавляем AuthModule для поддержки AuthGuard
  ],
  controllers: [RatingsController],
  providers: [RatingsService, PrismaService],
  exports: [RatingsService],
})
export class RatingsModule {}