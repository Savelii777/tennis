import { AchievementDefinition, AchievementCategory } from '../../domain/interfaces/achievement.interface';
import { AchievementCode } from '../../domain/enums/achievement-codes.enum';
export declare class AchievementDefinitionsService {
    private readonly definitions;
    constructor();
    private initializeDefinitions;
    getDefinition(code: AchievementCode): AchievementDefinition | undefined;
    getAllDefinitions(): AchievementDefinition[];
    getDefinitionsByCategory(category: AchievementCategory): AchievementDefinition[];
}
