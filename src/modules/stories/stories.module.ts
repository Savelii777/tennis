import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StoriesController } from './presentation/controllers/stories.controller';
import { StoriesService } from './application/services/stories.service';
import { StoriesRepository } from './infrastructure/repositories/stories.repository';
import { TelegramFileService } from './infrastructure/external/telegram-file.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramModule } from '../telegram/telegram.module';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    ConfigModule,
    AuthModule, 
    forwardRef(() => TelegramModule), 
  ],
  controllers: [StoriesController],
  providers: [
    StoriesService,
    StoriesRepository,
    TelegramFileService,
    PrismaService,
  ],
  exports: [
    StoriesService,
    StoriesRepository,
    TelegramFileService,
  ],
})
export class StoriesModule {}