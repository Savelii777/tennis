import { 
  Controller, Post, Get, Body, Param, Request, 
  UseGuards, Query, ParseIntPipe, ForbiddenException 
} from '@nestjs/common';
import { AuthGuard } from '../../../../common/guards/auth.guard'; // Используем AuthGuard вместо JwtAuthGuard
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { MatchesService } from '../../application/services/matches.service';
import { CreateFeedbackDto } from '../../presentation/dto/create-feedback.dto';

@ApiTags('match-feedbacks')
@Controller('matches')
export class MatchFeedbackController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post(':id/feedback')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оставить отзыв о сопернике после матча' })
  @ApiParam({ name: 'id', description: 'ID матча' })
  @ApiResponse({ status: 201, description: 'Отзыв успешно создан' })
  async createFeedback(
    @Param('id') matchId: string,
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() req: any
  ) {
    return this.matchesService.createFeedback(
      matchId, 
      req.user.id,
      createFeedbackDto
    );
  }

  @Get(':id/feedbacks')
  @ApiOperation({ summary: 'Получить все отзывы о матче' })
  @ApiParam({ name: 'id', description: 'ID матча' })
  @ApiResponse({ status: 200, description: 'Список отзывов' })
  async getMatchFeedbacks(@Param('id') matchId: string) {
    return this.matchesService.getMatchFeedbacks(matchId);
  }

  @Get('feedbacks/given')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить отзывы, оставленные текущим пользователем' })
  @ApiResponse({ status: 200, description: 'Список отзывов' })
  async getGivenFeedbacks(
    @Request() req: any,
    @Query('limit', ParseIntPipe) limit?: number
  ) {
    return this.matchesService.getUserGivenFeedbacks(
      req.user.id, 
      limit || 10
    );
  }

  @Get('feedbacks/received')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить отзывы, полученные текущим пользователем' })
  @ApiResponse({ status: 200, description: 'Список отзывов' })
  async getReceivedFeedbacks(
    @Request() req: any,
    @Query('limit', ParseIntPipe) limit?: number
  ) {
    return this.matchesService.getUserReceivedFeedbacks(
      req.user.id, 
      limit || 10
    );
  }

  @Get('users/:userId/feedbacks')
  @ApiOperation({ summary: 'Получить публичные отзывы о пользователе' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Список отзывов' })
  async getUserFeedbacks(
    @Param('userId') userId: string,
    @Query('limit', ParseIntPipe) limit?: number
  ) {
    return this.matchesService.getUserReceivedFeedbacks(
      userId, 
      limit || 10
    );
  }
}