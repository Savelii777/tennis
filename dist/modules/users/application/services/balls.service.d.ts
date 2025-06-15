import { PrismaService } from '../../../../prisma/prisma.service';
export declare class BallsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    addBalls(userId: string, amount: number, reason: string): Promise<import(".prisma/client").User>;
    deductBalls(userId: string, amount: number, reason: string): Promise<import(".prisma/client").User>;
    getUserBalance(userId: string): Promise<number>;
    getBallsHistory(userId: string, page?: number, limit?: number): Promise<import(".prisma/client").BallTransaction[]>;
}
