import { Module } from '@nestjs/common';
import { TrainingsController } from './presentation/controllers/trainings.controller';
import { TrainingsService } from './application/services/trainings.service';
import { TrainingsRepository } from './infrastructure/repositories/trainings.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module'; // Add this import

@Module({
  imports: [AuthModule], // Add this line to import AuthModule
  controllers: [TrainingsController],
  providers: [TrainingsService, TrainingsRepository, PrismaService],
  exports: [TrainingsService]
})
export class TrainingsModule {}