import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body, 
  UseGuards, 
  Request,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RatingsService, MatchResult } from './ratings.service';
import { AuthGuard } from '../../common/guards/auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
  };
}

@ApiTags('ratings')
@ApiBearerAuth()
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Получить рейтинг игрока' })
  @ApiResponse({ status: 200, description: 'Рейтинг игрока' })
  async getPlayerRating(@Param('userId', ParseIntPipe) userId: number) {
    return this.ratingsService.getRatingForUser(userId);
  }

  @Get(':userId/stats')
  @ApiOperation({ summary: 'Получить подробную статистику игрока' })
  @ApiResponse({ status: 200, description: 'Подробная статистика игрока' })
  async getPlayerStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.ratingsService.getPlayerStats(userId);
  }

  @Get('leaderboard/skill')
  @ApiOperation({ summary: 'Получить топ игроков по skill rating' })
  @ApiResponse({ status: 200, description: 'Топ игроков по skill rating' })
  async getSkillLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.ratingsService.getTopPlayersBySkill(limitNum);
  }

  @Get('leaderboard/points')
  @ApiOperation({ summary: 'Получить топ игроков по points rating' })
  @ApiResponse({ status: 200, description: 'Топ игроков по points rating' })
  async getPointsLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.ratingsService.getTopPlayersByPoints(limitNum);
  }

  @Post('recalculate')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Пересчитать рейтинг после матча' })
  @ApiResponse({ status: 200, description: 'Рейтинг пересчитан' })
  async recalculateRating(@Body() matchResult: MatchResult) {
    return this.ratingsService.recalculateAfterMatch(matchResult);
  }

  @Post('tournament-points')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Добавить очки за турнир' })
  @ApiResponse({ status: 200, description: 'Очки добавлены' })
  async addTournamentPoints(@Body() data: {
    userId: number;
    points: number;
    reason: string;
  }) {
    return this.ratingsService.addTournamentPoints(data.userId, data.points, data.reason);
  }

  @Post('seasons')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Создать новый сезон' })
  @ApiResponse({ status: 201, description: 'Сезон создан' })
  async createSeason(@Body() data: {
    title: string;
    startDate: string;
    endDate: string;
    description?: string;
  }) {
    return this.ratingsService.createSeason({
      title: data.title,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      description: data.description,
    });
  }

  @Post('seasons/:seasonId/reset-points')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Сбросить P-Rating для сезона (только админ)' })
  @ApiResponse({ status: 200, description: 'P-Rating сброшен' })
  async resetPointsRating(@Param('seasonId', ParseIntPipe) seasonId: number) {
    await this.ratingsService.resetPointsRatingForSeason(seasonId);
    return { message: 'Points rating reset successfully' };
  }

  @Get('seasons/current')
  @ApiOperation({ summary: 'Получить текущий сезон' })
  @ApiResponse({ status: 200, description: 'Текущий сезон' })
  async getCurrentSeason() {
    return this.ratingsService.getCurrentSeason();
  }
}