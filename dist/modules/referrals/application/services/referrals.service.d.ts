import { ReferralsRepository } from '../../infrastructure/repositories/referrals.repository';
export declare class ReferralsService {
    private readonly referralsRepository;
    constructor(referralsRepository: ReferralsRepository);
    /**
     * Генерирует персональную реферальную ссылку для пользователя
     */
    generateInviteLink(userId: string, baseUrl: string): Promise<string>;
    /**
     * Регистрирует нового пользователя по реферальной ссылке
     */
    registerByReferral(referralCode: string, newUserData: any): Promise<any>;
    /**
     * Получить статистику рефералов пользователя
     */
    getUserReferralStats(userId: string): Promise<any>;
    /**
     * Отметить приглашенного пользователя как активного (сыграл первый матч)
     */
    markUserAsActive(userId: string): Promise<void>;
    /**
     * Получить топ рефереров
     */
    getTopReferrers(limit?: number): Promise<any[]>;
    /**
     * Валидировать реферальный код
     */
    validateReferralCode(referralCode: string): Promise<boolean>;
    private generateReferralCode;
    private updateReferrerStats;
    private checkAchievements;
}
