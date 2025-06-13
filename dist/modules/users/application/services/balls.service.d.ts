import { PrismaService } from '../../../../prisma/prisma.service';
import { TelegramService } from '../../../telegram/telegram.service';
export declare class BallsService {
    private readonly prisma;
    private readonly telegramService;
    private readonly logger;
    constructor(prisma: PrismaService, telegramService: TelegramService);
    getBalance(userId: string): Promise<number>;
    addBalls(userId: string, amount: number, description: string): Promise<number>;
    deductBalls(userId: string, amount: number, description: string): Promise<number>;
    getTransactionHistory(userId: string, limit?: number): Promise<any[]>;
    private createTransaction;
}
