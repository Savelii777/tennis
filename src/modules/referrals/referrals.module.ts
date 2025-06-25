import { Module, forwardRef } from '@nestjs/common'; // Добавляем импорт forwardRef
import { ReferralsController } from './presentation/controllers/referrals.controller';
import { ReferralsService } from './application/services/referrals.service';
import { ReferralStatsService } from './application/services/referral-stats.service';
import { ReferralsRepository } from './infrastructure/repositories/referrals.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module'; // Добавляем при необходимости

@Module({
  imports: [
    forwardRef(() => AuthModule), // Оборачиваем в forwardRef
    forwardRef(() => UsersModule), // Добавляем при необходимости
  ],
  controllers: [ReferralsController],
  providers: [
    ReferralsService,
    ReferralStatsService,
    ReferralsRepository,
    PrismaService,
  ],
  exports: [ReferralsService, ReferralStatsService],
})
export class ReferralsModule {}