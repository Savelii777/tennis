import { Module } from '@nestjs/common';
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
    UsersModule,
    RequestsModule,
    TournamentsModule,
    MatchesModule,
    TrainingsModule,
    StoriesModule,
    CasesModule,
  ],
  controllers: [TelegramController],
  providers: [
    BotService,
    TelegramService,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}