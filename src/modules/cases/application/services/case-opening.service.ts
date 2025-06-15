
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CasesRepository } from '../../infrastructure/repositories/cases.repository';
import { BallsService } from '../../../users/application/services/balls.service';
import { CaseItemType } from '@prisma/client';

@Injectable()
export class CaseOpeningService {
  constructor(
    private readonly casesRepository: CasesRepository,
    private readonly ballsService: BallsService,
  ) {}

  async openCase(userId: string, caseId: number) {
    const caseData = await this.casesRepository.findById(caseId);
    if (!caseData || !caseData.isActive) {
      throw new NotFoundException('Кейс не найден или неактивен');
    }

    const activeItems = caseData.items.filter(item => item.isActive);
    if (activeItems.length === 0) {
      throw new BadRequestException('В кейсе нет доступных призов');
    }

    const userIdInt = parseInt(userId);
    const user = await this.casesRepository.getUserById(userIdInt);
    if (!user || user.ballsBalance < caseData.priceBalls) {
      throw new BadRequestException('Недостаточно мячей для открытия кейса');
    }

    await this.ballsService.deductBalls(
      userId, 
      caseData.priceBalls, 
      `Открытие кейса "${caseData.name}"`
    );

    const opening = await this.casesRepository.createOpening({
      userId: userIdInt,
      caseId: caseId,
      ballsSpent: caseData.priceBalls,
    });

    const winningItem = this.selectRandomItem(activeItems);

    const winning = await this.casesRepository.createWinning({
      openingId: opening.id,
      userId: userIdInt,
      caseId: caseId,
      itemId: winningItem.id,
    });

    await this.processPrize(userId, winningItem);

    return {
      opening,
      winning: {
        ...winning,
        item: winningItem,
      },
    };
  }

  async getUserOpeningHistory(userId: string, page = 1, limit = 20) {
    return this.casesRepository.getUserOpenings(parseInt(userId), page, limit);
  }

  async getWinningById(winningId: number) {
    return this.casesRepository.findWinningById(winningId);
  }

  async markWinningAsProcessed(winningId: number, notes?: string) {
    const winning = await this.getWinningById(winningId);
    if (!winning) {
      throw new NotFoundException('Выигрыш не найден');
    }

    return this.casesRepository.updateWinning(winningId, {
      isProcessed: true,
      processedAt: new Date(),
      notes,
    });
  }

  private selectRandomItem(items: any[]) {
    const cumulativeChances: number[] = [];
    let sum = 0;
    
    for (const item of items) {
      sum += item.dropChance;
      cumulativeChances.push(sum);
    }

    const random = Math.random() * sum;

    for (let i = 0; i < cumulativeChances.length; i++) {
      if (random <= cumulativeChances[i]) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }

  private async processPrize(userId: string, item: any) {
    switch (item.type) {
      case CaseItemType.VIRTUAL:
        await this.processVirtualPrize(userId, item.payload);
        break;
      case CaseItemType.ACTION:
        await this.processActionPrize(userId, item.payload);
        break;
      case CaseItemType.PHYSICAL:
        break;
    }
  }

  private async processVirtualPrize(userId: string, payload: any) {
    if (payload.balls) {
      await this.ballsService.addBalls(
        userId,
        payload.balls,
        'Приз из кейса: теннисные мячи'
      );
    }

    if (payload.badge_id) {
      console.log(`Выдать бейдж ${payload.badge_id} пользователю ${userId}`);
    }
  }

  private async processActionPrize(userId: string, payload: any) {
    if (payload.tournament_access) {
      console.log(`Выдать бесплатный доступ к турниру пользователю ${userId}`);
    }

    if (payload.meme) {
      console.log(`Пользователь ${userId} получил мем-приз утешения`);
    }
  }
}