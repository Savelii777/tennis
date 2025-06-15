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
exports.CaseOpeningService = void 0;
const common_1 = require("@nestjs/common");
const cases_repository_1 = require("../../infrastructure/repositories/cases.repository");
const balls_service_1 = require("../../../users/application/services/balls.service");
const client_1 = require("@prisma/client");
let CaseOpeningService = class CaseOpeningService {
    constructor(casesRepository, ballsService) {
        this.casesRepository = casesRepository;
        this.ballsService = ballsService;
    }
    async openCase(userId, caseId) {
        // Получаем данные кейса с призами
        const caseData = await this.casesRepository.findById(caseId);
        if (!caseData || !caseData.isActive) {
            throw new common_1.NotFoundException('Кейс не найден или неактивен');
        }
        const activeItems = caseData.items.filter(item => item.isActive);
        if (activeItems.length === 0) {
            throw new common_1.BadRequestException('В кейсе нет доступных призов');
        }
        // Проверяем баланс пользователя
        const userIdInt = parseInt(userId);
        const user = await this.casesRepository.getUserById(userIdInt);
        if (!user || user.ballsBalance < caseData.priceBalls) {
            throw new common_1.BadRequestException('Недостаточно мячей для открытия кейса');
        }
        // Списываем мячи
        await this.ballsService.deductBalls(userId, caseData.priceBalls, `Открытие кейса "${caseData.name}"`);
        // Создаем запись об открытии
        const opening = await this.casesRepository.createOpening({
            userId: userIdInt,
            caseId: caseId,
            ballsSpent: caseData.priceBalls,
        });
        // Определяем выигрышный приз
        const winningItem = this.selectRandomItem(activeItems);
        // Создаем запись о выигрыше
        const winning = await this.casesRepository.createWinning({
            openingId: opening.id,
            userId: userIdInt,
            caseId: caseId,
            itemId: winningItem.id,
        });
        // Применяем приз
        await this.processPrize(userId, winningItem);
        // Возвращаем результат
        return {
            opening,
            winning: {
                ...winning,
                item: winningItem,
            },
        };
    }
    async getUserOpeningHistory(userId, page = 1, limit = 20) {
        return this.casesRepository.getUserOpenings(parseInt(userId), page, limit);
    }
    async getWinningById(winningId) {
        return this.casesRepository.findWinningById(winningId);
    }
    async markWinningAsProcessed(winningId, notes) {
        const winning = await this.getWinningById(winningId);
        if (!winning) {
            throw new common_1.NotFoundException('Выигрыш не найден');
        }
        return this.casesRepository.updateWinning(winningId, {
            isProcessed: true,
            processedAt: new Date(),
            notes,
        });
    }
    selectRandomItem(items) {
        // Создаем массив с накопительными вероятностями
        const cumulativeChances = [];
        let sum = 0;
        for (const item of items) {
            sum += item.dropChance;
            cumulativeChances.push(sum);
        }
        // Генерируем случайное число от 0 до общей суммы шансов
        const random = Math.random() * sum;
        // Находим выигрышный приз
        for (let i = 0; i < cumulativeChances.length; i++) {
            if (random <= cumulativeChances[i]) {
                return items[i];
            }
        }
        // Fallback на последний приз
        return items[items.length - 1];
    }
    async processPrize(userId, item) {
        switch (item.type) {
            case client_1.CaseItemType.VIRTUAL:
                await this.processVirtualPrize(userId, item.payload);
                break;
            case client_1.CaseItemType.ACTION:
                await this.processActionPrize(userId, item.payload);
                break;
            case client_1.CaseItemType.PHYSICAL:
                // Физические призы обрабатываются администратором вручную
                break;
        }
    }
    async processVirtualPrize(userId, payload) {
        if (payload.balls) {
            await this.ballsService.addBalls(userId, payload.balls, 'Приз из кейса: теннисные мячи');
        }
        if (payload.badge_id) {
            // TODO: Добавить логику выдачи бейджей
            console.log(`Выдать бейдж ${payload.badge_id} пользователю ${userId}`);
        }
    }
    async processActionPrize(userId, payload) {
        if (payload.tournament_access) {
            // TODO: Добавить логику бесплатного доступа к турнирам
            console.log(`Выдать бесплатный доступ к турниру пользователю ${userId}`);
        }
        if (payload.meme) {
            // Просто мем-приз, ничего не делаем
            console.log(`Пользователь ${userId} получил мем-приз утешения`);
        }
    }
};
CaseOpeningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cases_repository_1.CasesRepository,
        balls_service_1.BallsService])
], CaseOpeningService);
exports.CaseOpeningService = CaseOpeningService;
