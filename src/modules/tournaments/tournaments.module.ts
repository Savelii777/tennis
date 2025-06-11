import { Module } from '@nestjs/common';
import { TournamentsController } from './presentation/controllers/tournaments.controller';
import { TournamentsService } from './application/services/tournaments.service';
import { TournamentsRepository } from './infrastructure/repositories/tournaments.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    UsersModule,
    AuthModule,
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService, TournamentsRepository, PrismaService],
  exports: [TournamentsService],
})
export class TournamentsModule {}