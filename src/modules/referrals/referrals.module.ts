import { Module } from '@nestjs/common';
import { ReferralsController } from './presentation/controllers/referrals.controller';
import { ReferralsService } from './application/services/referrals.service';
import { ReferralStatsService } from './application/services/referral-stats.service';
import { ReferralsRepository } from './infrastructure/repositories/referrals.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
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