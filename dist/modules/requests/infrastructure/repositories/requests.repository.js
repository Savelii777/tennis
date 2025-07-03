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
exports.RequestsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const request_type_enum_1 = require("../../domain/enums/request-type.enum");
let RequestsRepository = class RequestsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters) {
            if (filters.type)
                where.type = filters.type;
            if (filters.status)
                where.status = filters.status;
            if (filters.gameMode)
                where.gameMode = filters.gameMode;
        }
        const requests = await this.prisma.gameRequest.findMany({
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
                                avatarUrl: true,
                                ratingPoints: true
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
                },
                responses: {
                    select: {
                        id: true,
                        status: true,
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profile: {
                                    select: {
                                        avatarUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                dateTime: 'asc'
            }
        });
        return requests.map(request => this.mapToEntity(request));
    }
    async findById(id) {
        const request = await this.prisma.gameRequest.findUnique({
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
                                avatarUrl: true,
                                ratingPoints: true
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
                },
                responses: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profile: {
                                    select: {
                                        avatarUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!request)
            return null;
        return this.mapToEntity(request);
    }
    // Заменить метод create (строка 140):
    async create(userId, dto) {
        const userIdInt = parseInt(userId);
        const requestData = {
            creatorId: userIdInt,
            type: dto.type,
            title: dto.title,
            description: dto.description,
            gameMode: dto.gameMode,
            dateTime: dto.dateTime,
            locationName: dto.locationName || dto.location,
            maxPlayers: dto.maxPlayers,
            status: request_type_enum_1.RequestStatus.OPEN,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        if (dto.paymentType) {
            requestData.paymentType = dto.paymentType;
        }
        if (dto.ratingType) {
            requestData.ratingType = dto.ratingType;
        }
        const request = await this.prisma.gameRequest.create({
            data: requestData,
            include: {
                creator: {
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
                },
                responses: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profile: {
                                    select: {
                                        avatarUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return this.mapToEntity(request);
    }
    async respond(requestId, userId, dto) {
        const response = await this.prisma.requestResponse.upsert({
            where: {
                requestId_userId: {
                    requestId: parseInt(requestId),
                    userId: parseInt(userId)
                }
            },
            update: {
                status: dto.status,
                message: dto.message
            },
            create: {
                request: {
                    connect: { id: parseInt(requestId) }
                },
                user: {
                    connect: { id: parseInt(userId) }
                },
                status: dto.status,
                message: dto.message
            },
            include: {
                user: {
                    select: {
                        id: true,
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
        return this.mapResponseToEntity(response);
    }
    async updateResponseStatus(id, status) {
        const response = await this.prisma.requestResponse.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });
        return this.mapResponseToEntity(response);
    }
    mapToEntity(prismaRequest) {
        if (!prismaRequest) {
            throw new common_1.NotFoundException("Request not found");
        }
        return {
            id: prismaRequest.id,
            type: prismaRequest.type,
            title: prismaRequest.title,
            description: prismaRequest.description,
            creatorId: prismaRequest.creatorId,
            creatorName: prismaRequest.creator ?
                `${prismaRequest.creator.firstName} ${prismaRequest.creator.lastName || ''}`.trim() :
                undefined,
            locationName: prismaRequest.locationName,
            maxPlayers: prismaRequest.maxPlayers,
            currentPlayers: prismaRequest.currentPlayers,
            gameMode: prismaRequest.gameMode,
            dateTime: prismaRequest.dateTime,
            paymentType: prismaRequest.paymentType,
            ratingType: prismaRequest.ratingType,
            formatInfo: prismaRequest.formatInfo,
            status: prismaRequest.status,
            participants: prismaRequest.participants,
            responses: prismaRequest.responses,
            createdAt: prismaRequest.createdAt,
            updatedAt: prismaRequest.updatedAt
        };
    }
    mapResponseToEntity(prismaResponse) {
        if (!prismaResponse) {
            throw new common_1.NotFoundException("Response not found");
        }
        return {
            id: prismaResponse.id,
            requestId: prismaResponse.requestId,
            userId: prismaResponse.userId,
            userName: prismaResponse.user?.username,
            status: prismaResponse.status,
            message: prismaResponse.message,
            createdAt: prismaResponse.createdAt,
            updatedAt: prismaResponse.updatedAt
        };
    }
};
exports.RequestsRepository = RequestsRepository;
exports.RequestsRepository = RequestsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RequestsRepository);
