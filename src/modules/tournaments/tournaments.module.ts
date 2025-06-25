import { Module, forwardRef } from '@nestjs/common'; // Добавить импорт forwardRef
import { TournamentsController } from './presentation/controllers/tournaments.controller';
import { TournamentsService } from './application/services/tournaments.service';
import { TournamentsRepository } from './infrastructure/repositories/tournaments.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    forwardRef(() => UsersModule), // Использовать forwardRef
    forwardRef(() => AuthModule),  // Также для AuthModule
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService, TournamentsRepository, PrismaService],
  exports: [TournamentsService],
})
export class TournamentsModule {}