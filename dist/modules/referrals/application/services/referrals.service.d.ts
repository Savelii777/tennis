import { ReferralsRepository } from '../../infrastructure/repositories/referrals.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
export declare class ReferralsService {
    private readonly referralsRepository;
    private readonly prisma;
    constructor(referralsRepository: ReferralsRepository, prisma: PrismaService);
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
    /**
     * Поиск пользователя по реферальному коду
     */
    findUserByReferralCode(code: string): Promise<import(".prisma/client").User | null>;
    /**
     * Создание реферальной связи между пользователями
     */
    createReferral(data: {
        referrerId: any;
        referredId: any;
    }): Promise<import(".prisma/client").ReferralActivity>;
    private generateReferralCode;
    private updateReferrerStats;
    private checkAchievements;
}
