import { PrismaService } from '../../../../prisma/prisma.service';
export declare class ReferralsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findUserById(id: number): Promise<(import(".prisma/client").User & {
        referralStats: import(".prisma/client").ReferralStats | null;
    }) | null>;
    findUserByReferralCode(referralCode: string): Promise<{
        lastName: string | null;
        username: string;
        firstName: string;
        referralCode: string | null;
        id: number;
    } | null>;
    updateUserReferralCode(userId: number, referralCode: string): Promise<import(".prisma/client").User & {
        referralStats: import(".prisma/client").ReferralStats | null;
    }>;
    createUserWithReferrer(userData: any): Promise<import(".prisma/client").User & {
        profile: import(".prisma/client").UserProfile | null;
        referrer: {
            username: string;
            firstName: string;
            id: number;
        } | null;
    }>;
    createReferralActivity(data: any): Promise<import(".prisma/client").ReferralActivity>;
    updateReferralActivity(id: number, data: any): Promise<import(".prisma/client").ReferralActivity>;
    findReferralActivityByUser(userId: number): Promise<import(".prisma/client").ReferralActivity | null>;
    getReferralStats(userId: number): Promise<import(".prisma/client").ReferralStats | null>;
    updateReferralStats(userId: number, data: any): Promise<import(".prisma/client").ReferralStats>;
    getUserReferrals(userId: number): Promise<(import(".prisma/client").ReferralActivity & {
        invitedUser: {
            lastName: string | null;
            username: string;
            firstName: string;
            id: number;
        };
    })[]>;
    getReferralActivity(userId: number): Promise<import(".prisma/client").ReferralActivity[]>;
    getTopReferrers(limit: number): Promise<(import(".prisma/client").ReferralStats & {
        user: {
            lastName: string | null;
            username: string;
            firstName: string;
            id: number;
        };
    })[]>;
    getTotalUsersCount(): Promise<number>;
    getUsersWithReferralsCount(): Promise<number>;
    getTotalReferralActivitiesCount(): Promise<number>;
    getActiveReferralsCount(): Promise<number>;
    getRegistrationsByPeriod(start: Date, end: Date): Promise<number>;
}
