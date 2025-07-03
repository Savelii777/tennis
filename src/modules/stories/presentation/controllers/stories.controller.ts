import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
  Req,
  Res
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StoriesService } from '../../application/services/stories.service';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { CreateStoryDto } from '../../application/dto/create-story.dto';
import { StoryResponseDto } from '../../application/dto/story-response.dto';
import { Response } from 'express';
import { RequestWithUser } from '../../../auth/interfaces/request-with-user.interface';

@ApiTags('stories')
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  // Получить все публичные сторис
  @Get('public')
  @ApiOperation({ summary: 'Получить все публичные сторис' })
  @ApiResponse({ status: 200, description: 'Список публичных сторис', type: [StoryResponseDto] })
  async getPublicStories(): Promise<StoryResponseDto[]> {
    return this.storiesService.getPublicStories();
  }

  // Получить сторис для отображения в формате карусели с группировкой по пользователям
  @Get('carousel')
  @ApiOperation({ summary: 'Получить сторис для отображения в формате карусели' })
  @ApiResponse({ status: 200, description: 'Сторис для карусели', type: 'object' })
  async getStoriesForCarousel(): Promise<any> {
    return this.storiesService.getStoriesForCarousel();
  }

  // Получить популярные сторис
  @Get('popular')
  @ApiOperation({ summary: 'Получить популярные сторис' })
  @ApiResponse({ status: 200, description: 'Список популярных сторис', type: [StoryResponseDto] })
  async getPopularStories(): Promise<StoryResponseDto[]> {
    return this.storiesService.getPopularStories();
  }

  // Получить сторис пользователя
  @Get('user/:userId')
  @ApiOperation({ summary: 'Получить сторис пользователя' })
  @ApiResponse({ status: 200, description: 'Список сторис пользователя', type: [StoryResponseDto] })
  async getUserStories(@Param('userId', ParseIntPipe) userId: number): Promise<StoryResponseDto[]> {
    return this.storiesService.getUserStories(userId);
  }

  // Получить инфо о сторис
  @Get(':id')
  @ApiOperation({ summary: 'Получить информацию о сторис' })
  @ApiResponse({ status: 200, description: 'Информация о сторис', type: StoryResponseDto })
  @ApiResponse({ status: 404, description: 'Сторис не найдена' })
  async getStoryById(@Param('id', ParseIntPipe) id: number): Promise<StoryResponseDto> {
    return this.storiesService.getStoryById(id);
  }

  // Получить файл сторис
  @Get(':id/file')
  @ApiOperation({ summary: 'Получить прямую ссылку на файл сторис' })
  @ApiResponse({ status: 200, description: 'URL файла' })
  @ApiResponse({ status: 404, description: 'Сторис не найдена' })
  async getStoryFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ): Promise<void> {
    try {
      const { url } = await this.storiesService.getFileUrl(id);
      
      // Записываем просмотр
      await this.storiesService.recordView(id);
      
      // Перенаправляем на файл
      return res.redirect(url);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  // Создание сторис (используется ботом)
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новую сторис (используется ботом)' })
  @ApiResponse({ status: 201, description: 'Сторис создана', type: StoryResponseDto })
  @ApiResponse({ status: 400, description: 'Неверные данные или файл слишком большой' })
  async createStory(
    @Body() createStoryDto: CreateStoryDto,
    @Req() req: RequestWithUser
  ): Promise<StoryResponseDto> {
    return this.storiesService.createStory(req.user.id, createStoryDto);
  }

  // Админские эндпоинты
  @Get('admin/pending')
  @UseGuards(AuthGuard) // TODO: добавить AdminGuard
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить сторис на модерации (только для админов)' })
  @ApiResponse({ status: 200, description: 'Список сторис на модерации', type: [StoryResponseDto] })
  async getPendingStories(): Promise<StoryResponseDto[]> {
    return this.storiesService.getPendingStories();
  }

  @Post(':id/approve')
  @UseGuards(AuthGuard) // TODO: добавить AdminGuard
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Одобрить сторис (только для админов)' })
  @ApiResponse({ status: 200, description: 'Сторис одобрена', type: StoryResponseDto })
  @ApiResponse({ status: 400, description: 'Сторис не в статусе ожидания' })
  @ApiResponse({ status: 404, description: 'Сторис не найдена' })
  async approveStory(@Param('id', ParseIntPipe) id: number): Promise<StoryResponseDto> {
    return this.storiesService.approveStory(id);
  }

  @Post(':id/reject')
  @UseGuards(AuthGuard) // TODO: добавить AdminGuard
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отклонить сторис (только для админов)' })
  @ApiResponse({ status: 200, description: 'Сторис отклонена', type: StoryResponseDto })
  @ApiResponse({ status: 400, description: 'Сторис не в статусе ожидания' })
  @ApiResponse({ status: 404, description: 'Сторис не найдена' })
  async rejectStory(@Param('id', ParseIntPipe) id: number): Promise<StoryResponseDto> {
    return this.storiesService.rejectStory(id);
  }
}