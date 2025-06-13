import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TrainingsService } from '../../application/services/trainings.service';
import { CreateTrainingDto } from '../../application/dto/create-training.dto';
import { BookTrainingDto } from '../../application/dto/book-training.dto';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string };
}

@ApiTags('trainings')
@Controller('trainings')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех тренировок' })
  @ApiResponse({ status: 200, description: 'Список тренировок успешно получен' })
  @ApiQuery({ name: 'trainingType', required: false, description: 'Фильтр по типу тренировки' })
  @ApiQuery({ name: 'status', required: false, description: 'Фильтр по статусу тренировки' })
  @ApiQuery({ name: 'minDate', required: false, description: 'Фильтр по минимальной дате' })
  @ApiQuery({ name: 'maxDate', required: false, description: 'Фильтр по максимальной дате' })
  async findAll(
    @Query('trainingType') trainingType?: string,
    @Query('status') status?: string,
    @Query('minDate') minDate?: string,
    @Query('maxDate') maxDate?: string,
  ) {
    const filters = { trainingType, status, minDate, maxDate };
    return this.trainingsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить тренировку по ID' })
  @ApiResponse({ status: 200, description: 'Тренировка успешно получена' })
  @ApiResponse({ status: 404, description: 'Тренировка не найдена' })
  async findOne(@Param('id') id: string) {
    return this.trainingsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новую тренировку' })
  @ApiResponse({ status: 201, description: 'Тренировка успешно создана' })
  async create(@Body() createTrainingDto: CreateTrainingDto, @Req() req: RequestWithUser) {
    if (!createTrainingDto.dateTime) {
      throw new BadRequestException('dateTime is required');
    }
    
    if (!createTrainingDto.endTime) {
      throw new BadRequestException('endTime is required');
    }
    
    if (new Date(createTrainingDto.endTime) <= new Date(createTrainingDto.dateTime)) {
      throw new BadRequestException('endTime must be after dateTime');
    }
    
    return this.trainingsService.create(req.user.id, createTrainingDto);
  }

  @Post(':id/book')
  @ApiOperation({ summary: 'Забронировать место на тренировке' })
  @ApiResponse({ status: 201, description: 'Место успешно забронировано' })
  @ApiResponse({ status: 400, description: 'Некорректный запрос' })
  @ApiResponse({ status: 409, description: 'Нет свободных мест' })
  async bookSlot(
    @Param('id') id: string,
    @Body() bookTrainingDto: BookTrainingDto,
    @Req() req: RequestWithUser
  ) {
    return this.trainingsService.bookSlot(id, req.user.id);
  }

  @Delete(':id/book')
  @ApiOperation({ summary: 'Отменить бронирование места на тренировке' })
  @ApiResponse({ status: 200, description: 'Бронирование успешно отменено' })
  @ApiResponse({ status: 400, description: 'Некорректный запрос' })
  async cancelBooking(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.trainingsService.cancelBooking(id, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Отменить тренировку' })
  @ApiResponse({ status: 200, description: 'Тренировка успешно отменена' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Тренировка не найдена' })
  async cancelTraining(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.trainingsService.cancelTraining(id, req.user.id);
  }
}