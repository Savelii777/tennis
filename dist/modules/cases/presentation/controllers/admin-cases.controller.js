"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCasesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cases_service_1 = require("../../application/services/cases.service");
const case_items_service_1 = require("../../application/services/case-items.service");
const case_opening_service_1 = require("../../application/services/case-opening.service");
const case_dto_1 = require("../dto/case.dto");
const case_item_dto_1 = require("../dto/case-item.dto");
const auth_guard_1 = require("../../../../common/guards/auth.guard");
const roles_guard_1 = require("../../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../../common/decorators/roles.decorator");
const role_enum_1 = require("../../../users/domain/enums/role.enum");
let AdminCasesController = class AdminCasesController {
    constructor(casesService, caseItemsService, caseOpeningService) {
        this.casesService = casesService;
        this.caseItemsService = caseItemsService;
        this.caseOpeningService = caseOpeningService;
    }
    async createCase(createCaseDto) {
        return this.casesService.createCase(createCaseDto);
    }
    async getAllCases(includeInactive) {
        return this.casesService.getAllCases(includeInactive === 'true');
    }
    async getCaseById(id) {
        return this.casesService.getCaseById(parseInt(id));
    }
    async updateCase(id, updateCaseDto) {
        return this.casesService.updateCase(parseInt(id), updateCaseDto);
    }
    async deleteCase(id) {
        return this.casesService.deleteCase(parseInt(id));
    }
    async toggleCaseStatus(id) {
        return this.casesService.toggleCaseStatus(parseInt(id));
    }
    async createCaseItem(caseId, createItemDto) {
        return this.caseItemsService.createCaseItem(parseInt(caseId), createItemDto);
    }
    async getCaseItems(caseId, includeInactive) {
        return this.caseItemsService.getCaseItems(parseInt(caseId), includeInactive === 'true');
    }
    async updateCaseItem(itemId, updateItemDto) {
        return this.caseItemsService.updateCaseItem(parseInt(itemId), updateItemDto);
    }
    async deleteCaseItem(itemId) {
        return this.caseItemsService.deleteCaseItem(parseInt(itemId));
    }
    async toggleItemStatus(itemId) {
        return this.caseItemsService.toggleItemStatus(parseInt(itemId));
    }
    async getCaseStatistics(id) {
        return this.casesService.getCaseStatistics(parseInt(id));
    }
    async getAllCasesStatistics() {
        return this.casesService.getAllCasesStatistics();
    }
    async getItemStatistics(itemId) {
        return this.caseItemsService.getItemStatistics(parseInt(itemId));
    }
    async processWinning(winningId, notes) {
        return this.caseOpeningService.markWinningAsProcessed(parseInt(winningId), notes);
    }
};
exports.AdminCasesController = AdminCasesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Создать новый кейс' }),
    (0, swagger_1.ApiBody)({ type: case_dto_1.CreateCaseDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Кейс создан' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [case_dto_1.CreateCaseDto]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "createCase", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить все кейсы (включая неактивные)' }),
    (0, swagger_1.ApiQuery)({ name: 'includeInactive', required: false, description: 'Включить неактивные кейсы' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список всех кейсов' }),
    __param(0, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "getAllCases", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить кейс по ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID кейса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Данные кейса' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "getCaseById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить кейс' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID кейса' }),
    (0, swagger_1.ApiBody)({ type: case_dto_1.UpdateCaseDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Кейс обновлен' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, case_dto_1.UpdateCaseDto]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "updateCase", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Удалить кейс' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID кейса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Кейс удален' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "deleteCase", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Переключить статус активности кейса' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID кейса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статус кейса изменен' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "toggleCaseStatus", null);
__decorate([
    (0, common_1.Post)(':caseId/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Добавить приз в кейс' }),
    (0, swagger_1.ApiParam)({ name: 'caseId', description: 'ID кейса' }),
    (0, swagger_1.ApiBody)({ type: case_item_dto_1.CreateCaseItemDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Приз добавлен' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, case_item_dto_1.CreateCaseItemDto]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "createCaseItem", null);
__decorate([
    (0, common_1.Get)(':caseId/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить призы кейса' }),
    (0, swagger_1.ApiParam)({ name: 'caseId', description: 'ID кейса' }),
    (0, swagger_1.ApiQuery)({ name: 'includeInactive', required: false, description: 'Включить неактивные призы' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список призов' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "getCaseItems", null);
__decorate([
    (0, common_1.Put)('items/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить приз' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'ID приза' }),
    (0, swagger_1.ApiBody)({ type: case_item_dto_1.UpdateCaseItemDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Приз обновлен' }),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, case_item_dto_1.UpdateCaseItemDto]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "updateCaseItem", null);
__decorate([
    (0, common_1.Delete)('items/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Удалить приз' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'ID приза' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Приз удален' }),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "deleteCaseItem", null);
__decorate([
    (0, common_1.Patch)('items/:itemId/toggle-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Переключить статус активности приза' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'ID приза' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статус приза изменен' }),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "toggleItemStatus", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Статистика кейса' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID кейса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика кейса' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "getCaseStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Общая статистика всех кейсов' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Общая статистика' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "getAllCasesStatistics", null);
__decorate([
    (0, common_1.Get)('items/:itemId/statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Статистика приза' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'ID приза' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика приза' }),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "getItemStatistics", null);
__decorate([
    (0, common_1.Patch)('winnings/:winningId/process'),
    (0, swagger_1.ApiOperation)({ summary: 'Отметить физический приз как обработанный' }),
    (0, swagger_1.ApiParam)({ name: 'winningId', description: 'ID выигрыша' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Выигрыш отмечен как обработанный' }),
    __param(0, (0, common_1.Param)('winningId')),
    __param(1, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminCasesController.prototype, "processWinning", null);
exports.AdminCasesController = AdminCasesController = __decorate([
    (0, swagger_1.ApiTags)('admin-cases'),
    (0, common_1.Controller)('admin/cases'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.ORGANIZER),
    __metadata("design:paramtypes", [cases_service_1.CasesService,
        case_items_service_1.CaseItemsService,
        case_opening_service_1.CaseOpeningService])
], AdminCasesController);
