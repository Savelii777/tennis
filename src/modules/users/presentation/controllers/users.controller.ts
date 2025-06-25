import { 
  Controller, Get, Post, Put, Patch, Body, Param, Query, 
  UseGuards, Request, NotFoundException, ForbiddenException, 
  Req, HttpStatus, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiQuery, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UsersService } from '../../application/services/users.service';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ProfileStepOneDto } from '../dto/profile-step-one.dto';
import { ProfileStepTwoDto } from '../dto/profile-step-two.dto';
import { SendMessageDto } from '../../domain/dto/send-message.dto';
import { InviteToGameDto } from '../../domain/dto/invite-to-game.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request as ExpressRequest } from 'express';
import { UpdateLocationDto } from '../dto/update-location.dto';

// Импортируйте сервисы для матчей, турниров и историй
import { MatchesService } from '../../../matches/application/services/matches.service';
import { TournamentsService } from '../../../tournaments/application/services/tournaments.service';
import { StoriesService } from '../../../stories/application/services/stories.service';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    username: string;
  };
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly matchesService: MatchesService,
    private readonly tournamentsService: TournamentsService,
    private readonly storiesService: StoriesService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Получить полный профиль текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль успешно получен' })
  async getMe(@Request() req: RequestWithUser): Promise<any> {
    const userId = req.user.id.toString();
    
    // Получаем полный профиль со всеми связанными данными
    const userProfile = await this.usersService.getUserFullProfile(userId);
    
    // Получаем последние матчи
    const recentMatches = await this.matchesService.getUserRecentMatches(userId, 5);
    
    // Получаем активные турниры
    const tournaments = await this.tournamentsService.getUserTournaments(userId);
    
    // Получаем истории/фото
    const stories = await this.storiesService.getUserStories(userId);
    
    // Получаем достижения
    const achievements = await this.usersService.getUserAchievements(userId);
    
    // Формируем полный ответ в соответствии с ТЗ
    return {
      ...userProfile,
      recentMatches,
      tournaments,
      stories,
      achievements
    };
  }
  
  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Получить публичный профиль пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль успешно получен' })
  @ApiResponse({ status: 403, description: 'Профиль приватный' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getUserById(@Request() req: RequestWithUser, @Param('id') id: string): Promise<any> {
    const requesterId = req.user.id.toString();
    const targetId = id;
    
    // Проверяем свой ли это профиль
    const isOwnProfile = requesterId === targetId;
    
    if (isOwnProfile) {
      // Если свой профиль - возвращаем полные данные
      return this.getMe(req);
    }
    
    // Если чужой профиль - получаем с учетом настроек приватности
    return this.usersService.getPublicUserProfile(targetId, requesterId);
  }
  
  @Patch('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Обновить профиль пользователя' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Профиль обновлен' })
  async updateProfile(
    @Request() req: RequestWithUser, 
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<any> {
    return this.usersService.updateProfile(req.user.id.toString(), updateProfileDto);
  }
  
  @Post('me/avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Только изображения разрешены'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Загрузить аватар' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Аватар загружен' })
  async uploadAvatar(
    @Request() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    if (!file) {
      throw new Error('Файл не найден');
    }
    return this.usersService.updateAvatar(req.user.id.toString(), file.filename);
  }
  
  @Get('me/matches')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Получить матчи пользователя' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'FINISHED', 'CANCELLED'] })
  @ApiQuery({ name: 'limit', required: false, description: 'Количество записей' })
  @ApiQuery({ name: 'offset', required: false, description: 'Смещение' })
  @ApiResponse({ status: 200, description: 'Список матчей' })
  async getMyMatches(
    @Request() req: RequestWithUser,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<any> {
    return this.matchesService.getUserMatches(
      req.user.id.toString(), 
      {
        status,
        limit: limit ? parseInt(limit) : 20,
        offset: offset ? parseInt(offset) : 0
      }
    );
  }
  
  @Get('me/tournaments')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Получить турниры пользователя' })
  @ApiQuery({ name: 'status', required: false, enum: ['UPCOMING', 'ACTIVE', 'FINISHED'] })
  @ApiResponse({ status: 200, description: 'Список турниров' })
  async getMyTournaments(
    @Request() req: RequestWithUser,
    @Query('status') status?: string,
  ): Promise<any> {
    return this.tournamentsService.getUserTournaments(req.user.id.toString(), { status });
  }
  
  @Get('me/stories')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Получить истории/фото пользователя' })
  @ApiResponse({ status: 200, description: 'Список историй' })
  async getMyStories(@Request() req: RequestWithUser): Promise<any> {
    return this.storiesService.getUserStories(req.user.id.toString());
  }
  
  @Post('me/share')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Сгенерировать ссылку для шаринга профиля' })
  @ApiResponse({ status: 201, description: 'Ссылка создана' })
  async generateShareLink(@Request() req: RequestWithUser): Promise<any> {
    const userId = req.user.id.toString();
    const shareUrl = await this.usersService.generateProfileShareUrl(userId);
    
    return {
      shareUrl,
      deepLink: `tennis-app://profile/${userId}`,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`
    };
  }
  
  // Отправка сообщения пользователю (через бота)
  @Post(':id/message')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Отправить сообщение пользователю' })
  @ApiParam({ name: 'id', description: 'ID получателя' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 201, description: 'Сообщение отправлено' })
  @ApiResponse({ status: 403, description: 'Пользователь не принимает сообщения' })
  async sendMessage(
    @Request() req: RequestWithUser,
    @Param('id') recipientId: string,
    @Body() messageDto: SendMessageDto
  ): Promise<any> {
    return this.usersService.sendDirectMessage(
      req.user.id.toString(),
      recipientId,
      messageDto.message
    );
  }
  
  // Пригласить пользователя в игру
  @Post(':id/invite')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Пригласить пользователя в игру' })
  @ApiParam({ name: 'id', description: 'ID приглашаемого' })
  @ApiBody({ type: InviteToGameDto })
  @ApiResponse({ status: 201, description: 'Приглашение отправлено' })
  async inviteToGame(
    @Request() req: RequestWithUser,
    @Param('id') targetId: string,
    @Body() inviteDto: InviteToGameDto
  ): Promise<any> {
    return this.matchesService.inviteToMatch(
      req.user.id.toString(),
      targetId,
      inviteDto
    );
  }
  
  // Существующие методы для пошагового заполнения профиля
  @Post('/me/profile/step-one')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Заполнить первый шаг профиля' })
  async completeProfileStepOne(
    @Request() req: RequestWithUser,
    @Body() profileData: ProfileStepOneDto
  ) {
    return this.usersService.completeProfileStepOne(req.user.id.toString(), profileData);
  }

  @Post('/me/profile/step-two')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Заполнить второй шаг профиля' })
  async completeProfileStepTwo(
    @Request() req: RequestWithUser,
    @Body() profileData: ProfileStepTwoDto
  ) {
    return this.usersService.completeProfileStepTwo(req.user.id.toString(), profileData);
  }

  @Get('/me/profile/status')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Получить статус заполнения профиля' })
  async getProfileStatus(@Request() req: RequestWithUser) {
    return this.usersService.getProfileCompletionStatus(req.user.id.toString());
  }
  
  // Существующие методы для управления локацией
  @Patch('me/location')
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'Обновить локацию пользователя',
    description: 'Обновляет страну, город и вид спорта пользователя'
  })
  @ApiBody({ type: UpdateLocationDto })
  async updateMyLocation(
    @Req() req: RequestWithUser,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    const userId = req.user.id.toString();
    return this.usersService.updateUserLocation(userId, updateLocationDto);
  }

  @Get('me/location')
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'Получить локацию пользователя',
    description: 'Возвращает информацию о стране, городе и виде спорта'
  })
  async getMyLocation(@Req() req: RequestWithUser) {
    const userId = req.user.id.toString();
    return this.usersService.getUserWithLocation(userId);
  }
}