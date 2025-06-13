import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TelegramService } from '../../../telegram/telegram.service';

@Injectable()
export class BallsService {
  private readonly logger = new Logger(BallsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  async getBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { ballsBalance: true },
    });
    
    return user?.ballsBalance || 0;
  }

  async addBalls(userId: string, amount: number, description: string): Promise<number> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    
    const transaction = await this.createTransaction(userId, amount, description, 'REWARD');
    
    // Отправляем уведомление пользователю
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: { telegramChatId: true, ballsBalance: true },
      });
      
      if (user?.telegramChatId) {
        await this.telegramService.sendMessage(
          user.telegramChatId.toString(),
          `🎾 На ваш счет начислено ${amount} мячей!\n📝 Причина: ${description}\n💰 Текущий баланс: ${user.ballsBalance} мячей`
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending notification: ${errorMsg}`);
    }
    
    return transaction.user.ballsBalance;
  }

  async deductBalls(userId: string, amount: number, description: string): Promise<number> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    
    // Проверяем достаточно ли баланса
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { ballsBalance: true },
    });
    
    if (!user || user.ballsBalance < amount) {
      throw new Error('Insufficient balance');
    }
    
    const transaction = await this.createTransaction(userId, -amount, description, 'USAGE');
    
    // Отправляем уведомление пользователю
    try {
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: { telegramChatId: true, ballsBalance: true },
      });
      
      if (updatedUser?.telegramChatId) {
        await this.telegramService.sendMessage(
          updatedUser.telegramChatId.toString(),
          `🎾 С вашего счета списано ${amount} мячей.\n📝 Причина: ${description}\n💰 Текущий баланс: ${updatedUser.ballsBalance} мячей`
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending notification: ${errorMsg}`);
    }
    
    return transaction.user.ballsBalance;
  }

  async getTransactionHistory(userId: string, limit: number = 10): Promise<any[]> {
    return this.prisma.ballTransaction.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private async createTransaction(userId: string, amount: number, description: string, type: string) {
    return this.prisma.ballTransaction.create({
      data: {
        user: { connect: { id: parseInt(userId) } },
        amount,
        description,
        type,
      },
      include: {
        user: {
          select: {
            ballsBalance: true,
          },
        },
      },
    });
  }
}