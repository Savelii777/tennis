import { RequestsService } from '../../application/services/requests.service';
import { CreateRequestDto } from '../../application/dto/create-request.dto';
import { RespondRequestDto } from '../../application/dto/respond-request.dto';
import { Request } from 'express';
interface RequestWithUser extends Request {
    user: {
        id: string;
    };
}
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    findAll(type?: string, status?: string, gameMode?: string): Promise<import("../../domain/entities/request.entity").RequestEntity[]>;
    findOne(id: string): Promise<import("../../domain/entities/request.entity").RequestEntity>;
    create(createRequestDto: CreateRequestDto, req: RequestWithUser): Promise<import("../../domain/entities/request.entity").RequestEntity>;
    respond(id: string, respondDto: RespondRequestDto, req: RequestWithUser): Promise<import("../../domain/entities/request.entity").RequestResponseEntity>;
    acceptResponse(id: string, responseId: string, req: RequestWithUser): Promise<import("../../domain/entities/request.entity").RequestResponseEntity>;
    declineResponse(id: string, responseId: string, req: RequestWithUser): Promise<import("../../domain/entities/request.entity").RequestResponseEntity>;
}
export {};
