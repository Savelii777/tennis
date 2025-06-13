import { BotContext } from '../interfaces/context.interface';
import { UsersService } from '../../users/application/services/users.service';
export declare class ProfileScene {
    private readonly usersService;
    constructor(usersService: UsersService);
    enter(ctx: BotContext): Promise<void>;
    onText(ctx: BotContext): Promise<void>;
    onLevelSelect(ctx: BotContext): Promise<void>;
}
