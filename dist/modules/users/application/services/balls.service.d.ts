import { PrismaService } from '../../../../prisma/prisma.service';
export declare class BallsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    addBalls(userId: string, amount: number, type: string, reason?: string): Promise<void>;
    deductBalls(userId: string, amount: number, reason: string): Promise<{
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
    }>;
    getUserBalance(userId: string): Promise<number>;
    getBallsHistory(userId: string, page?: number, limit?: number): Promise<{
        type: import(".prisma/client").$Enums.BallTransactionType;
        id: number;
        createdAt: Date;
        userId: number;
        reason: string;
        amount: number;
        balanceAfter: number;
    }[]>;
}
