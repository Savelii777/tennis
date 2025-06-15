import { 
  Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CasesService } from '../../application/services/cases.service';
import { CaseItemsService } from '../../application/services/case-items.service';
import { CaseOpeningService } from '../../application/services/case-opening.service';
import { CreateCaseDto, UpdateCaseDto } from '../dto/case.dto';
import { CreateCaseItemDto, UpdateCaseItemDto } from '../dto/case-item.dto';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '../../../users/domain/enums/role.enum';

@ApiTags('admin-cases')
@Controller('admin/cases')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.ORGANIZER) 
export class AdminCasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly caseItemsService: CaseItemsService,
    private readonly caseOpeningService: CaseOpeningService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый кейс' })
  @ApiBody({ type: CreateCaseDto })
  @ApiResponse({ status: 201, description: 'Кейс создан' })
  async createCase(@Body() createCaseDto: CreateCaseDto) {
    return this.casesService.createCase(createCaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все кейсы (включая неактивные)' })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Включить неактивные кейсы' })
  @ApiResponse({ status: 200, description: 'Список всех кейсов' })
  async getAllCases(@Query('includeInactive') includeInactive?: string) {
    return this.casesService.getAllCases(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить кейс по ID' })
  @ApiParam({ name: 'id', description: 'ID кейса' })
  @ApiResponse({ status: 200, description: 'Данные кейса' })
  async getCaseById(@Param('id') id: string) {
    return this.casesService.getCaseById(parseInt(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить кейс' })
  @ApiParam({ name: 'id', description: 'ID кейса' })
  @ApiBody({ type: UpdateCaseDto })
  @ApiResponse({ status: 200, description: 'Кейс обновлен' })
  async updateCase(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.casesService.updateCase(parseInt(id), updateCaseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить кейс' })
  @ApiParam({ name: 'id', description: 'ID кейса' })
  @ApiResponse({ status: 200, description: 'Кейс удален' })
  async deleteCase(@Param('id') id: string) {
    return this.casesService.deleteCase(parseInt(id));
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Переключить статус активности кейса' })
  @ApiParam({ name: 'id', description: 'ID кейса' })
  @ApiResponse({ status: 200, description: 'Статус кейса изменен' })
  async toggleCaseStatus(@Param('id') id: string) {
    return this.casesService.toggleCaseStatus(parseInt(id));
  }

  @Post(':caseId/items')
  @ApiOperation({ summary: 'Добавить приз в кейс' })
  @ApiParam({ name: 'caseId', description: 'ID кейса' })
  @ApiBody({ type: CreateCaseItemDto })
  @ApiResponse({ status: 201, description: 'Приз добавлен' })
  async createCaseItem(
    @Param('caseId') caseId: string,
    @Body() createItemDto: CreateCaseItemDto,
  ) {
    return this.caseItemsService.createCaseItem(parseInt(caseId), createItemDto);
  }

  @Get(':caseId/items')
  @ApiOperation({ summary: 'Получить призы кейса' })
  @ApiParam({ name: 'caseId', description: 'ID кейса' })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Включить неактивные призы' })
  @ApiResponse({ status: 200, description: 'Список призов' })
  async getCaseItems(
    @Param('caseId') caseId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.caseItemsService.getCaseItems(parseInt(caseId), includeInactive === 'true');
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Обновить приз' })
  @ApiParam({ name: 'itemId', description: 'ID приза' })
  @ApiBody({ type: UpdateCaseItemDto })
  @ApiResponse({ status: 200, description: 'Приз обновлен' })
  async updateCaseItem(
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateCaseItemDto,
  ) {
    return this.caseItemsService.updateCaseItem(parseInt(itemId), updateItemDto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Удалить приз' })
  @ApiParam({ name: 'itemId', description: 'ID приза' })
  @ApiResponse({ status: 200, description: 'Приз удален' })
  async deleteCaseItem(@Param('itemId') itemId: string) {
    return this.caseItemsService.deleteCaseItem(parseInt(itemId));
  }

  @Patch('items/:itemId/toggle-status')
  @ApiOperation({ summary: 'Переключить статус активности приза' })
  @ApiParam({ name: 'itemId', description: 'ID приза' })
  @ApiResponse({ status: 200, description: 'Статус приза изменен' })
  async toggleItemStatus(@Param('itemId') itemId: string) {
    return this.caseItemsService.toggleItemStatus(parseInt(itemId));
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Статистика кейса' })
  @ApiParam({ name: 'id', description: 'ID кейса' })
  @ApiResponse({ status: 200, description: 'Статистика кейса' })
  async getCaseStatistics(@Param('id') id: string) {
    return this.casesService.getCaseStatistics(parseInt(id));
  }

  @Get('statistics/overview')
  @ApiOperation({ summary: 'Общая статистика всех кейсов' })
  @ApiResponse({ status: 200, description: 'Общая статистика' })
  async getAllCasesStatistics() {
    return this.casesService.getAllCasesStatistics();
  }

  @Get('items/:itemId/statistics')
  @ApiOperation({ summary: 'Статистика приза' })
  @ApiParam({ name: 'itemId', description: 'ID приза' })
  @ApiResponse({ status: 200, description: 'Статистика приза' })
  async getItemStatistics(@Param('itemId') itemId: string) {
    return this.caseItemsService.getItemStatistics(parseInt(itemId));
  }

  @Patch('winnings/:winningId/process')
  @ApiOperation({ summary: 'Отметить физический приз как обработанный' })
  @ApiParam({ name: 'winningId', description: 'ID выигрыша' })
  @ApiResponse({ status: 200, description: 'Выигрыш отмечен как обработанный' })
  async processWinning(
    @Param('winningId') winningId: string,
    @Body('notes') notes?: string,
  ) {
    return this.caseOpeningService.markWinningAsProcessed(parseInt(winningId), notes);
  }
}