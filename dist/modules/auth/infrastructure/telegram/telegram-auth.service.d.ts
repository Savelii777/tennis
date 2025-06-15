import { ConfigService } from '@nestjs/config';
import { TelegramLoginDto } from '../../presentation/dto/telegram-login.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../../users/application/services/users.service';
export declare class TelegramAuthService {
    private configService;
    private jwtService;
    private usersService;
    private readonly logger;
    constructor(configService: ConfigService, jwtService: JwtService, usersService: UsersService);
    validateTelegramSignature(userId: string, hash: string): boolean;
    authenticateUser(telegramData: TelegramLoginDto): Promise<any>;
    verifyToken(token: string): Promise<any>;
}
