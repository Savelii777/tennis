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
var BallsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BallsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const telegram_service_1 = require("../../../telegram/telegram.service");
let BallsService = BallsService_1 = class BallsService {
    constructor(prisma, telegramService) {
        this.prisma = prisma;
        this.telegramService = telegramService;
        this.logger = new common_1.Logger(BallsService_1.name);
    }
    async getBalance(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { ballsBalance: true },
        });
        return user?.ballsBalance || 0;
    }
    async addBalls(userId, amount, description) {
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
                await this.telegramService.sendMessage(user.telegramChatId.toString(), `🎾 На ваш счет начислено ${amount} мячей!\n📝 Причина: ${description}\n💰 Текущий баланс: ${user.ballsBalance} мячей`);
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error sending notification: ${errorMsg}`);
        }
        return transaction.user.ballsBalance;
    }
    async deductBalls(userId, amount, description) {
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
                await this.telegramService.sendMessage(updatedUser.telegramChatId.toString(), `🎾 С вашего счета списано ${amount} мячей.\n📝 Причина: ${description}\n💰 Текущий баланс: ${updatedUser.ballsBalance} мячей`);
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error sending notification: ${errorMsg}`);
        }
        return transaction.user.ballsBalance;
    }
    async getTransactionHistory(userId, limit = 10) {
        return this.prisma.ballTransaction.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async createTransaction(userId, amount, description, type) {
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
};
BallsService = BallsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_service_1.TelegramService])
], BallsService);
exports.BallsService = BallsService;
