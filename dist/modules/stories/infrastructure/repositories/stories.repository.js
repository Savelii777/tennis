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
const client_1 = require("@prisma/client");
let StoriesRepository = class StoriesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
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
    async findById(id) {
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
                status: client_1.StoryStatus.approved, // Исправлено с APPROVED на approved
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
                status: client_1.StoryStatus.approved, // Исправлено с APPROVED на approved
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
        const orderByClause = {};
        // Проверяем наличие поля viewsCount в схеме
        if (this.hasViewsCountField()) {
            orderByClause.viewsCount = 'desc';
        }
        // Всегда добавляем publishedAt для стабильной сортировки
        orderByClause.publishedAt = 'desc';
        return this.prisma.story.findMany({
            where: {
                status: client_1.StoryStatus.approved, // Исправлено с APPROVED на approved
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
                status: client_1.StoryStatus.approved, // Исправлено с APPROVED на approved
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
    async findByUserId(userId) {
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
            where: { status: client_1.StoryStatus.pending }, // Исправлено с PENDING на pending
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
    async updateStatus(id, status, publishedAt) {
        return this.prisma.story.update({
            where: { id },
            data: {
                status,
                publishedAt: status === client_1.StoryStatus.approved ? publishedAt || new Date() : undefined // Исправлено с APPROVED на approved
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
    async updateFilePath(id, telegramFilePath) {
        return this.prisma.story.update({
            where: { id },
            data: { telegramFilePath }
        });
    }
    // Увеличение счетчика просмотров
    async incrementViews(id) {
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
    hasViewsCountField() {
        try {
            const dmmf = this.prisma._baseDmmf;
            const storyModel = dmmf.modelMap.Story;
            return storyModel && storyModel.fields.some((field) => field.name === 'viewsCount');
        }
        catch (e) {
            return false;
        }
    }
    // Проверка наличия поля expiresAt в модели Story
    hasExpiresAtField() {
        try {
            const dmmf = this.prisma._baseDmmf;
            const storyModel = dmmf.modelMap.Story;
            return storyModel && storyModel.fields.some((field) => field.name === 'expiresAt');
        }
        catch (e) {
            return false;
        }
    }
};
exports.StoriesRepository = StoriesRepository;
exports.StoriesRepository = StoriesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoriesRepository);
