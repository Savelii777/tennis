import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CasesRepository } from '../../infrastructure/repositories/cases.repository';
import { CreateCaseItemDto, UpdateCaseItemDto } from '../../presentation/dto/case-item.dto';

@Injectable()
export class CaseItemsService {
  constructor(private readonly casesRepository: CasesRepository) {}

  async createCaseItem(caseId: number, createItemDto: CreateCaseItemDto) {
    const caseData = await this.casesRepository.findById(caseId);
    if (!caseData) {
      throw new NotFoundException(`Кейс с ID ${caseId} не найден`);
    }

    await this.validateDropChances(caseId, createItemDto.dropChance);

    return this.casesRepository.createItem(caseId, createItemDto);
  }

  async getCaseItems(caseId: number, includeInactive = false) {
    return this.casesRepository.findItemsByCaseId(caseId, includeInactive);
  }

  async updateCaseItem(itemId: number, updateItemDto: UpdateCaseItemDto) {
    const item = await this.casesRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundException(`Приз с ID ${itemId} не найден`);
    }

    if (updateItemDto.dropChance !== undefined) {
      await this.validateDropChances(item.caseId, updateItemDto.dropChance, itemId);
    }

    return this.casesRepository.updateItem(itemId, updateItemDto);
  }

  async deleteCaseItem(itemId: number) {
    const item = await this.casesRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundException(`Приз с ID ${itemId} не найден`);
    }

    return this.casesRepository.deleteItem(itemId);
  }

  async toggleItemStatus(itemId: number) {
    const item = await this.casesRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundException(`Приз с ID ${itemId} не найден`);
    }

    return this.casesRepository.updateItem(itemId, { isActive: !item.isActive });
  }

  async getItemStatistics(itemId: number) {
    return this.casesRepository.getItemStatistics(itemId);
  }

  private async validateDropChances(caseId: number, newChance: number, excludeItemId?: number) {
    const items = await this.casesRepository.findItemsByCaseId(caseId, false);
    
    const totalChance = items
      .filter(item => excludeItemId ? item.id !== excludeItemId : true)
      .reduce((sum, item) => sum + item.dropChance, 0) + newChance;

    if (totalChance > 1.0) {
      throw new BadRequestException(
        `Общая сумма шансов превышает 100%. Текущая сумма: ${(totalChance * 100).toFixed(2)}%`
      );
    }
  }
}