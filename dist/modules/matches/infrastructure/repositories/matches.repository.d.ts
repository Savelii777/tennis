import { PrismaService } from '../../../../prisma/prisma.service';
import { MatchEntity } from '../../domain/entities/match.entity';
import { CreateMatchDto } from '../../application/dto/create-match.dto';
import { UpdateMatchDto } from '../../application/dto/update-match.dto';
export declare class MatchesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<MatchEntity[]>;
    findById(id: string): Promise<MatchEntity | null>;
    findByCreator(creatorId: string): Promise<MatchEntity[]>;
    create(userId: string, createMatchDto: CreateMatchDto): Promise<MatchEntity>;
    update(id: string, updateMatchDto: UpdateMatchDto): Promise<MatchEntity>;
    delete(id: string): Promise<void>;
    private mapToEntity;
}
