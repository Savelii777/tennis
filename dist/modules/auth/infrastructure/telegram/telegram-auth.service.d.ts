import { ConfigService } from '@nestjs/config';
import { TelegramLoginDto } from '../../presentation/dto/telegram-login.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../../users/application/services/users.service';
import { User } from '../../../users/domain/entities/user.entity';
export declare class TelegramAuthService {
    private configService;
    private readonly jwtService;
    private readonly usersService;
    private readonly botToken;
    private readonly apiUrl;
    constructor(configService: ConfigService, jwtService: JwtService, usersService: UsersService);
    validateTelegramSignature(telegramId: string, hash: string): boolean;
    getUserInfo(telegramId: string): Promise<any>;
    validateUser(telegramLoginDto: TelegramLoginDto): Promise<User | null>;
    login(user: User): Promise<{
        access_token: string;
    }>;
}
