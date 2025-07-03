import { Context, Telegraf } from 'telegraf';
import { StateService } from '../services/state.service';
import { UsersService } from '../../users/application/services/users.service';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class MessagingHandler {
    private readonly stateService;
    private readonly usersService;
    private readonly prisma;
    private readonly logger;
    constructor(stateService: StateService, usersService: UsersService, prisma: PrismaService);
    register(bot: Telegraf<Context>): void;
    /**
     * Обработка запроса на отправку сообщения другому пользователю
     */
    handleMessageRequest(ctx: Context, senderId: string, targetUserId: string): Promise<void>;
    /**
     * Обработка отправки сообщения (вызывается из текстового обработчика)
     */
    handleMessageSend(ctx: Context, messageText: string, userId: string): Promise<boolean>;
    handleCancelMessage(ctx: Context): Promise<void>;
    handleReplyMessage(ctx: Context): Promise<void>;
    handleViewProfile(ctx: Context): Promise<void>;
}
