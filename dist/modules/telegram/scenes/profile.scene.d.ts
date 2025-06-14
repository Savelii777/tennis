import { BotContext } from '../interfaces/context.interface';
import { UsersService } from '../../users/application/services/users.service';
export declare class ProfileScene {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    onSceneEnter(ctx: BotContext): Promise<void>;
    onText(ctx: BotContext): Promise<void>;
    private handleFirstName;
    private handleLastName;
    private handleCity;
    private handlePreferredCourt;
    onHandSelect(ctx: BotContext): Promise<void>;
    onFrequencySelect(ctx: BotContext): Promise<void>;
    onTournamentsSelect(ctx: BotContext): Promise<void>;
    onLevelSelect(ctx: BotContext): Promise<void>;
    private saveProfile;
    private getFrequencyText;
    private getLevelText;
    onUnhandledCallback(ctx: BotContext): Promise<void>;
}
