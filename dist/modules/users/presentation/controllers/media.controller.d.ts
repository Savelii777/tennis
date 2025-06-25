/// <reference types="multer" />
import { UsersService } from '../../application/services/users.service';
interface RequestWithUser extends Request {
    user: {
        id: number;
        [key: string]: any;
    };
}
export declare class MediaController {
    private readonly usersService;
    constructor(usersService: UsersService);
    uploadAvatar(req: RequestWithUser, file: Express.Multer.File): Promise<any>;
}
export {};
