import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { BotService } from './bot.service';
import { ProfileScene } from './scenes/profile.scene';
import { GameScene } from './scenes/game.scene';
import { TrainingScene } from './scenes/training.scene';
import { TournamentScene } from './scenes/tournament.scene';
import { ResultsScene } from './scenes/results.scene';
import { StoriesScene } from './scenes/stories.scene';
import { CaseScene } from './scenes/case.scene';
import { session } from 'telegraf';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RequestsModule } from '../requests/requests.module';
import { TrainingsModule } from '../trainings/trainings.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { TelegrafModuleOptions } from 'nestjs-telegraf';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        
        if (!token) {
          throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
        }
        
        // Correct configuration for TelegrafModule
        const options: TelegrafModuleOptions = {
          token,
          include: [],
          middlewares: [session()],
          launchOptions: {} // Using default options
        };
        
        return options;
      },
    }),
    AuthModule,
    UsersModule,
    RequestsModule,
    TrainingsModule,
    TournamentsModule,
  ],
  controllers: [TelegramController],
  providers: [
    TelegramService,
    BotService,
    ProfileScene,
    GameScene,
    TrainingScene,
    TournamentScene,
    ResultsScene,
    StoriesScene,
    CaseScene,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}