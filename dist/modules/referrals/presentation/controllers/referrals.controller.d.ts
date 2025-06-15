import { ReferralsService } from '../../application/services/referrals.service';
import { ReferralStatsService } from '../../application/services/referral-stats.service';
import { Request as ExpressRequest } from 'express';
interface RequestWithUser extends ExpressRequest {
    user: {
        id: number;
        role: string;
        [key: string]: any;
    };
}
export declare class ReferralsController {
    private readonly referralsService;
    private readonly referralStatsService;
    constructor(referralsService: ReferralsService, referralStatsService: ReferralStatsService);
    generateInviteLink(req: RequestWithUser, baseUrl?: string): Promise<{
        inviteLink: string;
        message: string;
        shareText: string;
    }>;
    validateReferralCode(code: string): Promise<{
        isValid: boolean;
        message: string;
    }>;
    getMyReferralStats(req: RequestWithUser): Promise<any>;
    getMyAchievements(req: RequestWithUser): Promise<any>;
    getTopReferrers(limit?: string): Promise<any[]>;
    getGlobalStats(): Promise<any>;
    registerByReferral(registerData: any, req: ExpressRequest): Promise<{
        user: any;
        referrer: any;
        message: string;
    }>;
    markUserAsActive(userId: string): Promise<{
        message: string;
    }>;
}
export {};
