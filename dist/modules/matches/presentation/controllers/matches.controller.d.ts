import { MatchesService } from '../../application/services/matches.service';
import { CreateMatchDto } from '../../application/dto/create-match.dto';
import { UpdateMatchDto } from '../../application/dto/update-match.dto';
import { RecordScoreDto } from '../../application/dto/record-score.dto';
import { MatchEntity } from '../../domain/entities/match.entity';
interface RequestWithUser extends Request {
    user: {
        id: string;
        username: string;
    };
}
export declare class MatchesController {
    private readonly matchesService;
    constructor(matchesService: MatchesService);
    findAll(): Promise<MatchEntity[]>;
    findByCreator(req: RequestWithUser): Promise<MatchEntity[]>;
    findOne(id: string): Promise<MatchEntity>;
    create(req: RequestWithUser, createMatchDto: CreateMatchDto): Promise<MatchEntity>;
    update(id: string, req: RequestWithUser, updateMatchDto: UpdateMatchDto): Promise<MatchEntity>;
    confirmMatch(id: string, req: RequestWithUser): Promise<MatchEntity>;
    recordScore(id: string, req: RequestWithUser, recordScoreDto: RecordScoreDto): Promise<MatchEntity>;
    cancelMatch(id: string, req: RequestWithUser): Promise<MatchEntity>;
    delete(id: string, req: RequestWithUser): Promise<void>;
}
export {};
