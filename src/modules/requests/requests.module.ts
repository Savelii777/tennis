import { Module, forwardRef } from '@nestjs/common';
import { RequestsController } from './presentation/controllers/requests.controller';
import { RequestsService } from './application/services/requests.service';
import { RequestsRepository } from './infrastructure/repositories/requests.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module'; // Добавьте, если используется

@Module({
  imports: [
    forwardRef(() => AuthModule), // Добавляем forwardRef
    forwardRef(() => UsersModule), // Если этот модуль используется
  ],
  controllers: [RequestsController],
  providers: [RequestsService, RequestsRepository, PrismaService],
  exports: [RequestsService],
})
export class RequestsModule {}