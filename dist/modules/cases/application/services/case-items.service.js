"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseItemsService = void 0;
const common_1 = require("@nestjs/common");
const cases_repository_1 = require("../../infrastructure/repositories/cases.repository");
let CaseItemsService = class CaseItemsService {
    constructor(casesRepository) {
        this.casesRepository = casesRepository;
    }
    async createCaseItem(caseId, createItemDto) {
        // Проверяем существование кейса
        const caseData = await this.casesRepository.findById(caseId);
        if (!caseData) {
            throw new common_1.NotFoundException(`Кейс с ID ${caseId} не найден`);
        }
        // Проверяем, что сумма шансов не превышает 100%
        await this.validateDropChances(caseId, createItemDto.dropChance);
        return this.casesRepository.createItem(caseId, createItemDto);
    }
    async getCaseItems(caseId, includeInactive = false) {
        return this.casesRepository.findItemsByCaseId(caseId, includeInactive);
    }
    async updateCaseItem(itemId, updateItemDto) {
        const item = await this.casesRepository.findItemById(itemId);
        if (!item) {
            throw new common_1.NotFoundException(`Приз с ID ${itemId} не найден`);
        }
        // Если изменяется шанс, проверяем валидность
        if (updateItemDto.dropChance !== undefined) {
            await this.validateDropChances(item.caseId, updateItemDto.dropChance, itemId);
        }
        return this.casesRepository.updateItem(itemId, updateItemDto);
    }
    async deleteCaseItem(itemId) {
        const item = await this.casesRepository.findItemById(itemId);
        if (!item) {
            throw new common_1.NotFoundException(`Приз с ID ${itemId} не найден`);
        }
        return this.casesRepository.deleteItem(itemId);
    }
    async toggleItemStatus(itemId) {
        const item = await this.casesRepository.findItemById(itemId);
        if (!item) {
            throw new common_1.NotFoundException(`Приз с ID ${itemId} не найден`);
        }
        return this.casesRepository.updateItem(itemId, { isActive: !item.isActive });
    }
    async getItemStatistics(itemId) {
        return this.casesRepository.getItemStatistics(itemId);
    }
    async validateDropChances(caseId, newChance, excludeItemId) {
        const items = await this.casesRepository.findItemsByCaseId(caseId, false);
        const totalChance = items
            .filter(item => excludeItemId ? item.id !== excludeItemId : true)
            .reduce((sum, item) => sum + item.dropChance, 0) + newChance;
        if (totalChance > 1.0) {
            throw new common_1.BadRequestException(`Общая сумма шансов превышает 100%. Текущая сумма: ${(totalChance * 100).toFixed(2)}%`);
        }
    }
};
CaseItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cases_repository_1.CasesRepository])
], CaseItemsService);
exports.CaseItemsService = CaseItemsService;
