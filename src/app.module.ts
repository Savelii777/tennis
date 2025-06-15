import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MatchesModule } from './modules/matches/matches.module';
import { RequestsModule } from './modules/requests/requests.module';
import { TrainingsModule } from './modules/trainings/trainings.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { PrismaService } from './prisma/prisma.service';
import { StoriesModule } from './modules/stories/stories.module';
import { LocationsModule } from './modules/locations/locations.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    MatchesModule,
    RequestsModule,
    TrainingsModule,
    TournamentsModule,
    TelegramModule,
    StoriesModule,
    LocationsModule, 

  ],
  providers: [PrismaService],
})
export class AppModule {}