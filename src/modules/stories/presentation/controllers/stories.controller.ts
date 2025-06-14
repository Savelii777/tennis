import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  Body, 
  UseGuards, 
  Req, 
  HttpCode, 
  HttpStatus,
  ParseIntPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StoriesService } from '../../application/services/stories.service';
import { CreateStoryDto } from '../../application/dto/create-story.dto';
import { StoryResponseDto } from '../../application/dto/story-response.dto';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { id: number; username: string };
}

@ApiTags('stories')
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get('public')
  @ApiOperation({ summary: 'Получить список опубликованных stories' })
  @ApiResponse({ status: 200, description: 'Список stories успешно получен', type: [StoryResponseDto] })
  async getPublicStories(): Promise<StoryResponseDto[]> {
    return this.storiesService.getPublicStories();
  }

  @Get('my')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить мои stories' })
  @ApiResponse({ status: 200, description: 'Список моих stories получен', type: [StoryResponseDto] })
  async getMyStories(@Req() req: RequestWithUser): Promise<StoryResponseDto[]> {
    return this.storiesService.getUserStories(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить story по ID' })
  @ApiResponse({ status: 200, description: 'Story найдена', type: StoryResponseDto })
  @ApiResponse({ status: 404, description: 'Story не найдена' })
  async getStoryById(@Param('id', ParseIntPipe) id: number): Promise<StoryResponseDto> {
    return this.storiesService.getStoryById(id);
  }

  @Get(':id/file')
  @ApiOperation({ summary: 'Получить прямую ссылку на файл story' })
  @ApiResponse({ status: 200, description: 'Ссылка на файл получена' })
  @ApiResponse({ status: 400, description: 'Story не одобрена или файл недоступен' })
  @ApiResponse({ status: 404, description: 'Story не найдена' })
  async getFileUrl(@Param('id', ParseIntPipe) id: number): Promise<{ url: string }> {
    return this.storiesService.getFileUrl(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новую story (используется ботом)' })
  @ApiResponse({ status: 201, description: 'Story создана', type: StoryResponseDto })
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
  @ApiOperation({ summary: 'Получить stories на модерации (только для админов)' })
  @ApiResponse({ status: 200, description: 'Список stories на модерации', type: [StoryResponseDto] })
  async getPendingStories(): Promise<StoryResponseDto[]> {
    return this.storiesService.getPendingStories();
  }

  @Post(':id/approve')
  @UseGuards(AuthGuard) // TODO: добавить AdminGuard
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Одобрить story (только для админов)' })
  @ApiResponse({ status: 200, description: 'Story одобрена', type: StoryResponseDto })
  @ApiResponse({ status: 400, description: 'Story не в статусе ожидания' })
  @ApiResponse({ status: 404, description: 'Story не найдена' })
  async approveStory(@Param('id', ParseIntPipe) id: number): Promise<StoryResponseDto> {
    return this.storiesService.approveStory(id);
  }

  @Post(':id/reject')
  @UseGuards(AuthGuard) // TODO: добавить AdminGuard
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отклонить story (только для админов)' })
  @ApiResponse({ status: 200, description: 'Story отклонена', type: StoryResponseDto })
  @ApiResponse({ status: 400, description: 'Story не в статусе ожидания' })
  @ApiResponse({ status: 404, description: 'Story не найдена' })
  async rejectStory(@Param('id', ParseIntPipe) id: number): Promise<StoryResponseDto> {
    return this.storiesService.rejectStory(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard) // TODO: добавить AdminGuard
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить story (только для админов)' })
  @ApiResponse({ status: 204, description: 'Story удалена' })
  @ApiResponse({ status: 404, description: 'Story не найдена' })
  async deleteStory(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.storiesService.deleteStory(id);
  }
}