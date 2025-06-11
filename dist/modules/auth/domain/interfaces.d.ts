export interface TelegramUser {
    id: number;
    username: string;
    first_name: string;
    auth_date: number;
    hash: string;
}
export interface AuthPayload {
    telegramId: number;
    username: string;
    firstName: string;
    role: string;
}
export interface AuthService {
    validateUser(telegramUser: TelegramUser): Promise<AuthPayload>;
    login(telegramUser: TelegramUser): Promise<string>;
    refreshToken(userId: number): Promise<string>;
}
