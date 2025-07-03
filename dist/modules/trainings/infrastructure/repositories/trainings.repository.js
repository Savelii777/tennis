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
exports.TrainingsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let TrainingsRepository = class TrainingsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters) {
            if (filters.trainingType)
                where.trainingType = filters.trainingType;
            if (filters.status)
                where.status = filters.status;
            if (filters.minDate)
                where.dateTime = { gte: new Date(filters.minDate) };
            if (filters.maxDate) {
                where.dateTime = {
                    ...where.dateTime,
                    lte: new Date(filters.maxDate)
                };
            }
        }
        const trainings = await this.prisma.trainingSession.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profile: {
                            select: {
                                avatarUrl: true
                            }
                        }
                    }
                },
                participants: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profile: {
                            select: {
                                avatarUrl: true,
                                ratingPoints: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                dateTime: 'asc'
            }
        });
        return trainings.map(training => this.mapToEntity(training));
    }
    async findById(id) {
        const training = await this.prisma.trainingSession.findUnique({
            where: { id: parseInt(id) },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profile: {
                            select: {
                                avatarUrl: true
                            }
                        }
                    }
                },
                participants: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profile: {
                            select: {
                                avatarUrl: true,
                                ratingPoints: true
                            }
                        }
                    }
                }
            }
        });
        if (!training)
            return null;
        return this.mapToEntity(training);
    }
    async create(userId, dto) {
        // Ensure dateTime and endTime are provided as Date objects
        const trainingDateTime = dto.dateTime instanceof Date ?
            dto.dateTime :
            new Date(dto.dateTime || Date.now());
        const trainingEndTime = dto.endTime instanceof Date ?
            dto.endTime :
            new Date(dto.endTime || Date.now() + 2 * 60 * 60 * 1000); // Default: 2 hours after start
        const training = await this.prisma.trainingSession.create({
            data: {
                title: dto.title,
                description: dto.description,
                creator: {
                    connect: {
                        id: parseInt(userId)
                    }
                },
                locationName: dto.locationName,
                courtSurface: dto.courtSurface,
                minLevel: dto.minLevel,
                maxLevel: dto.maxLevel,
                maxSlots: dto.maxSlots,
                paymentType: dto.paymentType,
                pricePerPerson: dto.pricePerPerson,
                dateTime: trainingDateTime, // Use the transformed date
                endTime: trainingEndTime, // Use the transformed end date
                status: 'OPEN',
                trainingType: dto.trainingType,
                participants: {
                    connect: {
                        id: parseInt(userId)
                    }
                }
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        return this.mapToEntity(training);
    }
    async bookSlot(trainingId, userId) {
        // Добавляем участника
        await this.prisma.$executeRaw `
      INSERT INTO "_TrainingSessionToUser" ("A", "B") 
      VALUES (${parseInt(trainingId)}, ${parseInt(userId)})
      ON CONFLICT DO NOTHING
    `;
        // Обновляем количество участников
        const updatedTraining = await this.prisma.trainingSession.update({
            where: { id: parseInt(trainingId) },
            data: {
                currentSlots: {
                    increment: 1
                }
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                },
                participants: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profile: {
                            select: {
                                avatarUrl: true,
                                ratingPoints: true
                            }
                        }
                    }
                }
            }
        });
        // Если достигнут максимум слотов, обновляем статус
        if (updatedTraining.currentSlots >= updatedTraining.maxSlots) {
            await this.prisma.trainingSession.update({
                where: { id: parseInt(trainingId) },
                data: {
                    status: 'FULL'
                }
            });
        }
        return this.mapToEntity(updatedTraining);
    }
    async cancelBooking(trainingId, userId) {
        // Удаляем участника
        await this.prisma.$executeRaw `
      DELETE FROM "_TrainingSessionToUser"
      WHERE "A" = ${parseInt(trainingId)} AND "B" = ${parseInt(userId)}
    `;
        // Обновляем количество участников
        const updatedTraining = await this.prisma.trainingSession.update({
            where: { id: parseInt(trainingId) },
            data: {
                currentSlots: {
                    decrement: 1
                },
                status: 'OPEN' // Теперь точно есть место, меняем статус обратно на OPEN
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                },
                participants: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profile: {
                            select: {
                                avatarUrl: true,
                                ratingPoints: true
                            }
                        }
                    }
                }
            }
        });
        return this.mapToEntity(updatedTraining);
    }
    async isParticipant(trainingId, userId) {
        // Replace raw SQL with Prisma query builder
        const count = await this.prisma.trainingSession.count({
            where: {
                id: parseInt(trainingId),
                participants: {
                    some: {
                        id: parseInt(userId)
                    }
                }
            }
        });
        return count > 0;
    }
    // Add this method to your TrainingsRepository class
    async cancelTraining(trainingId, userId) {
        const updatedTraining = await this.prisma.trainingSession.update({
            where: { id: parseInt(trainingId) },
            data: {
                status: 'CANCELLED'
            },
            include: {
                creator: true,
                participants: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profile: { select: { avatarUrl: true, ratingPoints: true } }
                    }
                }
            }
        });
        return this.mapToEntity(updatedTraining);
    }
    mapToEntity(prismaTraining) {
        if (!prismaTraining) {
            throw new Error("Cannot map null training to entity");
        }
        return {
            id: prismaTraining.id,
            title: prismaTraining.title,
            description: prismaTraining.description,
            creatorId: prismaTraining.creatorId,
            creatorName: prismaTraining.creator ?
                `${prismaTraining.creator.firstName} ${prismaTraining.creator.lastName}`.trim() :
                undefined,
            locationName: prismaTraining.locationName,
            courtSurface: prismaTraining.courtSurface,
            minLevel: prismaTraining.minLevel,
            maxLevel: prismaTraining.maxLevel,
            maxSlots: prismaTraining.maxSlots,
            currentSlots: prismaTraining.currentSlots,
            paymentType: prismaTraining.paymentType,
            pricePerPerson: prismaTraining.pricePerPerson,
            dateTime: prismaTraining.dateTime,
            endTime: prismaTraining.endTime,
            status: prismaTraining.status,
            trainingType: prismaTraining.trainingType,
            participants: prismaTraining.participants,
            createdAt: prismaTraining.createdAt,
            updatedAt: prismaTraining.updatedAt
        };
    }
};
exports.TrainingsRepository = TrainingsRepository;
exports.TrainingsRepository = TrainingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrainingsRepository);
