import { ReferralsRepository } from '../../infrastructure/repositories/referrals.repository';
export declare class ReferralStatsService {
    private readonly referralsRepository;
    constructor(referralsRepository: ReferralsRepository);
    /**
     * Получить общую статистику реферальной программы
     */
    getGlobalStats(): Promise<any>;
    /**
     * Получить статистику по временным периодам
     */
    private getTimeframeStats;
    /**
     * Получить достижения пользователя
     */
    getUserAchievements(userId: string): Promise<any>;
    private getAchievementDetails;
    private getNextMilestone;
}
