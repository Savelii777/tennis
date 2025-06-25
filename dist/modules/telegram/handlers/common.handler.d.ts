import { Context, Telegraf } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
import { UsersService } from '../../users/application/services/users.service';
import { BallsService } from '../../users/application/services/balls.service';
import { NotificationsService } from '../../notifications/application/services/notifications.service';
import { TelegramService } from '../telegram.service';
import { ReferralsService } from '../../referrals/application/services/referrals.service';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class CommonHandler {
    private readonly stateService;
    private readonly keyboardService;
    private readonly usersService;
    private readonly ballsService;
    private readonly notificationsService;
    private readonly telegramService;
    private readonly referralsService;
    private readonly prisma;
    private readonly logger;
    constructor(stateService: StateService, keyboardService: KeyboardService, usersService: UsersService, ballsService: BallsService, notificationsService: NotificationsService, telegramService: TelegramService, referralsService: ReferralsService, prisma: PrismaService);
    register(bot: Telegraf<Context>): void;
    handleStart(ctx: Context): Promise<void>;
    handleMenu(ctx: Context): Promise<void>;
    handleBackToProfile(ctx: Context): Promise<void>;
    handleInviteButton(ctx: Context): Promise<void>;
    getLevelText(level: string): string;
}
