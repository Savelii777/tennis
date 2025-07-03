import { MatchesService } from '../../application/services/matches.service';
import { CreateFeedbackDto } from '../../presentation/dto/create-feedback.dto';
export declare class MatchFeedbackController {
    private readonly matchesService;
    constructor(matchesService: MatchesService);
    createFeedback(matchId: string, createFeedbackDto: CreateFeedbackDto, req: any): Promise<any>;
    getMatchFeedbacks(matchId: string): Promise<any[]>;
    getGivenFeedbacks(req: any, limit?: number): Promise<any[]>;
    getReceivedFeedbacks(req: any, limit?: number): Promise<any[]>;
    getUserFeedbacks(userId: string, limit?: number): Promise<any[]>;
}
