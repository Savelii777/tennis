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
exports.CasesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cases_service_1 = require("../../application/services/cases.service");
const case_opening_service_1 = require("../../application/services/case-opening.service");
const auth_guard_1 = require("../../../../common/guards/auth.guard");
let CasesController = class CasesController {
    constructor(casesService, caseOpeningService) {
        this.casesService = casesService;
        this.caseOpeningService = caseOpeningService;
    }
    async getCases() {
        return this.casesService.getAllCases(false); // только активные
    }
    async getCaseById(id) {
        return this.casesService.getCaseById(parseInt(id));
    }
    async openCase(id, req) {
        return this.caseOpeningService.openCase(req.user.id.toString(), parseInt(id));
    }
    async getMyHistory(req, page, limit) {
        return this.caseOpeningService.getUserOpeningHistory(req.user.id.toString(), page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить список активных кейсов' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список кейсов' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CasesController.prototype, "getCases", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить кейс по ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID кейса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Данные кейса' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CasesController.prototype, "getCaseById", null);
__decorate([
    (0, common_1.Post)(':id/open'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Открыть кейс' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID кейса' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Результат открытия кейса' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CasesController.prototype, "openCase", null);
__decorate([
    (0, common_1.Get)('my/history'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'История открытия кейсов пользователя' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Номер страницы' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Количество записей на странице' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'История открытий' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CasesController.prototype, "getMyHistory", null);
CasesController = __decorate([
    (0, swagger_1.ApiTags)('cases'),
    (0, common_1.Controller)('cases'),
    __metadata("design:paramtypes", [cases_service_1.CasesService,
        case_opening_service_1.CaseOpeningService])
], CasesController);
exports.CasesController = CasesController;
