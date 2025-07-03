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
exports.RequestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const requests_service_1 = require("../../application/services/requests.service");
const create_request_dto_1 = require("../../application/dto/create-request.dto");
const respond_request_dto_1 = require("../../application/dto/respond-request.dto");
const auth_guard_1 = require("../../../../common/guards/auth.guard");
let RequestsController = class RequestsController {
    constructor(requestsService) {
        this.requestsService = requestsService;
    }
    async findAll(type, status, gameMode) {
        const filters = { type, status, gameMode };
        return this.requestsService.findAll(filters);
    }
    async findOne(id) {
        return this.requestsService.findById(id);
    }
    async create(createRequestDto, req) {
        // You might want to add validation here
        if (!createRequestDto.dateTime) {
            throw new common_1.BadRequestException('dateTime is required');
        }
        return this.requestsService.create(req.user.id, createRequestDto);
    }
    async respond(id, respondDto, req) {
        return this.requestsService.respond(id, req.user.id, respondDto);
    }
    async acceptResponse(id, responseId, req) {
        return this.requestsService.acceptResponse(id, responseId, req.user.id);
    }
    async declineResponse(id, responseId, req) {
        return this.requestsService.declineResponse(id, responseId, req.user.id);
    }
};
exports.RequestsController = RequestsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить список всех заявок' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список заявок успешно получен' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, description: 'Фильтр по типу заявки' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Фильтр по статусу заявки' }),
    (0, swagger_1.ApiQuery)({ name: 'gameMode', required: false, description: 'Фильтр по режиму игры' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('gameMode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить заявку по ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Заявка успешно получена' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Заявка не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new request' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The request has been created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_request_dto_1.CreateRequestDto, Object]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/respond'),
    (0, swagger_1.ApiOperation)({ summary: 'Откликнуться на заявку' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Отклик успешно создан' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректный запрос' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Заявка не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, respond_request_dto_1.RespondRequestDto, Object]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "respond", null);
__decorate([
    (0, common_1.Patch)(':id/responses/:responseId/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Принять отклик на заявку' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Отклик успешно принят' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректный запрос' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Недостаточно прав' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Заявка или отклик не найдены' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('responseId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "acceptResponse", null);
__decorate([
    (0, common_1.Patch)(':id/responses/:responseId/decline'),
    (0, swagger_1.ApiOperation)({ summary: 'Отклонить отклик на заявку' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Отклик успешно отклонен' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Недостаточно прав' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Заявка или отклик не найдены' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('responseId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "declineResponse", null);
exports.RequestsController = RequestsController = __decorate([
    (0, swagger_1.ApiTags)('requests'),
    (0, common_1.Controller)('requests'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [requests_service_1.RequestsService])
], RequestsController);
