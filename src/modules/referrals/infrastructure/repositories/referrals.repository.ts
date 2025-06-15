import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ReferralsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        referralStats: true,
      }
    });
  }

  async findUserByReferralCode(referralCode: string) {
    return this.prisma.user.findUnique({
      where: { referralCode },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        referralCode: true,
      }
    });
  }

  async updateUserReferralCode(userId: number, referralCode: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { referralCode },
      include: {
        referralStats: true,
      }
    });
  }

  async createUserWithReferrer(userData: any) {
    return this.prisma.user.create({
      data: {
        telegramId: userData.telegram_id,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        referredBy: userData.referredBy,
        profile: {
          create: {
            avatarUrl: userData.photo_url || null,
          }
        }
      },
      include: {
        profile: true,
        referrer: {
          select: {
            id: true,
            username: true,
            firstName: true,
          }
        }
      }
    });
  }

  async createReferralActivity(data: any) {
    return this.prisma.referralActivity.create({
      data
    });
  }

  async updateReferralActivity(id: number, data: any) {
    return this.prisma.referralActivity.update({
      where: { id },
      data
    });
  }

  async findReferralActivityByUser(userId: number) {
    return this.prisma.referralActivity.findFirst({
      where: { invitedUserId: userId }
    });
  }

  async getReferralStats(userId: number) {
    return this.prisma.referralStats.findUnique({
      where: { userId }
    });
  }

  async updateReferralStats(userId: number, data: any) {
    return this.prisma.referralStats.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      }
    });
  }

  async getUserReferrals(userId: number) {
    return this.prisma.referralActivity.findMany({
      where: { referrerId: userId },
      include: {
        invitedUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });
  }

  async getReferralActivity(userId: number) {
    return this.prisma.referralActivity.findMany({
      where: { referrerId: userId },
      orderBy: { registeredAt: 'desc' }
    });
  }

  async getTopReferrers(limit: number) {
    return this.prisma.referralStats.findMany({
      take: limit,
      orderBy: { totalInvited: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
  }

  // Методы для глобальной статистики
  async getTotalUsersCount() {
    return this.prisma.user.count();
  }

  async getUsersWithReferralsCount() {
    return this.prisma.user.count({
      where: {
        referredBy: { not: null }
      }
    });
  }

  async getTotalReferralActivitiesCount() {
    return this.prisma.referralActivity.count();
  }

  async getActiveReferralsCount() {
    return this.prisma.referralActivity.count({
      where: { isActive: true }
    });
  }

  async getRegistrationsByPeriod(start: Date, end: Date) {
    return this.prisma.referralActivity.count({
      where: {
        registeredAt: {
          gte: start,
          lt: end,
        }
      }
    });
  }
}