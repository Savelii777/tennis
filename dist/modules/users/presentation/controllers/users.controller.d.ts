import { UsersService } from '../../application/services/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ProfileStepOneDto } from '../dto/profile-step-one.dto';
import { ProfileStepTwoDto } from '../dto/profile-step-two.dto';
import { SendMessageDto } from '../../domain/dto/send-message.dto';
import { InviteToGameDto } from '../../domain/dto/invite-to-game.dto';
import { Request as ExpressRequest } from 'express';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { MatchesService } from '../../../matches/application/services/matches.service';
import { TournamentsService } from '../../../tournaments/application/services/tournaments.service';
import { StoriesService } from '../../../stories/application/services/stories.service';
interface RequestWithUser extends ExpressRequest {
    user: {
        id: string;
        username: string;
    };
}
export declare class UsersController {
    private readonly usersService;
    private readonly matchesService;
    private readonly tournamentsService;
    private readonly storiesService;
    constructor(usersService: UsersService, matchesService: MatchesService, tournamentsService: TournamentsService, storiesService: StoriesService);
    getMe(req: RequestWithUser): Promise<any>;
    getUserById(req: RequestWithUser, id: string): Promise<any>;
    updateProfile(req: RequestWithUser, updateProfileDto: UpdateProfileDto): Promise<any>;
    uploadAvatar(req: RequestWithUser, file: Express.Multer.File): Promise<any>;
    getMyMatches(req: RequestWithUser, status?: string, limit?: string, offset?: string): Promise<any>;
    getMyTournaments(req: RequestWithUser, status?: string): Promise<any>;
    getMyStories(req: RequestWithUser): Promise<any>;
    generateShareLink(req: RequestWithUser): Promise<any>;
    sendMessage(req: RequestWithUser, recipientId: string, messageDto: SendMessageDto): Promise<any>;
    inviteToGame(req: RequestWithUser, targetId: string, inviteDto: InviteToGameDto): Promise<any>;
    completeProfileStepOne(req: RequestWithUser, profileData: ProfileStepOneDto): Promise<any>;
    completeProfileStepTwo(req: RequestWithUser, profileData: ProfileStepTwoDto): Promise<any>;
    getProfileStatus(req: RequestWithUser): Promise<{
        percentage: number;
        stepOneCompleted: boolean;
        stepTwoCompleted: boolean;
    }>;
    updateMyLocation(req: RequestWithUser, updateLocationDto: UpdateLocationDto): Promise<import("../../domain/entities/user.entity").UserEntity>;
    getMyLocation(req: RequestWithUser): Promise<import("../../domain/entities/user.entity").UserEntity | null>;
}
export {};
