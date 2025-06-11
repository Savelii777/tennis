import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MatchesService } from '../../application/services/matches.service';
import { CreateMatchDto } from '../../application/dto/create-match.dto';
import { UpdateMatchDto } from '../../application/dto/update-match.dto';
import { RecordScoreDto } from '../../application/dto/record-score.dto';
import { MatchEntity } from '../../domain/entities/match.entity';
import { AuthGuard } from '../../../../common/guards/auth.guard';

interface RequestWithUser extends Request {
  user: { id: string };
}

@ApiTags('matches')
@Controller('matches')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all matches' })
  @ApiResponse({ status: 200, description: 'Return all matches', type: [MatchEntity] })
  async findAll(): Promise<MatchEntity[]> {
    return this.matchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a match by ID' })
  @ApiResponse({ status: 200, description: 'Return the match', type: MatchEntity })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async findOne(@Param('id') id: string): Promise<MatchEntity> {
    return this.matchesService.findById(id);
  }

  @Get('user/created')
  @ApiOperation({ summary: 'Get all matches created by the logged-in user' })
  @ApiResponse({ status: 200, description: 'Return all matches created by user', type: [MatchEntity] })
  async findByCreator(@Request() req: RequestWithUser): Promise<MatchEntity[]> {
    return this.matchesService.findByCreator(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new match' })
  @ApiResponse({ status: 201, description: 'The match has been created', type: MatchEntity })
  async create(
    @Request() req: RequestWithUser,
    @Body() createMatchDto: CreateMatchDto,
  ): Promise<MatchEntity> {
    return this.matchesService.create(req.user.id, createMatchDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a match' })
  @ApiResponse({ status: 200, description: 'The match has been updated', type: MatchEntity })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async update(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<MatchEntity> {
    return this.matchesService.update(id, req.user.id, updateMatchDto);
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm a match' })
  @ApiResponse({ status: 200, description: 'The match has been confirmed', type: MatchEntity })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async confirmMatch(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<MatchEntity> {
    return this.matchesService.confirmMatch(id, req.user.id);
  }

  @Put(':id/score')
  @ApiOperation({ summary: 'Record score for a match' })
  @ApiResponse({ status: 200, description: 'Score has been recorded', type: MatchEntity })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async recordScore(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() recordScoreDto: RecordScoreDto,
  ): Promise<MatchEntity> {
    return this.matchesService.recordScore(id, req.user.id, recordScoreDto);
  }

  @Delete(':id/cancel')
  @ApiOperation({ summary: 'Cancel a match' })
  @ApiResponse({ status: 200, description: 'The match has been cancelled', type: MatchEntity })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async cancelMatch(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<MatchEntity> {
    return this.matchesService.cancelMatch(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a match' })
  @ApiResponse({ status: 200, description: 'The match has been deleted' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async delete(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.matchesService.delete(id, req.user.id);
    return { message: 'Match deleted successfully' };
  }
}