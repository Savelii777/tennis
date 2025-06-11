import { UsersService } from '../../application/services/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { Request as ExpressRequest } from 'express';
interface RequestWithUser extends ExpressRequest {
    user: {
        id: number;
        role: string;
        [key: string]: any;
    };
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: RequestWithUser): Promise<any>;
    updateProfile(req: RequestWithUser, updateProfileDto: UpdateProfileDto): Promise<any>;
    getMyStatistics(req: RequestWithUser): Promise<any>;
    getMyAchievements(req: RequestWithUser): Promise<any>;
    getMyRatingHistory(req: RequestWithUser): Promise<any>;
    getUserById(req: RequestWithUser, id: string): Promise<any>;
    getUserStatistics(req: RequestWithUser, id: string): Promise<any>;
    inviteToMatch(req: RequestWithUser, id: string): Promise<any>;
    getAllUsers(): Promise<any>;
}
export {};
