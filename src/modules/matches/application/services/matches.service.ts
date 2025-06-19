import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { MatchesRepository } from '../../infrastructure/repositories/matches.repository';
import { UsersService } from '../../../users/application/services/users.service';
import { CreateMatchDto } from '../dto/create-match.dto';
import { RecordScoreDto } from '../dto/record-score.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { MatchEntity } from '../../domain/entities/match.entity';
import { MatchState } from '../../domain/enums/match.enum';
import { AchievementsService } from '../../../achievements/application/services/achievements.service';
import { RatingsService } from '../../../ratings/ratings.service'; // Добавляем импорт


@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    private readonly matchesRepository: MatchesRepository,
    private readonly usersService: UsersService,
    private readonly achievementsService: AchievementsService,
    private readonly ratingsService: RatingsService, // Добавляем зависимость
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
}