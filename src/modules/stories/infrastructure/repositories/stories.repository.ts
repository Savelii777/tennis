import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { StoryEntity } from '../../domain/entities/story.entity';
import { ICreateStoryData } from '../../domain/interfaces/story.interface';
import { StoryStatus } from '../../domain/enums/story-status.enum';

@Injectable()
export class StoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ICreateStoryData): Promise<StoryEntity> {
    const story = await this.prisma.story.create({
      data: {
        userId: data.userId,
        telegramFileId: data.telegramFileId,
        telegramFilePath: data.telegramFilePath,
        type: data.type,
        status: StoryStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return this.mapToEntity(story);
  }

  async findById(id: number): Promise<StoryEntity | null> {
    const story = await this.prisma.story.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return story ? this.mapToEntity(story) : null;
  }

  async findPublic(limit = 50): Promise<StoryEntity[]> {
    const stories = await this.prisma.story.findMany({
      where: {
        status: 'approved',
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return stories.map((story: any) => this.mapToEntity(story));
  }

  async findByUserId(userId: number): Promise<StoryEntity[]> {
    const stories = await this.prisma.story.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return stories.map((story: any) => this.mapToEntity(story));
  }

  async findPendingForModeration(): Promise<StoryEntity[]> {
    const stories = await this.prisma.story.findMany({
      where: {
        status: 'pending',
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return stories.map((story: any) => this.mapToEntity(story));
  }

  async updateStatus(id: number, status: StoryStatus): Promise<StoryEntity> {
    const updateData: any = { status: status.toString() };
    if (status === StoryStatus.APPROVED) {
      updateData.publishedAt = new Date();
    }

    const story = await this.prisma.story.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return this.mapToEntity(story);
  }

  async updateFilePath(id: number, filePath: string): Promise<StoryEntity> {
    const story = await this.prisma.story.update({
      where: { id },
      data: { telegramFilePath: filePath },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return this.mapToEntity(story);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.story.delete({
      where: { id },
    });
  }

  private mapToEntity(story: any): StoryEntity {
    return new StoryEntity({
      id: story.id,
      userId: story.userId,
      telegramFileId: story.telegramFileId,
      telegramFilePath: story.telegramFilePath,
      type: story.type,
      status: story.status,
      createdAt: story.createdAt,
      publishedAt: story.publishedAt,
      updatedAt: story.updatedAt,
    });
  }
}