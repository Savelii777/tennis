export declare class AuthEntity {
    id: number;
    telegramId: string;
    username: string;
    firstName: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    constructor(partial: Partial<AuthEntity>);
}
