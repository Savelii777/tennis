import { UserEntity } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';
import { UpdateProfileDto } from '../../presentation/dto/update-profile.dto';
import { PrismaService } from '../../../../prisma/prisma.service';
export declare class UsersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<UserEntity[]>;
    findById(id: string): Promise<UserEntity>;
    findByTelegramId(telegramId: string): Promise<UserEntity>;
    create(user: UserEntity): Promise<UserEntity>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity>;
    updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<UserEntity>;
    getRatingHistory(userId: string): Promise<any[]>;
    getUserAchievements(userId: string): Promise<Record<string, any>>;
    addAchievement(userId: string, achievementKey: string, achievementData: any): Promise<UserEntity>;
    getRecentMatches(userId: string, limit?: number): Promise<any[]>;
    updateAvatar(userId: string, avatarUrl: string): Promise<UserEntity>;
    updateMatchStats(userId: string, isWin: boolean): Promise<UserEntity>;
    updateTournamentStats(userId: string, isWin: boolean): Promise<UserEntity>;
    private mapToEntity;
}
