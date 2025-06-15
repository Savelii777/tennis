import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCaseDto, UpdateCaseDto } from '../../presentation/dto/case.dto';
import { CreateCaseItemDto, UpdateCaseItemDto } from '../../presentation/dto/case-item.dto';

@Injectable()
export class CasesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCaseDto) {
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

  async findById(id: number) {
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

  async update(id: number, data: UpdateCaseDto) {
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

  async delete(id: number) {
    return this.prisma.case.delete({
      where: { id }
    });
  }

  async createItem(caseId: number, data: CreateCaseItemDto) {
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

  async findItemsByCaseId(caseId: number, includeInactive = false) {
    return this.prisma.caseItem.findMany({
      where: {
        caseId,
        ...(includeInactive ? {} : { isActive: true })
      },
      orderBy: { dropChance: 'desc' }
    });
  }

  async findItemById(id: number) {
    return this.prisma.caseItem.findUnique({
      where: { id },
      include: {
        case: true
      }
    });
  }

  async updateItem(id: number, data: UpdateCaseItemDto) {
    return this.prisma.caseItem.update({
      where: { id },
      data
    });
  }

  async deleteItem(id: number) {
    return this.prisma.caseItem.delete({
      where: { id }
    });
  }

  async createOpening(data: any) {
    return this.prisma.caseOpening.create({
      data
    });
  }

  async createWinning(data: any) {
    return this.prisma.caseWinning.create({
      data,
      include: {
        item: true,
        case: true
      }
    });
  }

  async getUserOpenings(userId: number, page: number, limit: number) {
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

  async findWinningById(id: number) {
    return this.prisma.caseWinning.findUnique({
      where: { id },
      include: {
        item: true,
        case: true,
        user: true
      }
    });
  }

  async updateWinning(id: number, data: any) {
    return this.prisma.caseWinning.update({
      where: { id },
      data
    });
  }

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        ballsBalance: true
      }
    });
  }

  async getCaseStatistics(caseId: number) {
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

    const itemStatistics = await Promise.all(
      itemStats.map(async (stat) => {
        const item = await this.prisma.caseItem.findUnique({
          where: { id: stat.itemId }
        });
        return {
          item,
          winCount: stat._count.itemId,
          winRate: openings > 0 ? (stat._count.itemId / openings * 100).toFixed(2) : '0'
        };
      })
    );

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

  async getItemStatistics(itemId: number) {
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
}