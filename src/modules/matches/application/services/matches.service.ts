import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { MatchesRepository } from '../../infrastructure/repositories/matches.repository';
import { UsersService } from '../../../users/application/services/users.service';
import { CreateMatchDto } from '../dto/create-match.dto';
import { RecordScoreDto } from '../dto/record-score.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { CreateFeedbackDto } from '../../presentation/dto/create-feedback.dto'; // Добавляем импорт
import { MatchEntity } from '../../domain/entities/match.entity';
import { MatchState, MatchType } from '../../domain/enums/match.enum';
import { AchievementsService } from '../../../achievements/application/services/achievements.service';
import { RatingsService } from '../../../ratings/ratings.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Match, Prisma } from '@prisma/client'; // Импортируем типы из Prisma


@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    private readonly matchesRepository: MatchesRepository,
    private readonly usersService: UsersService,
    private readonly achievementsService: AchievementsService,
    private readonly ratingsService: RatingsService, // Добавляем зависимость
    private readonly prisma: PrismaService, // Добавляем prisma сервис
  ) {}

  async findAll(): Promise<MatchEntity[]> {
    return this.matchesRepository.findAll();
  }

  async findById(id: string): Promise<MatchEntity> {
    const match = await this.matchesRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return match;
  }

  async findByCreator(creatorId: string): Promise<MatchEntity[]> {
    return this.matchesRepository.findByCreator(creatorId);
  }

  async create(userId: string, createMatchDto: CreateMatchDto): Promise<MatchEntity> {
    this.logger.log(`Creating match for creator: ${userId}`);

    const creator = await this.usersService.findById(userId);
    if (!creator) {
      throw new NotFoundException('Создатель матча не найден');
    }

    const match = await this.matchesRepository.create(userId, createMatchDto);

    // Безопасно проверяем достижения - исправлено
    try {
      await this.achievementsService.checkAndAwardAchievements(
        userId,
        'match_played'
      );
    } catch (achievementError) {
      this.logger.error(`Failed to check achievements for match creation by user ${userId}:`, achievementError);
    }

    return match;
  }

  async update(id: string, userId: string, updateMatchDto: UpdateMatchDto): Promise<MatchEntity> {
    const match = await this.matchesRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    
    if (match.creatorId !== parseInt(userId)) {
      throw new BadRequestException('You can only update matches you created');
    }
    
    return this.matchesRepository.update(id, updateMatchDto);
  }

  async confirmMatch(id: string, userId: string): Promise<MatchEntity> {
    const match = await this.matchesRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    
    if (match.state !== MatchState.PENDING) {
      throw new BadRequestException('Only pending matches can be confirmed');
    }
    
    const updateDto: UpdateMatchDto = { state: MatchState.CONFIRMED };
    return this.matchesRepository.update(id, updateDto);
  }

  async cancelMatch(id: string, userId: string): Promise<MatchEntity> {
    const match = await this.matchesRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    
    if (match.creatorId !== parseInt(userId) && 
        match.player1Id !== parseInt(userId) && 
        match.player2Id !== parseInt(userId)) {
      throw new BadRequestException('You are not a participant in this match');
    }
    
    if (match.state === MatchState.FINISHED) {
      throw new BadRequestException('Finished matches cannot be cancelled');
    }
    
    const updateDto: UpdateMatchDto = { state: MatchState.CANCELLED };
    return this.matchesRepository.update(id, updateDto);
  }

  async recordScore(matchId: string, userId: string, recordScoreDto: RecordScoreDto): Promise<MatchEntity> {
    this.logger.log(`Recording score for match ${matchId} by user ${userId}`);

    const match = await this.matchesRepository.findById(matchId);
    if (!match) {
      throw new NotFoundException('Матч не найден');
    }

    if (match.state !== MatchState.CONFIRMED) {
      throw new BadRequestException('Результат можно записать только для подтвержденного матча');
    }

    const canRecord = match.creatorId === parseInt(userId) || 
                     match.player1Id === parseInt(userId) || 
                     match.player2Id === parseInt(userId);

    if (!canRecord) {
      throw new ForbiddenException('Вы не можете записать результат этого матча');
    }

    // Обновляем матч через существующий метод
    const updateDto: UpdateMatchDto = { 
      score: recordScoreDto.score,
      state: MatchState.FINISHED
    };
    const updatedMatch = await this.matchesRepository.update(matchId, updateDto);

    // Определяем победителя и проигравшего
    const winnerId = this.determineWinner(recordScoreDto.score, updatedMatch);
    const loserId = this.determineLoser(winnerId, updatedMatch);

    if (winnerId && loserId) {
      // Обновляем рейтинги игроков
      try {
        const ratingResult = await this.ratingsService.recalculateAfterMatch({
          winnerId,
          loserId,
          matchId: parseInt(matchId),
          score: recordScoreDto.score,
          isRanked: true, // Можно сделать настраиваемым
        });

        this.logger.log(`Rating updated: Winner ${winnerId} (+${ratingResult.winner.skillPointsChange} skill, +${ratingResult.winner.pointsRatingChange} points)`);
        this.logger.log(`Rating updated: Loser ${loserId} (${ratingResult.loser.skillPointsChange} skill, +${ratingResult.loser.pointsRatingChange} points)`);

      } catch (error) {
        this.logger.error(`Failed to update ratings for match ${matchId}:`, error);
        // Не прерываем процесс записи результата из-за ошибки рейтинга
      }
    }

    // Обновляем статистику игроков
    await this.updatePlayerStats(updatedMatch, recordScoreDto);

    // Безопасно проверяем достижения
    try {
      if (winnerId) {
        await this.achievementsService.checkAndAwardAchievements(
          winnerId.toString(),
          'match_won'
        );
      }

      // Проверяем достижения для всех участников
      const playerIds = [updatedMatch.creatorId, updatedMatch.player1Id, updatedMatch.player2Id]
        .filter(id => id !== null && id !== undefined)
        .map(id => id!.toString());

      for (const playerId of playerIds) {
        await this.achievementsService.checkAndAwardAchievements(
          playerId,
          'match_played'
        );
      }

    } catch (achievementError) {
      this.logger.error(`Failed to check achievements for match result ${matchId}:`, achievementError);
    }

    return updatedMatch;
  }

  private determineWinner(score: string, match: MatchEntity): number | null {
    // Улучшенная логика определения победителя по счету
    if (!score) return null;

    // Парсим счет вида "6-4 6-2" или "6-4, 6-2"
    const sets = score.split(/[,\s]+/).filter(set => set.includes('-'));
    
    let player1Sets = 0;
    let player2Sets = 0;

    for (const set of sets) {
      const [games1, games2] = set.split('-').map(g => parseInt(g.trim()));
      if (games1 > games2) {
        player1Sets++;
      } else if (games2 > games1) {
        player2Sets++;
      }
    }

    // Определяем победителя (тот, кто выиграл больше сетов)
    if (player1Sets > player2Sets) {
      return match.player1Id ?? match.creatorId;
    } else if (player2Sets > player1Sets) {
      return match.player2Id ?? (match.player1Id === match.creatorId ? null : match.creatorId);
    }

    return null; // Ничья или не удалось определить
  }

  private determineLoser(winnerId: number | null, match: MatchEntity): number | null {
    if (!winnerId) return null;

    const allPlayers = [match.creatorId, match.player1Id, match.player2Id]
      .filter(id => id !== null && id !== undefined);

    return allPlayers.find(id => id !== winnerId) || null;
  }

  private async updatePlayerStats(match: MatchEntity, result: RecordScoreDto) {
    try {
      const playerIds = [match.creatorId, match.player1Id, match.player2Id]
        .filter(id => id !== null && id !== undefined);

      for (const playerId of playerIds) {
        if (playerId) {
          // Упрощенная логика - можно улучшить
          const isWinner = result.score.includes('6-');
          await this.usersService.updateMatchStats(playerId.toString(), isWinner);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update player stats for match ${match.id}:`, error);
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const match = await this.matchesRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    
    if (match.creatorId !== parseInt(userId)) {
      throw new BadRequestException('Only match creator can delete matches');
    }
    
    return this.matchesRepository.delete(id);
  }

  /**
   * Получает последние матчи пользователя
   */
  async getUserRecentMatches(userId: string, limit: number = 5): Promise<any[]> {
    const userIdInt = parseInt(userId);
    
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          { creatorId: userIdInt },
          { player1Id: userIdInt },
          { player2Id: userIdInt }
        ],
        state: { in: [MatchState.FINISHED, MatchState.CONFIRMED] }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        winner: true, // Используем связь с User для winnerId
        // Проверяем наличие отзывов для этого матча от этого пользователя
        // Это поле мы добавим после обновления схемы
      }
    });

    return await Promise.all(matches.map(async (match) => {
      const opponentInfo = await this.getOpponentInfo(match, userIdInt);
      // Проверяем наличие отзывов через отдельный запрос
      const feedbacks = await this.prisma.matchFeedback.findMany({
        where: {
          matchId: match.id,
          reviewerId: userIdInt
        }
      });
      const hasLeaveFeedback = feedbacks.length > 0;
      
      return {
        id: match.id,
        date: match.matchDate || match.createdAt,
        formattedDate: this.formatDate(match.matchDate || match.createdAt),
        score: match.score,
        state: match.state,
        result: match.winnerId === userIdInt ? 'WIN' : (match.state === MatchState.FINISHED ? 'LOSS' : 'PENDING'),
        opponent: opponentInfo,
        // Если нет location в модели Match, используем альтернативный способ определения места
        locationName: match.locationName || 'Не указан', // Заменяем на правильное имя поля
        detailsUrl: `/matches/${match.id}/details`,
        canLeaveFeedback: match.state === MatchState.FINISHED && !hasLeaveFeedback,
        hasLeaveFeedback: hasLeaveFeedback
      };
    }));
  }
  
  /**
   * Получает информацию об оппоненте в матче
   */
  private async getOpponentInfo(match: any, userId: number): Promise<any> {
    let opponentId: number | null = null;
    
    if (match.creatorId === userId && match.player1Id) {
      opponentId = match.player1Id;
    } else if (match.creatorId === userId && match.player2Id) {
      opponentId = match.player2Id;
    } else if (match.player1Id === userId && match.player2Id) {
      opponentId = match.player2Id;
    } else if (match.player2Id === userId && match.player1Id) {
      opponentId = match.player1Id;
    } else if (match.player1Id === userId || match.player2Id === userId) {
      opponentId = match.creatorId;
    }
      if (!opponentId) {
      return { name: 'Неизвестно' };
    }
    
    // Получаем данные об оппоненте
    const opponent = await this.prisma.user.findUnique({
      where: { id: opponentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        profile: {
          select: {
            avatarUrl: true,
            ntrpRating: true,
            city: true
          }
        }
      }
    });
    
    if (!opponent) {
      return { name: 'Неизвестно' };
    }
        return {
      id: opponent.id,
      name: `${opponent.firstName} ${opponent.lastName || ''}`.trim(),
      username: opponent.username,
      avatar: opponent.profile?.avatarUrl,
      rating: opponent.profile?.ntrpRating,
      city: opponent.profile?.city
    };
  }
    
/**
 * Получить все матчи пользователя с фильтрацией и пагинацией
 */
async getUserMatches(
  userId: string, 
  options: { status?: string, limit?: number, offset?: number } = {}
): Promise<any[]> {
  const userIdInt = parseInt(userId);
  const { status, limit = 20, offset = 0 } = options;
  
  // Построение фильтра состояния
  let stateFilter: any = {};
  if (status) {
    stateFilter = { state: status };
  }
  
  const matches = await this.prisma.match.findMany({
    where: {
      OR: [
        { creatorId: userIdInt },
        { player1Id: userIdInt },
        { player2Id: userIdInt }
      ],
      ...stateFilter
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, username: true }
      }
    }
  });
  
return matches.map((match: any) => {
  return {
    id: match.id,
    date: match.matchDate || match.createdAt,
    score: match.score,
    state: match.state,
    result: match.winnerId === userIdInt ? 'WIN' : match.state === MatchState.FINISHED ? 'LOSS' : 'PENDING',
    opponentName: this.getOpponentName(match, userIdInt)
  };
});
}

/**
 * Пригласить пользователя на матч
 */
async inviteToMatch(
  creatorId: string,
  targetId: string,
  inviteData: any
): Promise<any> {
  const creator = await this.usersService.findById(creatorId);
  if (!creator) {
    throw new NotFoundException('Создатель матча не найден');
  }
  
  const target = await this.usersService.findById(targetId);
  if (!target) {
    throw new NotFoundException('Приглашаемый игрок не найден');
  }
  
  // Создаём новый матч с приглашением
  const match = await this.matchesRepository.create(creatorId, {
    type: MatchType.ONE_ON_ONE, // Добавляем обязательное поле type
    player1Id: parseInt(creatorId),
    player2Id: parseInt(targetId),
    location: inviteData.location,
    matchDate: inviteData.dateTime,
    description: inviteData.comment || 'Приглашение на матч',
    state: MatchState.PENDING
  });
  
  // Отправляем уведомление пользователю (можно добавить)
  
  return match;
}

/**
 * Вспомогательный метод для получения имени оппонента
 */
private getOpponentName(match: any, userId: number): string {
  let opponentId: number | null = null;
  
  if (match.creatorId === userId && match.player1Id) {
    opponentId = match.player1Id;
  } else if (match.creatorId === userId && match.player2Id) {
    opponentId = match.player2Id;
  } else if (match.player1Id === userId && match.player2Id) {
    opponentId = match.player2Id;
  } else if (match.player2Id === userId && match.player1Id) {
    opponentId = match.player1Id;
  } else if (match.player1Id === userId || match.player2Id === userId) {
    opponentId = match.creatorId;
  }
  
  // Находим имя оппонента (если есть)
  if (opponentId && opponentId === match.creatorId && match.creator) {
    return `${match.creator.firstName} ${match.creator.lastName || ''}`.trim();
  }
  
  // Для случаев, где данных недостаточно
  return 'Неизвестный игрок';
}


 /**
   * Создает отзыв о сопернике после матча
   */
  async createFeedback(
    matchId: string, 
    userId: string, 
    createFeedbackDto: CreateFeedbackDto
  ): Promise<any> {
    this.logger.log(`Creating feedback for match ${matchId} by user ${userId}`);
    
    const match = await this.prisma.match.findUnique({
      where: { id: parseInt(matchId) }
    });
    
    if (!match) {
      throw new NotFoundException(`Матч с ID ${matchId} не найден`);
    }
    
    if (match.state !== MatchState.FINISHED) {
      throw new BadRequestException('Отзывы можно оставлять только после завершения матча');
    }
    
    // Проверяем, что пользователь участвовал в матче
    const userIdInt = parseInt(userId);
    const isParticipant = 
      match.creatorId === userIdInt || 
      match.player1Id === userIdInt || 
      match.player2Id === userIdInt;
  if (!isParticipant) {
      throw new ForbiddenException('Вы не можете оставлять отзывы на матчи, в которых не участвовали');
    }
    
    // Проверяем, что оппонент также участвовал в матче
    const revieweeId = createFeedbackDto.revieweeId;
    const isOpponentParticipant = 
      match.creatorId === revieweeId || 
      match.player1Id === revieweeId || 
      match.player2Id === revieweeId;
    
    if (!isOpponentParticipant) {
      throw new BadRequestException('Указанный пользователь не участвовал в данном матче');
    }
    
    // Проверяем, не оставлялся ли уже отзыв
    const existingFeedback = await this.prisma.matchFeedback.findFirst({
      where: {
        matchId: parseInt(matchId),
        reviewerId: userIdInt,
        revieweeId: createFeedbackDto.revieweeId
      }
    });
    
    if (existingFeedback) {
      throw new BadRequestException('Вы уже оставляли отзыв этому игроку в данном матче');
    }
    // Создаем отзыв
    const feedback = await this.prisma.matchFeedback.create({
      data: {
        matchId: parseInt(matchId),
        reviewerId: userIdInt,
        revieweeId: createFeedbackDto.revieweeId,
        rating: createFeedbackDto.rating,
        comment: createFeedbackDto.comment,
        isPublic: createFeedbackDto.isPublic ?? true
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    });
       // Обновляем средний рейтинг игрока в его профиле
    await this.updatePlayerAvgRating(createFeedbackDto.revieweeId);
    
    return feedback;
  }

  /**
   * Обновляет средний рейтинг игрока на основе полученных отзывов
   */
  private async updatePlayerAvgRating(userId: number): Promise<void> {
    const feedbacks = await this.prisma.matchFeedback.findMany({
      where: {
        revieweeId: userId
      }
    });
    
    if (feedbacks.length === 0) return;
    
    const totalRating = feedbacks.reduce((sum: number, feedback: any) => sum + feedback.rating, 0);
    const avgRating = totalRating / feedbacks.length;
    
    await this.prisma.userProfile.update({
      where: { userId },
      data: { 
        // Используем правильное поле вместо playerRating
        ntrpRating: avgRating // или другое подходящее поле для хранения рейтинга
      }
    });
  }


  /**
   * Получает отзывы для конкретного матча
   */
  async getMatchFeedbacks(matchId: string): Promise<any[]> {
    const feedbacks = await this.prisma.matchFeedback.findMany({
      where: {
        matchId: parseInt(matchId),
        isPublic: true
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
                  }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return feedbacks.map((feedback: any) => ({
      id: feedback.id,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.createdAt,
      reviewer: {
        id: feedback.reviewer.id,
        name: `${feedback.reviewer.firstName} ${feedback.reviewer.lastName || ''}`.trim(),
        username: feedback.reviewer.username,
        avatar: feedback.reviewer.profile?.avatarUrl
      },
      reviewee: {
        id: feedback.reviewee.id,
        name: `${feedback.reviewee.firstName} ${feedback.reviewee.lastName || ''}`.trim(),
        username: feedback.reviewee.username
      }
    }));
  }

  /**
   * Получает отзывы, оставленные пользователем
   */
  async getUserGivenFeedbacks(userId: string, limit: number = 10): Promise<any[]> {
    return this.getFeedbacks({ reviewerId: parseInt(userId) }, limit);
  }

  /**
   * Получает отзывы, полученные пользователем
   */
  async getUserReceivedFeedbacks(userId: string, limit: number = 10): Promise<any[]> {
    return this.getFeedbacks({ revieweeId: parseInt(userId) }, limit);
  }
  /**
   * Вспомогательный метод для получения отзывов с фильтрацией
   */
  private async getFeedbacks(filter: any, limit: number): Promise<any[]> {
    const feedbacks = await this.prisma.matchFeedback.findMany({
      where: {
        ...filter,
        isPublic: true
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        },
              match: {
          select: {
            id: true,
            score: true,
            matchDate: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    return feedbacks.map((feedback: any) => ({
      id: feedback.id,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.createdAt,
      match: {
        id: feedback.match.id,
        score: feedback.match.score,
        date: feedback.match.matchDate || feedback.match.createdAt
      },
      reviewer: {
        id: feedback.reviewer.id,
        name: `${feedback.reviewer.firstName} ${feedback.reviewer.lastName || ''}`.trim(),
        username: feedback.reviewer.username,
        avatar: feedback.reviewer.profile?.avatarUrl
      },
      reviewee: {
        id: feedback.reviewee.id,
        name: `${feedback.reviewee.firstName} ${feedback.reviewee.lastName || ''}`.trim(),
        username: feedback.reviewee.username
              }
    }));
  }

   /**
   * Получает детальную информацию о матче (карточка матча)
   */
  async getMatchDetails(matchId: string): Promise<any> {
    const match = await this.prisma.match.findUnique({
      where: { id: parseInt(matchId) },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            
            profile: {
              select: {
                
                avatarUrl: true,
                ntrpRating: true,
                city: true,
                preferredCourt: true
              }
            }
          }
        },
        // Прямая связь с winner через winnerId
        // Если winnerId - это внешний ключ на User, используем правильное отношение
        // Если winnerId просто число, получаем пользователя отдельно
        // Получим информацию о рейтингах через отдельный запрос
      }
    });
  if (!match) {
      throw new NotFoundException(`Матч с ID ${matchId} не найден`);
    }

    // Получаем информацию об игроках
    const participants = await this.getMatchParticipants(match);

    // Получаем отзывы о матче
    const feedbacks = await this.getMatchFeedbacks(matchId);

    // Собираем историю рейтинга через отдельный запрос
    const ratingHistory = await this.prisma.ratingHistory.findMany({
      where: { matchId: parseInt(matchId) },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Формируем данные из истории рейтингов
    const ratingChanges = ratingHistory.map((history: any) => ({
      userId: history.userId,
      playerName: `${history.user.firstName} ${history.user.lastName || ''}`.trim(),
      skillPointsBefore: history.skillPointsBefore,
      skillPointsAfter: history.skillPointsAfter,
      pointsEarned: history.pointsEarned,
      isWin: history.isWin
    }));
 // Получаем информацию о победителе, если есть winnerId
    let winner = null;
    if (match.winnerId) {
      const winnerUser = await this.prisma.user.findUnique({
        where: { id: match.winnerId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true
        }
      });
      
      if (winnerUser) {
        winner = {
          id: winnerUser.id,
          name: `${winnerUser.firstName} ${winnerUser.lastName || ''}`.trim(),
          username: winnerUser.username
        };
      }
    }

    // Формируем детальную информацию о матче
    return {
      id: match.id,
      type: match.type,
      status: match.state,
      date: match.matchDate || match.createdAt,
      formattedDate: this.formatDate(match.matchDate || match.createdAt),
      // Используем правильное поле для локации или альтернативное значение
      location: match.locationName || 'Не указан', // Заменяем на правильное имя поля
      score: match.score,
      participants: participants,
            winner: winner,
      duration: this.calculateMatchDuration(match),
      feedbacks: feedbacks,
      ratingChanges: ratingChanges,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      // Дополнительные данные о матче
      canLeaveFeedback: this.canLeaveFeedback(match)
    };
  }

   /**
   * Получает участников матча
   */
  private async getMatchParticipants(match: any): Promise<any[]> {
    const participants = [];
    
    // Добавляем создателя матча
    if (match.creator) {
      participants.push({
        id: match.creator.id,
        name: `${match.creator.firstName} ${match.creator.lastName || ''}`.trim(),
        username: match.creator.username,
        avatar: match.creator.profile?.avatarUrl,
        rating: match.creator.profile?.ntrpRating,
        city: match.creator.profile?.city,
        isWinner: match.winnerId === match.creator.id,
        role: 'creator'
      });
    }
    
    // Добавляем игроков, если они отличаются от создателя
    if (match.player1Id && match.player1Id !== match.creatorId) {
      const player = await this.prisma.user.findUnique({
        where: { id: match.player1Id },
        include: {
          profile: {
            select: {
              avatarUrl: true,
              ntrpRating: true,
              city: true
            }
          }
        }
      });
     if (player) {
        participants.push({
          id: player.id,
          name: `${player.firstName} ${player.lastName || ''}`.trim(),
          username: player.username,
          avatar: player.profile?.avatarUrl,
          rating: player.profile?.ntrpRating,
          city: player.profile?.city,
          isWinner: match.winnerId === player.id,
          role: 'player1'
        });
      }
    }
    
    if (match.player2Id && match.player2Id !== match.creatorId && match.player2Id !== match.player1Id) {
      const player = await this.prisma.user.findUnique({
        where: { id: match.player2Id },
        include: {
          profile: {
            select: {
              avatarUrl: true,
              ntrpRating: true,
              city: true
            }
          }
        }
      });
      if (player) {
        participants.push({
          id: player.id,
          name: `${player.firstName} ${player.lastName || ''}`.trim(),
          username: player.username,
          avatar: player.profile?.avatarUrl,
          rating: player.profile?.ntrpRating,
          city: player.profile?.city,
          isWinner: match.winnerId === player.id,
          role: 'player2'
        });
      }
    }
    
    return participants;
  }

  /**
   * Форматирует дату матча
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Вычисляет примерную длительность матча
   */
  private calculateMatchDuration(match: any): string {
    // По-умолчанию средняя длительность матча
    let durationMinutes = 90;
    
    // Если есть счет, можно оценить длительность
    if (match.score) {
      const sets = match.score.split(/[,\s]+/).filter((set: string) => set.includes('-'));
      durationMinutes = sets.length * 30; // ~30 минут на сет в среднем
      
      // Дополнительное время для тай-брейков
      if (match.score.includes('7-6') || match.score.includes('6-7')) {
        durationMinutes += 15;
      }
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours > 0 ? `${hours} ч` : ''} ${minutes} мин`;
  }

  /**
   * Проверяет, может ли пользователь оставить отзыв
   */
  private canLeaveFeedback(match: any): boolean {
    return match.state === MatchState.FINISHED;
  }
}