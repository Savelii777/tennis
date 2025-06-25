import { UserEntity } from '../../domain/entities/user.entity';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';
import { UpdateProfileDto } from '../../presentation/dto/update-profile.dto';
import { ProfileStatisticsDto } from '../../presentation/dto/profile-statistics.dto';
import { ProfileStepOneDto } from '../../presentation/dto/profile-step-one.dto';
import { ProfileStepTwoDto } from '../../presentation/dto/profile-step-two.dto';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RatingsService } from '../../../ratings/ratings.service';
export declare class UsersService {
    private readonly usersRepository;
    private readonly prisma;
    private readonly ratingsService;
    private readonly logger;
    constructor(usersRepository: UsersRepository, prisma: PrismaService, ratingsService: RatingsService);
    findAll(): Promise<UserEntity[]>;
    findById(id: string): Promise<UserEntity>;
    updateTelegramChatId(userId: string, telegramChatId: number): Promise<void>;
    setReferrer(userId: string, referrerId: string): Promise<void>;
    findByTelegramId(telegramId: string): Promise<UserEntity | null>;
    createFromTelegram(telegramData: any): Promise<UserEntity>;
    updateLastLogin(userId: string): Promise<UserEntity>;
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
    completeProfileStepOne(userId: string, profileData: ProfileStepOneDto): Promise<any>;
    completeProfileStepTwo(userId: string, profileData: ProfileStepTwoDto): Promise<any>;
    getProfileCompletionStatus(userId: string): Promise<{
        percentage: number;
        stepOneCompleted: boolean;
        stepTwoCompleted: boolean;
    }>;
    updateUserLocation(userId: string, locationData: {
        countryCode?: string;
        cityId?: number;
        sportId?: number;
    }): Promise<UserEntity>;
    getUserWithLocation(userId: string): Promise<UserEntity | null>;
    /**
     * Получение матчей пользователя
     */
    getUserMatches(userId: string): Promise<any[]>;
    /**
     * Получить полный профиль пользователя со всеми связями
     */
    getUserFullProfile(userId: string): Promise<any>;
    /**
     * Получить публичный профиль с учетом настроек приватности
     */
    getPublicUserProfile(targetUserId: string, requesterId?: string): Promise<any>;
    /**
     * Обновить аватар пользователя
     */
    updateAvatar(userId: string, filename: string): Promise<any>;
    /**
     * Сгенерировать ссылку для шаринга профиля
     */
    generateProfileShareUrl(userId: string): Promise<string>;
    /**
     * Отправить прямое сообщение пользователю
     */
    sendDirectMessage(senderId: string, recipientId: string, message: string): Promise<any>;
    /**
     * Вспомогательный метод для визуального отображения NTRP рейтинга
     * Возвращает объект с данными для отображения NTRP рейтинга и бейджа
     */
    private getNtrpVisualRating;
    /**
     * Вспомогательный метод для расчета процента побед
     */
    private calculateWinRate;
    /**
     * Получить публичные матчи пользователя для отображения в профиле
     */
    private getPublicUserMatches;
}
