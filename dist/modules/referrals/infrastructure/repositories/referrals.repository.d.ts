import { PrismaService } from '../../../../prisma/prisma.service';
export declare class ReferralsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findUserById(id: number): Promise<(import(".prisma/client").User & {
        referralStats: import(".prisma/client").ReferralStats | null;
    }) | null>;
    findUserByReferralCode(referralCode: string): Promise<{
        id: number;
        username: string;
        firstName: string;
        lastName: string | null;
        referralCode: string | null;
    } | null>;
    updateUserReferralCode(userId: number, referralCode: string): Promise<import(".prisma/client").User & {
        referralStats: import(".prisma/client").ReferralStats | null;
    }>;
    createUserWithReferrer(userData: any): Promise<import(".prisma/client").User & {
        profile: import(".prisma/client").UserProfile | null;
        referrer: {
            id: number;
            username: string;
            firstName: string;
        } | null;
    }>;
    createReferralActivity(data: any): Promise<import(".prisma/client").ReferralActivity>;
    updateReferralActivity(id: number, data: any): Promise<import(".prisma/client").ReferralActivity>;
    findReferralActivityByUser(userId: number): Promise<import(".prisma/client").ReferralActivity | null>;
    getReferralStats(userId: number): Promise<import(".prisma/client").ReferralStats | null>;
    updateReferralStats(userId: number, data: any): Promise<import(".prisma/client").ReferralStats>;
    getUserReferrals(userId: number): Promise<(import(".prisma/client").ReferralActivity & {
        invitedUser: {
            id: number;
            username: string;
            firstName: string;
            lastName: string | null;
        };
    })[]>;
    getReferralActivity(userId: number): Promise<import(".prisma/client").ReferralActivity[]>;
    getTopReferrers(limit: number): Promise<(import(".prisma/client").ReferralStats & {
        user: {
            id: number;
            username: string;
            firstName: string;
            lastName: string | null;
        };
    })[]>;
    getTotalUsersCount(): Promise<number>;
    getUsersWithReferralsCount(): Promise<number>;
    getTotalReferralActivitiesCount(): Promise<number>;
    getActiveReferralsCount(): Promise<number>;
    getRegistrationsByPeriod(start: Date, end: Date): Promise<number>;
}
