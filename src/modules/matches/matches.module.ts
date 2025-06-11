import { Module } from '@nestjs/common';
import { MatchesController } from './presentation/controllers/matches.controller';
import { MatchesService } from './application/services/matches.service';
import { MatchesRepository } from './infrastructure/repositories/matches.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchesRepository, PrismaService],
  exports: [MatchesService],
})
export class MatchesModule {}