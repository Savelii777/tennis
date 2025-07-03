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
        firstName: string;
        lastName: string | null;
        sportType: string | null;
        id: number;
        telegramId: string;
        username: string;
        isVerified: boolean;
        role: import(".prisma/client").$Enums.Role;
        countryCode: string | null;
        cityId: number | null;
        sportId: number | null;
        updatedAt: Date;
        createdAt: Date;
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
        updatedAt: Date;
        createdAt: Date;
        isActive: boolean;
        referrerId: number;
        invitedUserId: number;
        registeredAt: Date;
        firstMatchAt: Date | null;
        inviteSource: string | null;
        ipAddress: string | null;
    }>;
    private generateReferralCode;
    private updateReferrerStats;
    private checkAchievements;
}
