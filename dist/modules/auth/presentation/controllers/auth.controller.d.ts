import { AuthService } from '../../application/services/auth.service';
import { TelegramLoginDto } from '../dto/telegram-login.dto';
interface RequestWithUser {
    user: {
        id: string;
    };
}
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    loginWithTelegram(telegramLoginDto: TelegramLoginDto): Promise<{
        access_token: string;
    }>;
    getProfile(request: RequestWithUser): Promise<import("../../../users/domain/entities/user.entity").UserEntity>;
    refreshToken(request: RequestWithUser): Promise<any>;
    logout(request: RequestWithUser): Promise<any>;
}
export {};
