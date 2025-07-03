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
exports.CasesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let CasesRepository = class CasesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.case.create({
            data: {
                name: data.name,
                description: data.description,
                priceBalls: data.priceBalls,
                image: data.image,
                isActive: data.isActive ?? true,
            },
            include: {
                items: true,
                _count: {
                    select: {
                        openings: true,
                        winnings: true,
                    }
                }
            }
        });
    }
    async findAll(includeInactive = false) {
        return this.prisma.case.findMany({
            where: includeInactive ? {} : { isActive: true },
            include: {
                items: {
                    where: includeInactive ? {} : { isActive: true },
                    orderBy: { dropChance: 'desc' }
                },
                _count: {
                    select: {
                        openings: true,
                        winnings: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findById(id) {
        return this.prisma.case.findUnique({
            where: { id },
            include: {
                items: {
                    orderBy: { dropChance: 'desc' }
                },
                _count: {
                    select: {
                        openings: true,
                        winnings: true,
                    }
                }
            }
        });
    }
    async update(id, data) {
        return this.prisma.case.update({
            where: { id },
            data,
            include: {
                items: true,
                _count: {
                    select: {
                        openings: true,
                        winnings: true,
                    }
                }
            }
        });
    }
    async delete(id) {
        return this.prisma.case.delete({
            where: { id }
        });
    }
    async createItem(caseId, data) {
        return this.prisma.caseItem.create({
            data: {
                caseId,
                name: data.name,
                type: data.type,
                payload: data.payload,
                dropChance: data.dropChance,
                imageUrl: data.imageUrl,
                isActive: data.isActive ?? true,
            }
        });
    }
    async findItemsByCaseId(caseId, includeInactive = false) {
        return this.prisma.caseItem.findMany({
            where: {
                caseId,
                ...(includeInactive ? {} : { isActive: true })
            },
            orderBy: { dropChance: 'desc' }
        });
    }
    async findItemById(id) {
        return this.prisma.caseItem.findUnique({
            where: { id },
            include: {
                case: true
            }
        });
    }
    async updateItem(id, data) {
        return this.prisma.caseItem.update({
            where: { id },
            data
        });
    }
    async deleteItem(id) {
        return this.prisma.caseItem.delete({
            where: { id }
        });
    }
    async createOpening(data) {
        return this.prisma.caseOpening.create({
            data
        });
    }
    async createWinning(data) {
        return this.prisma.caseWinning.create({
            data,
            include: {
                item: true,
                case: true
            }
        });
    }
    async getUserOpenings(userId, page, limit) {
        const skip = (page - 1) * limit;
        return this.prisma.caseOpening.findMany({
            where: { userId },
            include: {
                case: true,
                winning: {
                    include: {
                        item: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });
    }
    async findWinningById(id) {
        return this.prisma.caseWinning.findUnique({
            where: { id },
            include: {
                item: true,
                case: true,
                user: true
            }
        });
    }
    async updateWinning(id, data) {
        return this.prisma.caseWinning.update({
            where: { id },
            data
        });
    }
    async getUserById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                ballsBalance: true
            }
        });
    }
    async getCaseStatistics(caseId) {
        const [openings, winnings, itemStats] = await Promise.all([
            this.prisma.caseOpening.count({
                where: { caseId }
            }),
            this.prisma.caseWinning.count({
                where: { caseId }
            }),
            this.prisma.caseWinning.groupBy({
                by: ['itemId'],
                where: { caseId },
                _count: {
                    itemId: true
                }
            })
        ]);
        const itemStatistics = await Promise.all(itemStats.map(async (stat) => {
            const item = await this.prisma.caseItem.findUnique({
                where: { id: stat.itemId }
            });
            return {
                item,
                winCount: stat._count.itemId,
                winRate: openings > 0 ? (stat._count.itemId / openings * 100).toFixed(2) : '0'
            };
        }));
        return {
            totalOpenings: openings,
            totalWinnings: winnings,
            itemStatistics
        };
    }
    async getAllCasesStatistics() {
        return this.prisma.case.findMany({
            include: {
                _count: {
                    select: {
                        openings: true,
                        winnings: true
                    }
                }
            }
        });
    }
    async getItemStatistics(itemId) {
        const winCount = await this.prisma.caseWinning.count({
            where: { itemId }
        });
        const item = await this.prisma.caseItem.findUnique({
            where: { id: itemId },
            include: {
                case: {
                    include: {
                        _count: {
                            select: {
                                openings: true
                            }
                        }
                    }
                }
            }
        });
        const totalOpenings = item?.case._count.openings || 0;
        const actualWinRate = totalOpenings > 0 ? (winCount / totalOpenings * 100).toFixed(2) : '0';
        return {
            item,
            winCount,
            totalOpenings,
            expectedWinRate: ((item?.dropChance || 0) * 100).toFixed(2),
            actualWinRate
        };
    }
};
exports.CasesRepository = CasesRepository;
exports.CasesRepository = CasesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CasesRepository);
