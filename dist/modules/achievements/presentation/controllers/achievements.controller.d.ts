import { AchievementsService } from '../../application/services/achievements.service';
interface RequestWithUser extends Request {
    user: {
        id: string;
        username: string;
    };
}
export declare class AchievementsController {
    private readonly achievementsService;
    constructor(achievementsService: AchievementsService);
    getMyAchievements(req: RequestWithUser): Promise<any[]>;
    getAllDefinitions(): Promise<import("../../application/services/achievements.service").AchievementDefinition[]>;
}
export {};
