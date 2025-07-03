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
    findUserByReferralCode(code: string): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.Role;
        firstName: string;
        lastName: string | null;
        countryCode: string | null;
        telegramId: string;
        isVerified: boolean;
        cityId: number | null;
        sportId: number | null;
        authSource: import(".prisma/client").$Enums.AuthSource;
        lastLogin: Date | null;
        ballsBalance: number;
        casesOpened: number;
        telegramChatId: bigint | null;
        referralCode: string | null;
        referredBy: number | null;
    } | null>;
    /**
     * Создание реферальной связи между пользователями
     */
    createReferral(data: {
        referrerId: any;
        referredId: any;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        referrerId: number;
        invitedUserId: number;
        registeredAt: Date;
        firstMatchAt: Date | null;
        isActive: boolean;
        inviteSource: string | null;
        ipAddress: string | null;
    }>;
    private generateReferralCode;
    private updateReferrerStats;
    private checkAchievements;
}
