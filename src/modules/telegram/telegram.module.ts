import { Module, forwardRef } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotService } from './bot.service';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';

// Хендлеры
import { ProfileHandler } from './handlers/profile.handler';
import { MatchesHandler } from './handlers/matches.handler';
import { RequestsHandler } from './handlers/requests.handler';
import { TournamentsHandler } from './handlers/tournaments.handler';
import { TrainingsHandler } from './handlers/trainings.handler';
import { StoriesHandler } from './handlers/stories.handler';
import { CasesHandler } from './handlers/cases.handler';
import { AiCoachHandler } from './handlers/ai-coach.handler';
import { CommonHandler } from './handlers/common.handler';

// Вспомогательные сервисы
import { StateService } from './services/state.service';
import { KeyboardService } from './services/keyboard.service';

// Модули
import { UsersModule } from '../users/users.module';
import { RequestsModule } from '../requests/requests.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { MatchesModule } from '../matches/matches.module';
import { TrainingsModule } from '../trainings/trainings.module';
import { StoriesModule } from '../stories/stories.module';
import { CasesModule } from '../cases/cases.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AchievementsModule } from '../achievements/achievements.module';
import { RatingsModule } from '../ratings/ratings.module';
import { SettingsModule } from '../settings/settings.module';
import { LocationsModule } from '../locations/locations.module';
import { ReferralsModule } from '../referrals/referrals.module';

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
    forwardRef(() => LocationsModule), 
    forwardRef(() => ReferralsModule),
  ],
  controllers: [TelegramController],
  providers: [
    // Основные сервисы
    BotService,
    TelegramService,
    
    // Вспомогательные сервисы
    StateService,
    KeyboardService,
    
    // Хендлеры
    ProfileHandler,
    MatchesHandler,
    RequestsHandler,
    TournamentsHandler,
    TrainingsHandler,
    StoriesHandler,
    CasesHandler,
    AiCoachHandler,
    CommonHandler,
    
    // Сервис Prisma
    PrismaService
  ],
  exports: [TelegramService, BotService],
})
export class TelegramModule {}