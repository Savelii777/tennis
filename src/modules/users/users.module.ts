import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UsersService } from './application/services/users.service';
import { BallsService } from './application/services/balls.service';
import { UsersController } from './presentation/controllers/users.controller';
import { MediaController } from './presentation/controllers/media.controller';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UsersController, MediaController],
  providers: [UsersService, BallsService, UsersRepository, PrismaService], // ← Добавить BallsService
  exports: [UsersService, BallsService], // ← Оставить в exports
})
export class UsersModule {}