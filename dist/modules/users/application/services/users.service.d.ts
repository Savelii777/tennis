/// <reference types="multer" />
import { UserEntity } from '../../domain/entities/user.entity';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';
import { UpdateProfileDto } from '../../presentation/dto/update-profile.dto';
import { ProfileStatisticsDto } from '../../presentation/dto/profile-statistics.dto';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    findAll(): Promise<UserEntity[]>;
    findById(id: string): Promise<UserEntity>;
    findByTelegramId(telegramId: string): Promise<UserEntity>;
    create(createUserDto: CreateUserDto): Promise<UserEntity>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity>;
    updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<UserEntity>;
    getRatingHistory(userId: string): Promise<any[]>;
    getProfileStatistics(userId: string): Promise<ProfileStatisticsDto>;
    getUserAchievements(userId: string): Promise<Record<string, any>>;
    updateMatchStats(userId: string, isWin: boolean): Promise<UserEntity>;
    updateTournamentStats(userId: string, isWin: boolean): Promise<UserEntity>;
    addAchievement(userId: string, achievementKey: string, achievementData: any): Promise<UserEntity>;
    getRecentMatches(userId: string, limit?: number): Promise<any[]>;
    updateAvatar(userId: string, file: Express.Multer.File): Promise<UserEntity>;
}
