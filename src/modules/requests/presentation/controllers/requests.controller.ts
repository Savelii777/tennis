import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RequestsService } from '../../application/services/requests.service';
import { CreateRequestDto } from '../../application/dto/create-request.dto';
import { RespondRequestDto } from '../../application/dto/respond-request.dto';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string };
}

@ApiTags('requests')
@Controller('requests')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех заявок' })
  @ApiResponse({ status: 200, description: 'Список заявок успешно получен' })
  @ApiQuery({ name: 'type', required: false, description: 'Фильтр по типу заявки' })
  @ApiQuery({ name: 'status', required: false, description: 'Фильтр по статусу заявки' })
  @ApiQuery({ name: 'gameMode', required: false, description: 'Фильтр по режиму игры' })
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('gameMode') gameMode?: string,
  ) {
    const filters = { type, status, gameMode };
    return this.requestsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заявку по ID' })
  @ApiResponse({ status: 200, description: 'Заявка успешно получена' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async findOne(@Param('id') id: string) {
    return this.requestsService.findById(id);
  }

@Post()
@ApiOperation({ summary: 'Create a new request' })
@ApiResponse({ status: 201, description: 'The request has been created' })
async create(@Body() createRequestDto: CreateRequestDto, @Req() req: RequestWithUser) {
  // You might want to add validation here
  if (!createRequestDto.dateTime) {
    throw new BadRequestException('dateTime is required');
  }
  return this.requestsService.create(req.user.id, createRequestDto);
}

  @Post(':id/respond')
  @ApiOperation({ summary: 'Откликнуться на заявку' })
  @ApiResponse({ status: 201, description: 'Отклик успешно создан' })
  @ApiResponse({ status: 400, description: 'Некорректный запрос' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async respond(
    @Param('id') id: string,
    @Body() respondDto: RespondRequestDto,
    @Req() req: RequestWithUser
  ) {
    return this.requestsService.respond(id, req.user.id, respondDto);
  }

  @Patch(':id/responses/:responseId/accept')
  @ApiOperation({ summary: 'Принять отклик на заявку' })
  @ApiResponse({ status: 200, description: 'Отклик успешно принят' })
  @ApiResponse({ status: 400, description: 'Некорректный запрос' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Заявка или отклик не найдены' })
  async acceptResponse(
    @Param('id') id: string,
    @Param('responseId') responseId: string,
    @Req() req: RequestWithUser
  ) {
    return this.requestsService.acceptResponse(id, responseId, req.user.id);
  }

  @Patch(':id/responses/:responseId/decline')
  @ApiOperation({ summary: 'Отклонить отклик на заявку' })
  @ApiResponse({ status: 200, description: 'Отклик успешно отклонен' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Заявка или отклик не найдены' })
  async declineResponse(
    @Param('id') id: string,
    @Param('responseId') responseId: string,
    @Req() req: RequestWithUser
  ) {
    return this.requestsService.declineResponse(id, responseId, req.user.id);
  }
}