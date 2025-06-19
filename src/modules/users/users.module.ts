import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UsersService } from './application/services/users.service';
import { BallsService } from './application/services/balls.service';
import { UsersController } from './presentation/controllers/users.controller';
import { MediaController } from './presentation/controllers/media.controller';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { RatingsModule } from '../ratings/ratings.module'; // Добавляем импорт

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => RatingsModule), // Добавляем циклический импорт
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UsersController, MediaController],
  providers: [UsersService, BallsService, UsersRepository, PrismaService],
  exports: [UsersService, BallsService],
})
export class UsersModule {}