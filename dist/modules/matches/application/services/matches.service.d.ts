import { MatchesRepository } from '../../infrastructure/repositories/matches.repository';
import { CreateMatchDto } from '../dto/create-match.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { RecordScoreDto } from '../dto/record-score.dto';
import { MatchEntity } from '../../domain/entities/match.entity';
export declare class MatchesService {
    private readonly matchesRepository;
    constructor(matchesRepository: MatchesRepository);
    findAll(): Promise<MatchEntity[]>;
    findById(id: string): Promise<MatchEntity>;
    findByCreator(creatorId: string): Promise<MatchEntity[]>;
    create(userId: string, createMatchDto: CreateMatchDto): Promise<MatchEntity>;
    update(id: string, userId: string, updateMatchDto: UpdateMatchDto): Promise<MatchEntity>;
    confirmMatch(id: string, userId: string): Promise<MatchEntity>;
    cancelMatch(id: string, userId: string): Promise<MatchEntity>;
    recordScore(id: string, userId: string, recordScoreDto: RecordScoreDto): Promise<MatchEntity>;
    delete(id: string, userId: string): Promise<void>;
}
