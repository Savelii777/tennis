import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MatchesModule } from './modules/matches/matches.module';
import { RequestsModule } from './modules/requests/requests.module';
import { TrainingsModule } from './modules/trainings/trainings.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { StoriesModule } from './modules/stories/stories.module';
import { LocationsModule } from './modules/locations/locations.module';
import { CasesModule } from './modules/cases/cases.module'; 
import { ReferralsModule } from './modules/referrals/referrals.module'; 
import { SharedModule } from './shared/shared.module'; 
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { RatingsModule } from './modules/ratings/ratings.module'; // Добавляем

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule, 
    AchievementsModule,
    RatingsModule, // Добавляем
    AuthModule,
    UsersModule,
    MatchesModule,
    RequestsModule,
    TrainingsModule,
    TournamentsModule,
    StoriesModule,
    LocationsModule, 
    CasesModule, 
    ReferralsModule, 
    NotificationsModule,
    TelegramModule,
  ],
})
export class AppModule {}