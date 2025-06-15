import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ReferralsRepository } from '../../infrastructure/repositories/referrals.repository';
import { randomBytes } from 'crypto';

@Injectable()
export class ReferralsService {
  constructor(private readonly referralsRepository: ReferralsRepository) {}

  /**
   * Генерирует персональную реферальную ссылку для пользователя
   */
  async generateInviteLink(userId: string, baseUrl: string): Promise<string> {
    let user = await this.referralsRepository.findUserById(parseInt(userId));
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Если у пользователя еще нет реферального кода, создаем его
    if (!user.referralCode) {
      const referralCode = this.generateReferralCode();
      user = await this.referralsRepository.updateUserReferralCode(parseInt(userId), referralCode);
    }

    // Возвращаем персональную ссылку
    return `${baseUrl}/invite/${user.referralCode}`;
  }

  /**
   * Регистрирует нового пользователя по реферальной ссылке
   */
  async registerByReferral(referralCode: string, newUserData: any): Promise<any> {
    // Находим пригласившего пользователя
    const referrer = await this.referralsRepository.findUserByReferralCode(referralCode);
    
    if (!referrer) {
      throw new BadRequestException('Неверный реферальный код');
    }

    // Создаем нового пользователя с указанием реферера
    const newUser = await this.referralsRepository.createUserWithReferrer({
      ...newUserData,
      referredBy: referrer.id,
    });

    // Создаем запись об активности реферала
    await this.referralsRepository.createReferralActivity({
      referrerId: referrer.id,
      invitedUserId: newUser.id,
      registeredAt: new Date(),
      inviteSource: newUserData.source || 'direct',
      ipAddress: newUserData.ipAddress,
    });

    // Обновляем статистику реферера
    await this.updateReferrerStats(referrer.id);

    return {
      user: newUser,
      referrer: {
        id: referrer.id,
        username: referrer.username,
        firstName: referrer.firstName,
      },
    };
  }

  /**
   * Получить статистику рефералов пользователя
   */
  async getUserReferralStats(userId: string): Promise<any> {
    const userIdInt = parseInt(userId);
    
    // Получаем основную статистику
    const stats = await this.referralsRepository.getReferralStats(userIdInt);
    
    // Получаем список приглашенных пользователей
    const referrals = await this.referralsRepository.getUserReferrals(userIdInt);
    
    // Получаем активность по периодам
    const activity = await this.referralsRepository.getReferralActivity(userIdInt);

    return {
      stats: stats || {
        totalInvited: 0,
        activeInvited: 0,
        registeredToday: 0,
        registeredThisWeek: 0,
        registeredThisMonth: 0,
        achievementsEarned: [],
        bonusPointsEarned: 0,
      },
      referrals: referrals.map(ref => ({
        id: ref.invitedUser.id,
        username: ref.invitedUser.username,
        firstName: ref.invitedUser.firstName,
        registeredAt: ref.registeredAt,
        isActive: ref.isActive,
        firstMatchAt: ref.firstMatchAt,
      })),
      activity: {
        totalRegistrations: activity.length,
        activeUsers: activity.filter(a => a.isActive).length,
        recentRegistrations: activity
          .filter(a => a.registeredAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .length,
      },
    };
  }

  /**
   * Отметить приглашенного пользователя как активного (сыграл первый матч)
   */
  async markUserAsActive(userId: string): Promise<void> {
    const userIdInt = parseInt(userId);
    
    // Находим запись активности для этого пользователя
    const activity = await this.referralsRepository.findReferralActivityByUser(userIdInt);
    
    if (activity && !activity.isActive) {
      // Отмечаем как активного
      await this.referralsRepository.updateReferralActivity(activity.id, {
        isActive: true,
        firstMatchAt: new Date(),
      });

      // Обновляем статистику реферера
      await this.updateReferrerStats(activity.referrerId);
    }
  }

  /**
   * Получить топ рефереров
   */
  async getTopReferrers(limit = 10): Promise<any[]> {
    return this.referralsRepository.getTopReferrers(limit);
  }

  /**
   * Валидировать реферальный код
   */
  async validateReferralCode(referralCode: string): Promise<boolean> {
    const user = await this.referralsRepository.findUserByReferralCode(referralCode);
    return !!user;
  }

  private generateReferralCode(): string {
    // Генерируем уникальный 8-символьный код
    return randomBytes(4).toString('hex').toUpperCase();
  }

  private async updateReferrerStats(referrerId: number): Promise<void> {
    const activity = await this.referralsRepository.getReferralActivity(referrerId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      totalInvited: activity.length,
      activeInvited: activity.filter(a => a.isActive).length,
      registeredToday: activity.filter(a => a.registeredAt >= today).length,
      registeredThisWeek: activity.filter(a => a.registeredAt >= thisWeek).length,
      registeredThisMonth: activity.filter(a => a.registeredAt >= thisMonth).length,
    };

    // Проверяем достижения
    const achievements = this.checkAchievements(stats);
    
    await this.referralsRepository.updateReferralStats(referrerId, {
      ...stats,
      achievementsEarned: achievements,
    });
  }

  private checkAchievements(stats: any): string[] {
    const achievements: string[] = [];

    if (stats.totalInvited >= 1) achievements.push('FIRST_INVITE');
    if (stats.totalInvited >= 5) achievements.push('SOCIAL_BUTTERFLY');
    if (stats.totalInvited >= 10) achievements.push('COMMUNITY_BUILDER');
    if (stats.totalInvited >= 25) achievements.push('AMBASSADOR');
    if (stats.totalInvited >= 50) achievements.push('LEGEND');

    if (stats.activeInvited >= 5) achievements.push('ACTIVATOR');
    if (stats.activeInvited >= 10) achievements.push('MENTOR');

    return achievements;
  }
}