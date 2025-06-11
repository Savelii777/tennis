import { AuthService } from '../services/auth.service';
import { TelegramLoginDto } from '../../presentation/dto/telegram-login.dto';
export declare class TelegramLoginUseCase {
    private readonly authService;
    constructor(authService: AuthService);
    execute(telegramLoginDto: TelegramLoginDto): Promise<{
        access_token: string;
    }>;
}
