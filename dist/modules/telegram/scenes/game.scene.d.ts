import { BotContext } from '../interfaces/context.interface';
import { RequestsService } from '../../requests/application/services/requests.service';
import { UsersService } from '../../users/application/services/users.service';
export declare class GameScene {
    private readonly requestsService;
    private readonly usersService;
    constructor(requestsService: RequestsService, usersService: UsersService);
    enter(ctx: BotContext): Promise<void>;
    onText(ctx: BotContext): Promise<void>;
    onFormatSelect(ctx: BotContext): Promise<void>;
    onPaymentSelect(ctx: BotContext): Promise<void>;
    onRatingSelect(ctx: BotContext): Promise<void>;
}
