import { JwtService } from '@nestjs/jwt';
import { TelegramAuthService } from '../../infrastructure/telegram/telegram-auth.service';
import { UsersService } from '../../../users/application/services/users.service';
import { TelegramLoginDto } from '../../presentation/dto/telegram-login.dto';
import { UserEntity } from '../../../users/domain/entities/user.entity';
export declare class AuthService {
    private jwtService;
    private telegramAuthService;
    private userService;
    constructor(jwtService: JwtService, telegramAuthService: TelegramAuthService, userService: UsersService);
    validateTelegramUser(telegramLoginDto: TelegramLoginDto): Promise<UserEntity>;
    generateJwt(user: UserEntity): Promise<{
        access_token: string;
    }>;
    validateUser(telegramId: string): Promise<UserEntity>;
    getProfile(userId: string): Promise<UserEntity>;
    refreshToken(userId: string): Promise<any>;
    logout(userId: string): Promise<any>;
}
