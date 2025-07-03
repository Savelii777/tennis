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
exports.LocationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const locations_service_1 = require("../application/services/locations.service");
let LocationsController = class LocationsController {
    constructor(locationsService) {
        this.locationsService = locationsService;
    }
    async getCountries() {
        return this.locationsService.getAllCountries();
    }
    async searchCities(countryCode, query, limit) {
        return this.locationsService.searchCities({
            countryCode,
            query,
            limit: limit ? parseInt(limit) : 10,
        });
    }
    async getPopularCities(countryCode) {
        return this.locationsService.getPopularCities(countryCode);
    }
    async getSports() {
        return this.locationsService.getAllSports();
    }
    async getCityById(id) {
        return this.locationsService.getCityById(parseInt(id));
    }
};
exports.LocationsController = LocationsController;
__decorate([
    (0, common_1.Get)('countries'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить список всех стран',
        description: 'Возвращает список стран отсортированный по популярности'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список стран' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getCountries", null);
__decorate([
    (0, common_1.Get)('cities'),
    (0, swagger_1.ApiOperation)({
        summary: 'Поиск городов',
        description: 'Поиск городов по стране и части названия'
    }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, description: 'Код страны (ISO alpha-2)' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: false, description: 'Часть названия города' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Лимит результатов', example: 10 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список городов' }),
    __param(0, (0, common_1.Query)('country')),
    __param(1, (0, common_1.Query)('query')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "searchCities", null);
__decorate([
    (0, common_1.Get)('cities/popular'),
    (0, swagger_1.ApiOperation)({
        summary: 'Популярные города',
        description: 'Топ-10 активных городов в стране'
    }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: true, description: 'Код страны (ISO alpha-2)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Популярные города' }),
    __param(0, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getPopularCities", null);
__decorate([
    (0, common_1.Get)('sports'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить список видов спорта',
        description: 'Возвращает доступные виды спорта'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список видов спорта' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getSports", null);
__decorate([
    (0, common_1.Get)('cities/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить информацию о городе',
        description: 'Детальная информация о городе по ID'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Информация о городе' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getCityById", null);
exports.LocationsController = LocationsController = __decorate([
    (0, swagger_1.ApiTags)('locations'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [locations_service_1.LocationsService])
], LocationsController);
