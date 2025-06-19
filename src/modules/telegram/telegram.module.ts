import { Module, forwardRef } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotService } from './bot.service';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { UsersModule } from '../users/users.module';
import { RequestsModule } from '../requests/requests.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { MatchesModule } from '../matches/matches.module';
import { TrainingsModule } from '../trainings/trainings.module';
import { StoriesModule } from '../stories/stories.module';
import { CasesModule } from '../cases/cases.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AchievementsModule } from '../achievements/achievements.module'; // Добавляем
import { RatingsModule } from '../ratings/ratings.module'; // Добавляем
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        
        console.log('🤖 Telegram Module Factory');
        console.log(`Token exists: ${!!token}`);
        
        if (!token) {
          throw new Error('TELEGRAM_BOT_TOKEN не найден в environment');
        }
        
        return {
          token,
        };
      },
    }),
    ConfigModule,
    forwardRef(() => UsersModule),
    forwardRef(() => RequestsModule),
    forwardRef(() => TournamentsModule),
    forwardRef(() => MatchesModule),
    forwardRef(() => TrainingsModule),
    forwardRef(() => StoriesModule),
    forwardRef(() => CasesModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => AchievementsModule), 
    forwardRef(() => RatingsModule),
    forwardRef(() => SettingsModule),

  ],
  controllers: [TelegramController],
  providers: [
    BotService,
    TelegramService,
    PrismaService
  ],
  exports: [TelegramService, BotService], 
})
export class TelegramModule {}