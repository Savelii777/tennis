import { 
  Controller, 
  Get, 
  Patch, 
  Post, 
  Body, 
  UseGuards, 
  Request,
  Query,
  ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto, LanguageDto, NotificationSettingsDto } from './dto/settings.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
  };
}

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Получить настройки текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Настройки пользователя' })
  async getMySettings(@Request() req: RequestWithUser) {
    return this.settingsService.getUserSettings(parseInt(req.user.id));
  }

  @Patch('update')
  @ApiOperation({ summary: 'Обновить настройки пользователя' })
  @ApiResponse({ status: 200, description: 'Настройки обновлены' })
  async updateSettings(
    @Request() req: RequestWithUser,
    @Body() updateData: UpdateSettingsDto
  ) {
    return this.settingsService.updateSettings(parseInt(req.user.id), updateData);
  }

  @Post('language')
  @ApiOperation({ summary: 'Изменить язык интерфейса' })
  @ApiResponse({ status: 200, description: 'Язык изменен' })
  async updateLanguage(
    @Request() req: RequestWithUser,
    @Body() languageData: LanguageDto
  ) {
    return this.settingsService.updateLanguage(parseInt(req.user.id), languageData.language);
  }

  @Post('notifications')
  @ApiOperation({ summary: 'Обновить настройки уведомлений' })
  @ApiResponse({ status: 200, description: 'Настройки уведомлений обновлены' })
  async updateNotificationSettings(
    @Request() req: RequestWithUser,
    @Body() notificationData: NotificationSettingsDto
  ) {
    return this.settingsService.updateNotificationSettings(parseInt(req.user.id), notificationData);
  }

  @Post('notifications/toggle')
  @ApiOperation({ summary: 'Включить/отключить все уведомления' })
  @ApiResponse({ status: 200, description: 'Уведомления переключены' })
  async toggleNotifications(
    @Request() req: RequestWithUser,
    @Body() data: { enabled: boolean }
  ) {
    return this.settingsService.toggleNotifications(parseInt(req.user.id), data.enabled);
  }

  @Get('preferences/opponents')
  @ApiOperation({ summary: 'Получить предпочтения по соперникам' })
  @ApiResponse({ status: 200, description: 'Предпочтения по соперникам' })
  async getOpponentPreferences(@Request() req: RequestWithUser) {
    return this.settingsService.getOpponentPreferences(parseInt(req.user.id));
  }
}