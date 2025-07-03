import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { StoryStatus, MediaType, Prisma } from '@prisma/client';

@Injectable()
export class StoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: number;
    telegramFileId: string;
    type: MediaType;
    caption?: string;
    status: StoryStatus;
  }) {
    return this.prisma.story.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        }
      }
    });
  }

  async findById(id: number) {
    return this.prisma.story.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        }
      }
    });
  }

  // Получение опубликованных историй
  async findPublic(limit = 20) {
    return this.prisma.story.findMany({
      where: { 
        status: StoryStatus.approved, // Исправлено с APPROVED на approved
        // Проверка срока действия, если поле expiresAt существует в схеме
        ...(this.hasExpiresAtField() 
          ? { 
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ] 
            } 
          : {})
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        }
      }
    });
  }

  // Получение опубликованных историй, сгруппированных по пользователям для карусели
  async findPublicGroupedByUser() {
    return this.prisma.story.findMany({
      where: { 
        status: StoryStatus.approved, // Исправлено с APPROVED на approved
        // Проверка срока действия, если поле expiresAt существует в схеме
        ...(this.hasExpiresAtField() 
          ? { 
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ] 
            } 
          : {})
      },
      orderBy: [
        { userId: 'asc' },
        { publishedAt: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        }
      }
    });
  }

  // Получение популярных историй
  async findPopular(limit = 10) {
    const orderByClause: any = {};
    
    // Проверяем наличие поля viewsCount в схеме
    if (this.hasViewsCountField()) {
      orderByClause.viewsCount = 'desc';
    }
    
    // Всегда добавляем publishedAt для стабильной сортировки
    orderByClause.publishedAt = 'desc';

    return this.prisma.story.findMany({
      where: { 
        status: StoryStatus.approved, // Исправлено с APPROVED на approved
        // Проверка срока действия, если поле expiresAt существует в схеме
        ...(this.hasExpiresAtField() 
          ? { 
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ] 
            } 
          : {})
      },
      orderBy: orderByClause,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        }
      }
    });
  }

  // Получение недавних историй
  async findRecent(limit = 10) {
    return this.prisma.story.findMany({
      where: { 
        status: StoryStatus.approved, // Исправлено с APPROVED на approved
        // Проверка срока действия, если поле expiresAt существует в схеме
        ...(this.hasExpiresAtField() 
          ? { 
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ] 
            } 
          : {})
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        }
      }
    });
  }

  // Получение историй пользователя
  async findByUserId(userId: number) {
    return this.prisma.story.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        }
      }
    });
  }

  // Получение историй на модерации
  async findPending() {
    return this.prisma.story.findMany({
      where: { status: StoryStatus.pending }, // Исправлено с PENDING на pending
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        }
      }
    });
  }

  // Обновление статуса
  async updateStatus(id: number, status: StoryStatus, publishedAt?: Date) {
    return this.prisma.story.update({
      where: { id },
      data: { 
        status,
        publishedAt: status === StoryStatus.approved ? publishedAt || new Date() : undefined // Исправлено с APPROVED на approved
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        }
      }
    });
  }

  // Обновление пути файла
  async updateFilePath(id: number, telegramFilePath: string) {
    return this.prisma.story.update({
      where: { id },
      data: { telegramFilePath }
    });
  }

  // Увеличение счетчика просмотров
  async incrementViews(id: number) {
    if (!this.hasViewsCountField()) {
      return null;
    }

    return this.prisma.story.update({
      where: { id },
      data: {
        viewsCount: {
          increment: 1
        }
      }
    });
  }

  // Проверка наличия поля viewsCount в модели Story
  private hasViewsCountField(): boolean {
    try {
      const dmmf = (this.prisma as any)._baseDmmf;
      const storyModel = dmmf.modelMap.Story;
      return storyModel && storyModel.fields.some((field: any) => field.name === 'viewsCount');
    } catch (e) {
      return false;
    }
  }

  // Проверка наличия поля expiresAt в модели Story
  private hasExpiresAtField(): boolean {
    try {
      const dmmf = (this.prisma as any)._baseDmmf;
      const storyModel = dmmf.modelMap.Story;
      return storyModel && storyModel.fields.some((field: any) => field.name === 'expiresAt');
    } catch (e) {
      return false;
    }
  }
}