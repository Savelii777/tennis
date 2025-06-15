import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class BallsService {
  constructor(private readonly prisma: PrismaService) {}

  async addBalls(userId: string, amount: number, reason: string) {
    const userIdInt = parseInt(userId);
    
    // Обновляем баланс пользователя
    const user = await this.prisma.user.update({
      where: { id: userIdInt },
      data: {
        ballsBalance: {
          increment: amount
        }
      }
    });

    // Создаем запись в истории транзакций
    await this.prisma.ballTransaction.create({
      data: {
        userId: userIdInt,
        amount: amount,
        type: 'EARNED',
        reason: reason,
        balanceAfter: user.ballsBalance
      }
    });

    return user;
  }

  async deductBalls(userId: string, amount: number, reason: string) {
    const userIdInt = parseInt(userId);
    
    // Проверяем текущий баланс
    const user = await this.prisma.user.findUnique({
      where: { id: userIdInt },
      select: { ballsBalance: true }
    });

    if (!user || user.ballsBalance < amount) {
      throw new BadRequestException('Недостаточно мячей на балансе');
    }

    // Списываем мячи
    const updatedUser = await this.prisma.user.update({
      where: { id: userIdInt },
      data: {
        ballsBalance: {
          decrement: amount
        }
      }
    });

    // Создаем запись в истории транзакций
    await this.prisma.ballTransaction.create({
      data: {
        userId: userIdInt,
        amount: -amount,
        type: 'SPENT',
        reason: reason,
        balanceAfter: updatedUser.ballsBalance
      }
    });

    return updatedUser;
  }

  async getUserBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { ballsBalance: true }
    });

    return user?.ballsBalance || 0;
  }

  async getBallsHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return this.prisma.ballTransaction.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
  }
}