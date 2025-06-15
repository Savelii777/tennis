import { Controller, Get, Post, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CasesService } from '../../application/services/cases.service';
import { CaseOpeningService } from '../../application/services/case-opening.service';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { Request as ExpressRequest } from 'express'; // ← Изменить импорт

// ← Добавить интерфейс локально
interface RequestWithUser extends ExpressRequest {
  user: { id: number; role: string; [key: string]: any };
}

@ApiTags('cases')
@Controller('cases')
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly caseOpeningService: CaseOpeningService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Получить список активных кейсов' })
  @ApiResponse({ status: 200, description: 'Список кейсов' })
  async getCases() {
    return this.casesService.getAllCases(false); // только активные
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить кейс по ID' })
  @ApiParam({ name: 'id', description: 'ID кейса' })
  @ApiResponse({ status: 200, description: 'Данные кейса' })
  async getCaseById(@Param('id') id: string) {
    return this.casesService.getCaseById(parseInt(id));
  }

  @Post(':id/open')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Открыть кейс' })
  @ApiParam({ name: 'id', description: 'ID кейса' })
  @ApiResponse({ status: 201, description: 'Результат открытия кейса' })
  async openCase(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.caseOpeningService.openCase(req.user.id.toString(), parseInt(id));
  }

  @Get('my/history')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'История открытия кейсов пользователя' })
  @ApiQuery({ name: 'page', required: false, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, description: 'Количество записей на странице' })
  @ApiResponse({ status: 200, description: 'История открытий' })
  async getMyHistory(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.caseOpeningService.getUserOpeningHistory(
      req.user.id.toString(),
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }
}