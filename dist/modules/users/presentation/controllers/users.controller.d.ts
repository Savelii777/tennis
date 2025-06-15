import { UsersService } from '../../application/services/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ProfileStepOneDto } from '../dto/profile-step-one.dto';
import { ProfileStepTwoDto } from '../dto/profile-step-two.dto';
import { Request as ExpressRequest } from 'express';
import { UpdateLocationDto } from '../../../locations/presentation/dto/update-location.dto';
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
    completeProfileStepOne(req: RequestWithUser, profileData: ProfileStepOneDto): Promise<any>;
    completeProfileStepTwo(req: RequestWithUser, profileData: ProfileStepTwoDto): Promise<any>;
    getProfileStatus(req: RequestWithUser): Promise<any>;
    updateMyLocation(req: RequestWithUser, updateLocationDto: UpdateLocationDto): Promise<import("../../domain/entities/user.entity").UserEntity>;
    getMyLocation(req: RequestWithUser): Promise<import("../../domain/entities/user.entity").UserEntity | null>;
}
export {};
