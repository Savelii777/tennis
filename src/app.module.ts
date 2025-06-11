import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MatchesModule } from './modules/matches/matches.module';
import { PrismaService } from './prisma/prisma.service';


import { TournamentsModule } from './modules/tournaments/tournaments.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    MatchesModule,
    TournamentsModule,

  ],
  providers: [PrismaService],
})
export class AppModule {}