import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { AchievementsService } from '../../application/services/achievements.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
  };
}

@ApiTags('achievements')
@ApiBearerAuth()
@Controller('achievements')
@UseGuards(AuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Получить мои достижения' })
  @ApiResponse({ status: 200, description: 'Список достижений пользователя' })
  async getMyAchievements(@Request() req: RequestWithUser) {
    return this.achievementsService.getUserAchievements(req.user.id.toString());
  }

  @Get('definitions')
  @ApiOperation({ summary: 'Получить все доступные достижения' })
  @ApiResponse({ status: 200, description: 'Список всех достижений' })
  async getAllDefinitions() {
    return this.achievementsService.getAllDefinitions();
  }
}