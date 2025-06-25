import { Logger } from '@nestjs/common';
import { Context } from 'telegraf';
import { UsersService } from '../../users/application/services/users.service';
import { BallsService } from '../../users/application/services/balls.service';
import { UserState } from '../interfaces/profile-state.enum';
export declare abstract class BaseBotHandler {
    protected readonly usersService: UsersService;
    protected readonly ballsService: BallsService;
    protected readonly logger: Logger;
    protected static userStates: Map<string, UserState>;
    constructor(usersService: UsersService, ballsService: BallsService);
    protected getUserState(userId: string): UserState;
    protected setUserState(userId: string, state: UserState): void;
    protected clearUserState(userId: string): void;
    protected getUser(ctx: Context): Promise<import("../../users/domain/entities/user.entity").UserEntity | null>;
}
