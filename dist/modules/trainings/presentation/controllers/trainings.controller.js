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
exports.TrainingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trainings_service_1 = require("../../application/services/trainings.service");
const create_training_dto_1 = require("../../application/dto/create-training.dto");
const book_training_dto_1 = require("../../application/dto/book-training.dto");
const auth_guard_1 = require("../../../../common/guards/auth.guard");
let TrainingsController = class TrainingsController {
    constructor(trainingsService) {
        this.trainingsService = trainingsService;
    }
    async findAll(trainingType, status, minDate, maxDate) {
        const filters = { trainingType, status, minDate, maxDate };
        return this.trainingsService.findAll(filters);
    }
    async findOne(id) {
        return this.trainingsService.findById(id);
    }
    async create(createTrainingDto, req) {
        if (!createTrainingDto.dateTime) {
            throw new common_1.BadRequestException('dateTime is required');
        }
        if (!createTrainingDto.endTime) {
            throw new common_1.BadRequestException('endTime is required');
        }
        if (new Date(createTrainingDto.endTime) <= new Date(createTrainingDto.dateTime)) {
            throw new common_1.BadRequestException('endTime must be after dateTime');
        }
        return this.trainingsService.create(req.user.id, createTrainingDto);
    }
    async bookSlot(id, bookTrainingDto, req) {
        return this.trainingsService.bookSlot(id, req.user.id);
    }
    async cancelBooking(id, req) {
        return this.trainingsService.cancelBooking(id, req.user.id);
    }
    async cancelTraining(id, req) {
        return this.trainingsService.cancelTraining(id, req.user.id);
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить список всех тренировок' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список тренировок успешно получен' }),
    (0, swagger_1.ApiQuery)({ name: 'trainingType', required: false, description: 'Фильтр по типу тренировки' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Фильтр по статусу тренировки' }),
    (0, swagger_1.ApiQuery)({ name: 'minDate', required: false, description: 'Фильтр по минимальной дате' }),
    (0, swagger_1.ApiQuery)({ name: 'maxDate', required: false, description: 'Фильтр по максимальной дате' }),
    __param(0, (0, common_1.Query)('trainingType')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('minDate')),
    __param(3, (0, common_1.Query)('maxDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TrainingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить тренировку по ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Тренировка успешно получена' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Тренировка не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrainingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Создать новую тренировку' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Тренировка успешно создана' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_training_dto_1.CreateTrainingDto, Object]),
    __metadata("design:returntype", Promise)
], TrainingsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/book'),
    (0, swagger_1.ApiOperation)({ summary: 'Забронировать место на тренировке' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Место успешно забронировано' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректный запрос' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Нет свободных мест' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, book_training_dto_1.BookTrainingDto, Object]),
    __metadata("design:returntype", Promise)
], TrainingsController.prototype, "bookSlot", null);
__decorate([
    (0, common_1.Delete)(':id/book'),
    (0, swagger_1.ApiOperation)({ summary: 'Отменить бронирование места на тренировке' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Бронирование успешно отменено' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректный запрос' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TrainingsController.prototype, "cancelBooking", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Отменить тренировку' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Тренировка успешно отменена' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Недостаточно прав' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Тренировка не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TrainingsController.prototype, "cancelTraining", null);
TrainingsController = __decorate([
    (0, swagger_1.ApiTags)('trainings'),
    (0, common_1.Controller)('trainings'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [trainings_service_1.TrainingsService])
], TrainingsController);
exports.TrainingsController = TrainingsController;
