import { MatchesRepository } from '../../infrastructure/repositories/matches.repository';
import { UsersService } from '../../../users/application/services/users.service';
import { CreateMatchDto } from '../dto/create-match.dto';
import { RecordScoreDto } from '../dto/record-score.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { CreateFeedbackDto } from '../../presentation/dto/create-feedback.dto';
import { MatchEntity } from '../../domain/entities/match.entity';
import { AchievementsService } from '../../../achievements/application/services/achievements.service';
import { RatingsService } from '../../../ratings/ratings.service';
import { PrismaService } from '../../../../prisma/prisma.service';
export declare class MatchesService {
    private readonly matchesRepository;
    private readonly usersService;
    private readonly achievementsService;
    private readonly ratingsService;
    private readonly prisma;
    private readonly logger;
    constructor(matchesRepository: MatchesRepository, usersService: UsersService, achievementsService: AchievementsService, ratingsService: RatingsService, // Добавляем зависимость
    prisma: PrismaService);
    findAll(): Promise<MatchEntity[]>;
    findById(id: string): Promise<MatchEntity>;
    findByCreator(creatorId: string): Promise<MatchEntity[]>;
    create(userId: string, createMatchDto: CreateMatchDto): Promise<MatchEntity>;
    update(id: string, userId: string, updateMatchDto: UpdateMatchDto): Promise<MatchEntity>;
    confirmMatch(id: string, userId: string): Promise<MatchEntity>;
    cancelMatch(id: string, userId: string): Promise<MatchEntity>;
    recordScore(matchId: string, userId: string, recordScoreDto: RecordScoreDto): Promise<MatchEntity>;
    private determineWinner;
    private determineLoser;
    private updatePlayerStats;
    delete(id: string, userId: string): Promise<void>;
    /**
     * Получает последние матчи пользователя
     */
    getUserRecentMatches(userId: string, limit?: number): Promise<any[]>;
    /**
     * Получает информацию об оппоненте в матче
     */
    private getOpponentInfo;
    /**
     * Получить все матчи пользователя с фильтрацией и пагинацией
     */
    getUserMatches(userId: string, options?: {
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<any[]>;
    /**
     * Пригласить пользователя на матч
     */
    inviteToMatch(creatorId: string, targetId: string, inviteData: any): Promise<any>;
    /**
     * Вспомогательный метод для получения имени оппонента
     */
    private getOpponentName;
    /**
      * Создает отзыв о сопернике после матча
      */
    createFeedback(matchId: string, userId: string, createFeedbackDto: CreateFeedbackDto): Promise<any>;
    /**
     * Обновляет средний рейтинг игрока на основе полученных отзывов
     */
    private updatePlayerAvgRating;
    /**
     * Получает отзывы для конкретного матча
     */
    getMatchFeedbacks(matchId: string): Promise<any[]>;
    /**
     * Получает отзывы, оставленные пользователем
     */
    getUserGivenFeedbacks(userId: string, limit?: number): Promise<any[]>;
    /**
     * Получает отзывы, полученные пользователем
     */
    getUserReceivedFeedbacks(userId: string, limit?: number): Promise<any[]>;
    /**
     * Вспомогательный метод для получения отзывов с фильтрацией
     */
    private getFeedbacks;
    /**
    * Получает детальную информацию о матче (карточка матча)
    */
    getMatchDetails(matchId: string): Promise<any>;
    /**
    * Получает участников матча
    */
    private getMatchParticipants;
    /**
     * Форматирует дату матча
     */
    private formatDate;
    /**
     * Вычисляет примерную длительность матча
     */
    private calculateMatchDuration;
    /**
     * Проверяет, может ли пользователь оставить отзыв
     */
    private canLeaveFeedback;
}
