import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TournamentsService } from '../../application/services/tournaments.service';
import { CreateTournamentDto } from '../../application/dto/create-tournament.dto';
import { UpdateTournamentDto } from '../../application/dto/update-tournament.dto';
import { RecordTournamentMatchDto } from '../../application/dto/record-tournament-match.dto';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { id: string };
}

@ApiTags('tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tournaments' })
  @ApiResponse({ status: 200, description: 'Return all tournaments.' })
  async findAll(@Query() filters?: any) {
    return this.tournamentsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tournament by ID' })
  @ApiResponse({ status: 200, description: 'Return tournament by ID.' })
  @ApiResponse({ status: 404, description: 'Tournament not found.' })
  async findOne(@Param('id') id: string) {
    return this.tournamentsService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tournament' })
  @ApiResponse({ status: 201, description: 'Tournament created successfully.' })
  async create(@Body() createTournamentDto: CreateTournamentDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.tournamentsService.create(userId, createTournamentDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tournament' })
  @ApiResponse({ status: 200, description: 'Tournament updated successfully.' })
  @ApiResponse({ status: 404, description: 'Tournament not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateTournamentDto: UpdateTournamentDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.tournamentsService.update(id, userId, updateTournamentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tournament' })
  @ApiResponse({ status: 204, description: 'Tournament deleted successfully.' })
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    await this.tournamentsService.delete(id, userId);
  }

  @Post(':id/players')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join tournament' })
  @ApiResponse({ status: 201, description: 'Joined tournament successfully.' })
  async joinTournament(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.tournamentsService.joinTournament(id, userId);
  }

  @Delete(':id/players')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave tournament' })
  @ApiResponse({ status: 200, description: 'Left tournament successfully.' })
  async leaveTournament(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.tournamentsService.leaveTournament(id, userId);
  }

  @Get(':id/players')
  @ApiOperation({ summary: 'Get tournament players' })
  @ApiResponse({ status: 200, description: 'Return tournament players.' })
  async getTournamentPlayers(@Param('id') id: string) {
    await this.tournamentsService.findById(id);
    return this.tournamentsService['tournamentsRepository'].getTournamentPlayers(id);
  }

  @Post(':id/start')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start tournament' })
  @ApiResponse({ status: 200, description: 'Tournament started successfully.' })
  async startTournament(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.tournamentsService.startTournament(id, userId);
  }

  @Post(':id/complete')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete tournament' })
  @ApiResponse({ status: 200, description: 'Tournament completed successfully.' })
  async completeTournament(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.tournamentsService.completeTournament(id, userId);
  }

  @Get(':id/matches')
  @ApiOperation({ summary: 'Get tournament matches' })
  @ApiResponse({ status: 200, description: 'Return tournament matches.' })
  async getTournamentMatches(@Param('id') id: string) {
    return this.tournamentsService.getTournamentMatches(id);
  }

  @Get(':id/matches/:matchId')
  @ApiOperation({ summary: 'Get tournament match details' })
  @ApiResponse({ status: 200, description: 'Return tournament match details.' })
  async getTournamentMatch(@Param('id') id: string, @Param('matchId') matchId: string) {
    return this.tournamentsService.getTournamentMatch(id, matchId);
  }

  @Post(':id/matches/:matchId/result')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record match result' })
  @ApiResponse({ status: 200, description: 'Match result recorded successfully.' })
  async recordMatchResult(
    @Param('id') id: string,
    @Param('matchId') matchId: string,
    @Body() recordMatchDto: RecordTournamentMatchDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.tournamentsService.recordMatchResult(id, matchId, userId, recordMatchDto);
  }

  @Get(':id/standings')
  @ApiOperation({ summary: 'Get tournament standings' })
  @ApiResponse({ status: 200, description: 'Return tournament standings.' })
  async getTournamentStandings(@Param('id') id: string) {
    return this.tournamentsService.getTournamentStandings(id);
  }
}