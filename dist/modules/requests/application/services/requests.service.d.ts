import { RequestsRepository } from '../../infrastructure/repositories/requests.repository';
import { CreateRequestDto } from '../dto/create-request.dto';
import { RespondRequestDto } from '../dto/respond-request.dto';
import { RequestEntity, RequestResponseEntity } from '../../domain/entities/request.entity';
export declare class RequestsService {
    private readonly requestsRepository;
    constructor(requestsRepository: RequestsRepository);
    findAll(filters?: any): Promise<RequestEntity[]>;
    findById(id: string): Promise<RequestEntity>;
    create(userId: string, createRequestDto: CreateRequestDto): Promise<RequestEntity>;
    respond(requestId: string, userId: string, respondDto: RespondRequestDto): Promise<RequestResponseEntity>;
    acceptResponse(requestId: string, responseId: string, userId: string): Promise<RequestResponseEntity>;
    declineResponse(requestId: string, responseId: string, userId: string): Promise<RequestResponseEntity>;
}
