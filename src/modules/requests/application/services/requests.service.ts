import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { RequestsRepository } from '../../infrastructure/repositories/requests.repository';
import { CreateRequestDto } from '../dto/create-request.dto';
import { RespondRequestDto } from '../dto/respond-request.dto';
import { RequestEntity, RequestResponseEntity } from '../../domain/entities/request.entity';
import { RequestStatus, ResponseStatus } from '../../domain/enums/request-type.enum';

@Injectable()
export class RequestsService {
  constructor(private readonly requestsRepository: RequestsRepository) {}

  async findAll(filters?: any): Promise<RequestEntity[]> {
    return this.requestsRepository.findAll(filters);
  }

  async findById(id: string): Promise<RequestEntity> {
    const request = await this.requestsRepository.findById(id);
    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }
    return request;
  }

  async create(userId: string, createRequestDto: CreateRequestDto): Promise<RequestEntity> {
    return this.requestsRepository.create(userId, createRequestDto);
  }

  async respond(requestId: string, userId: string, respondDto: RespondRequestDto): Promise<RequestResponseEntity> {
    const request = await this.findById(requestId);
    
    if (request.creatorId === parseInt(userId)) {
      throw new BadRequestException('You cannot respond to your own request');
    }
    
    if (request.status !== RequestStatus.OPEN) {
      throw new BadRequestException('This request is not open for responses');
    }
    
    if (request.currentPlayers >= request.maxPlayers) {
      throw new BadRequestException('This request is already full');
    }
    
    return this.requestsRepository.respond(requestId, userId, respondDto);
  }

  async acceptResponse(requestId: string, responseId: string, userId: string): Promise<RequestResponseEntity> {
    const request = await this.findById(requestId);
    
    if (request.creatorId !== parseInt(userId)) {
      throw new ForbiddenException('Only request creator can accept responses');
    }
    
    if (request.currentPlayers >= request.maxPlayers) {
      throw new BadRequestException('This request is already full');
    }
    
    return this.requestsRepository.updateResponseStatus(responseId, ResponseStatus.ACCEPTED);
  }

  async declineResponse(requestId: string, responseId: string, userId: string): Promise<RequestResponseEntity> {
    const request = await this.findById(requestId);
    
    if (request.creatorId !== parseInt(userId)) {
      throw new ForbiddenException('Only request creator can decline responses');
    }
    
    return this.requestsRepository.updateResponseStatus(responseId, ResponseStatus.DECLINED);
  }
}