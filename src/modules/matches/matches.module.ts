import { Module, forwardRef } from '@nestjs/common';
import { MatchesController } from './presentation/controllers/matches.controller';
import { MatchesService } from './application/services/matches.service';
import { MatchesRepository } from './infrastructure/repositories/matches.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { RatingsModule } from '../ratings/ratings.module'; // Добавляем

@Module({
  imports: [
    AuthModule,
    forwardRef(() => UsersModule),
    forwardRef(() => AchievementsModule),
    forwardRef(() => RatingsModule), // Добавляем
  ],
  controllers: [MatchesController],
  providers: [
    MatchesService,
    MatchesRepository,
    PrismaService,
  ],
  exports: [MatchesService],
})
export class MatchesModule {}