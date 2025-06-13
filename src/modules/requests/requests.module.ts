import { Module } from '@nestjs/common';
import { RequestsController } from './presentation/controllers/requests.controller';
import { RequestsService } from './application/services/requests.service';
import { RequestsRepository } from './infrastructure/repositories/requests.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module'; // Add this import

@Module({
  imports: [AuthModule], // Add this line to import AuthModule
  controllers: [RequestsController],
  providers: [RequestsService, RequestsRepository, PrismaService],
  exports: [RequestsService]
})
export class RequestsModule {}