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
exports.StoriesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const story_entity_1 = require("../../domain/entities/story.entity");
const story_status_enum_1 = require("../../domain/enums/story-status.enum");
let StoriesRepository = class StoriesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const story = await this.prisma.story.create({
            data: {
                userId: data.userId,
                telegramFileId: data.telegramFileId,
                telegramFilePath: data.telegramFilePath,
                type: data.type,
                status: story_status_enum_1.StoryStatus.PENDING,
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
    async findById(id) {
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
    async findPublic(limit = 50) {
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
        return stories.map((story) => this.mapToEntity(story));
    }
    async findByUserId(userId) {
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
        return stories.map((story) => this.mapToEntity(story));
    }
    async findPendingForModeration() {
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
        return stories.map((story) => this.mapToEntity(story));
    }
    async updateStatus(id, status) {
        const updateData = { status: status.toString() };
        if (status === story_status_enum_1.StoryStatus.APPROVED) {
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
    async updateFilePath(id, filePath) {
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
    async delete(id) {
        await this.prisma.story.delete({
            where: { id },
        });
    }
    mapToEntity(story) {
        return new story_entity_1.StoryEntity({
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
};
StoriesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoriesRepository);
exports.StoriesRepository = StoriesRepository;
