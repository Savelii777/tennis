import { Context } from 'telegraf';
import { BaseBotHandler } from './base-bot.handler';
import { RequestsService } from '../../requests/application/services/requests.service';
export declare class GameHandler extends BaseBotHandler {
    private readonly requestsService;
    constructor(usersService: any, ballsService: any, requestsService: RequestsService);
    handlePlay(ctx: Context): Promise<void>;
    handleFindGame(ctx: Context): Promise<void>;
    handleCreateRequest(ctx: Context): Promise<void>;
    handleMyRequests(ctx: Context): Promise<void>;
    handleActiveRequests(ctx: Context): Promise<void>;
    handleBackToPlay(ctx: Context): Promise<void>;
    handleRespondToRequest(ctx: Context): Promise<void>;
    handleRequestDetails(ctx: Context): Promise<void>;
    createGameRequest(ctx: Context, userId: string, userState: any): Promise<void>;
    private getMainKeyboard;
}
