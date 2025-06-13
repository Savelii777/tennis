import { PrismaService } from '../../../../prisma/prisma.service';
import { RequestEntity, RequestResponseEntity } from '../../domain/entities/request.entity';
import { CreateRequestDto } from '../../application/dto/create-request.dto';
import { RespondRequestDto } from '../../application/dto/respond-request.dto';
import { ResponseStatus } from '../../domain/enums/request-type.enum';
export declare class RequestsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: any): Promise<RequestEntity[]>;
    findById(id: string): Promise<RequestEntity | null>;
    create(userId: string, dto: CreateRequestDto): Promise<RequestEntity>;
    respond(requestId: string, userId: string, dto: RespondRequestDto): Promise<RequestResponseEntity>;
    updateResponseStatus(id: string, status: ResponseStatus): Promise<RequestResponseEntity>;
    private mapToEntity;
    private mapResponseToEntity;
}
