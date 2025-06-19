import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Global() // Делаем модуль глобальным
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class SharedModule {}