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
exports.BallsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let BallsService = class BallsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async addBalls(userId, amount, type, reason // Делаем параметр опциональным
    ) {
        const user = await this.prisma.user.findUnique({
            where: { id: Number(userId) },
        });
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        const newBalance = user.ballsBalance + amount;
        // Обновляем баланс пользователя
        await this.prisma.user.update({
            where: { id: Number(userId) },
            data: { ballsBalance: newBalance },
        });
        // Записываем транзакцию
        await this.prisma.ballTransaction.create({
            data: {
                userId: Number(userId),
                amount,
                type: type,
                reason: reason || 'Добавление мячей',
                balanceAfter: newBalance,
            },
        });
    }
    async deductBalls(userId, amount, reason) {
        const userIdInt = parseInt(userId);
        // Проверяем текущий баланс
        const user = await this.prisma.user.findUnique({
            where: { id: userIdInt },
            select: { ballsBalance: true }
        });
        if (!user || user.ballsBalance < amount) {
            throw new common_1.BadRequestException('Недостаточно мячей на балансе');
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
    async getUserBalance(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { ballsBalance: true }
        });
        return user?.ballsBalance || 0;
    }
    async getBallsHistory(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        return this.prisma.ballTransaction.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });
    }
};
BallsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BallsService);
exports.BallsService = BallsService;
