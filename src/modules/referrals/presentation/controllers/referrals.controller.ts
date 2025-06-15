import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ReferralsService } from '../../application/services/referrals.service';
import { ReferralStatsService } from '../../application/services/referral-stats.service';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { id: number; role: string; [key: string]: any };
}

@ApiTags('referrals')
@Controller('referrals')
export class ReferralsController {
  constructor(
    private readonly referralsService: ReferralsService,
    private readonly referralStatsService: ReferralStatsService,
  ) {}

  @Post('generate-invite')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Генерировать персональную ссылку-приглашение' })
  @ApiResponse({ status: 201, description: 'Ссылка для приглашения создана' })
  async generateInviteLink(
    @Req() req: RequestWithUser,
    @Body('baseUrl') baseUrl?: string,
  ) {
    const defaultBaseUrl = baseUrl || `${req.protocol}://${req.get('host')}`;
    const inviteLink = await this.referralsService.generateInviteLink(
      req.user.id.toString(),
      defaultBaseUrl
    );

    return {
      inviteLink,
      message: 'Поделитесь этой ссылкой с друзьями!',
      shareText: 'Присоединяйся к нашему теннисному сообществу! 🎾',
    };
  }

  @Get('validate/:code')
  @ApiOperation({ summary: 'Проверить валидность реферального кода' })
  @ApiParam({ name: 'code', description: 'Реферальный код для проверки' })
  @ApiResponse({ status: 200, description: 'Результат проверки кода' })
  async validateReferralCode(@Param('code') code: string) {
    const isValid = await this.referralsService.validateReferralCode(code);
    return {
      isValid,
      message: isValid ? 'Код действителен' : 'Недействительный код',
    };
  }

  @Get('my-stats')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Получить статистику рефералов пользователя' })
  @ApiResponse({ status: 200, description: 'Статистика рефералов' })
  async getMyReferralStats(@Req() req: RequestWithUser) {
    return this.referralsService.getUserReferralStats(req.user.id.toString());
  }

  @Get('my-achievements')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Получить достижения пользователя' })
  @ApiResponse({ status: 200, description: 'Достижения за рефералов' })
  async getMyAchievements(@Req() req: RequestWithUser) {
    return this.referralStatsService.getUserAchievements(req.user.id.toString());
  }

  @Get('top-referrers')
  @ApiOperation({ summary: 'Получить топ рефереров' })
  @ApiQuery({ name: 'limit', required: false, description: 'Количество записей (по умолчанию 10)' })
  @ApiResponse({ status: 200, description: 'Список топ рефереров' })
  async getTopReferrers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.referralsService.getTopReferrers(limitNum);
  }

  @Get('global-stats')
  @ApiOperation({ summary: 'Глобальная статистика реферальной программы' })
  @ApiResponse({ status: 200, description: 'Общая статистика' })
  async getGlobalStats() {
    return this.referralStatsService.getGlobalStats();
  }

  @Post('register')
  @ApiOperation({ summary: 'Регистрация по реферальной ссылке' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        referralCode: { type: 'string', description: 'Реферальный код' },
        telegram_id: { type: 'string', description: 'Telegram ID' },
        username: { type: 'string', description: 'Username' },
        first_name: { type: 'string', description: 'Имя' },
        last_name: { type: 'string', description: 'Фамилия' },
        photo_url: { type: 'string', description: 'URL фото' },
        source: { type: 'string', description: 'Источник перехода' },
      },
      required: ['referralCode', 'telegram_id', 'username', 'first_name'],
    },
  })
  @ApiResponse({ status: 201, description: 'Пользователь зарегистрирован по реферальной ссылке' })
  async registerByReferral(
    @Body() registerData: any,
    @Req() req: ExpressRequest,
  ) {
    if (!registerData.referralCode) {
      throw new BadRequestException('Отсутствует реферальный код');
    }

    const result = await this.referralsService.registerByReferral(
      registerData.referralCode,
      {
        ...registerData,
        ipAddress: req.ip,
      }
    );

    return {
      user: result.user,
      referrer: result.referrer,
      message: `Добро пожаловать! Вас пригласил ${result.referrer.firstName}`,
    };
  }

  @Post('mark-active/:userId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Отметить пользователя как активного (внутренний эндпоинт)' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь отмечен как активный' })
  async markUserAsActive(@Param('userId') userId: string) {
    await this.referralsService.markUserAsActive(userId);
    return { message: 'Пользователь отмечен как активный' };
  }
}