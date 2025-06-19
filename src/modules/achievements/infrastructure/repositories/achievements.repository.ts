import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AchievementCode } from '../../domain/enums/achievement-codes.enum';

@Injectable()
export class AchievementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { awardedAt: 'desc' },
    });
  }

  async hasAchievement(userId: string, code: AchievementCode): Promise<boolean> {
    const achievement = await this.prisma.userAchievement.findUnique({
      where: {
        userId_code: {
          userId: parseInt(userId),
          code: code,
        },
      },
    });
    return !!achievement;
  }

  async awardAchievement(userId: string, code: AchievementCode, metadata?: any) {
    return this.prisma.userAchievement.create({
      data: {
        userId: parseInt(userId),
        code: code,
        metadata: metadata,
      },
    });
  }

  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        profile: true,
        // Используем правильные имена полей из схемы
        createdMatches: {
          where: { state: 'FINISHED' },
          orderBy: { createdAt: 'desc' },
        },
        matches: {
          where: { state: 'FINISHED' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) return null;

    // Исправляем имена полей
    const allMatches = [...(user.createdMatches || []), ...(user.matches || [])];
    
    return {
      matchesPlayed: allMatches.length,
      matchWins: user.profile?.matchWins || 0,
      tournamentsPlayed: user.profile?.tournamentsPlayed || 0,
      tournamentsWon: user.profile?.tournamentsWon || 0,
      lastActivity: user.profile?.lastActivity,
      createdAt: user.createdAt,
    };
  }

  async getWinningStreak(userId: string): Promise<number> {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          { creatorId: parseInt(userId) },
          { player1Id: parseInt(userId) },
          { player2Id: parseInt(userId) },
        ],
        state: 'FINISHED',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    let streak = 0;
    for (const match of matches) {
      // Упрощенная логика определения победы через счет
      const isWin = match.score && match.score.includes('6-') && 
                   (match.score.startsWith('6-') || match.score.includes(' 6-'));
      if (isWin) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  async getReferralsCount(userId: string): Promise<number> {
    const count = await this.prisma.user.count({
      where: { referredBy: parseInt(userId) },
    });
    return count;
  }
}