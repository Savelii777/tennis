import { Module, forwardRef } from '@nestjs/common'; // Добавляем импорт forwardRef
import { TrainingsController } from './presentation/controllers/trainings.controller';
import { TrainingsService } from './application/services/trainings.service';
import { TrainingsRepository } from './infrastructure/repositories/trainings.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module'; // Добавляем при необходимости

@Module({
  imports: [
    forwardRef(() => AuthModule), // Используем forwardRef для AuthModule
    forwardRef(() => UsersModule), // Добавляем при необходимости
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService, TrainingsRepository, PrismaService],
  exports: [TrainingsService]
})
export class TrainingsModule {}