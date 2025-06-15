import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RequestEntity, RequestResponseEntity } from '../../domain/entities/request.entity';
import { CreateRequestDto } from '../../application/dto/create-request.dto';
import { RespondRequestDto } from '../../application/dto/respond-request.dto';
import { RequestStatus, ResponseStatus } from '../../domain/enums/request-type.enum';

@Injectable()
export class RequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: any): Promise<RequestEntity[]> {
    const where: any = {};
    
    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.gameMode) where.gameMode = filters.gameMode;
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

  async findById(id: string): Promise<RequestEntity | null> {
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

    if (!request) return null;
    return this.mapToEntity(request);
  }





  // ...existing code...

async create(userId: string, dto: CreateRequestDto): Promise<RequestEntity> {
  const userIdInt = parseInt(userId);
  
  const requestData: any = {
    creatorId: userIdInt,
    type: dto.type,
    title: dto.title,
    description: dto.description,
    gameMode: dto.gameMode,
    dateTime: dto.dateTime,
    locationName: dto.locationName || dto.location,
    maxPlayers: dto.maxPlayers,
    playerLevel: dto.playerLevel,
    status: RequestStatus.OPEN,
    formatInfo: dto.formatInfo || {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (dto.paymentType) {
    requestData.paymentType = dto.paymentType;
  }
  
  if (dto.ratingType) {
    requestData.ratingType = dto.ratingType;
  }

  // Исправить название модели - используем правильное название из schema
  const request = await this.prisma.gameRequest.create({
    data: requestData,
    include: {
      creator: true,
      responses: true,
    },
  });

  return this.mapToEntity(request);
}

// ...existing code...


async respond(requestId: string, userId: string, dto: RespondRequestDto): Promise<RequestResponseEntity> {
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

  async updateResponseStatus(id: string, status: ResponseStatus): Promise<RequestResponseEntity> {
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

  private mapToEntity(prismaRequest: any): RequestEntity {
    if (!prismaRequest) {
      throw new NotFoundException("Request not found");
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

  private mapResponseToEntity(prismaResponse: any): RequestResponseEntity {
    if (!prismaResponse) {
      throw new NotFoundException("Response not found");
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
}