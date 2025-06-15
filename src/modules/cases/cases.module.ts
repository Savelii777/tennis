import { Module } from '@nestjs/common';
import { CasesController } from './presentation/controllers/cases.controller';
import { AdminCasesController } from './presentation/controllers/admin-cases.controller';
import { CasesService } from './application/services/cases.service';
import { CaseItemsService } from './application/services/case-items.service';
import { CaseOpeningService } from './application/services/case-opening.service';
import { CasesRepository } from './infrastructure/repositories/cases.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module'; // ← Добавить импорт

@Module({
  imports: [
    UsersModule, 
    AuthModule  // ← Добавить AuthModule для доступа к JwtService и AuthGuard
  ],
  controllers: [CasesController, AdminCasesController],
  providers: [
    CasesService,
    CaseItemsService, 
    CaseOpeningService,
    CasesRepository,
    PrismaService,
  ],
  exports: [CasesService, CaseOpeningService],
})
export class CasesModule {}