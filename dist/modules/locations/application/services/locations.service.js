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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const locations_repository_1 = require("../../infrastructure/repositories/locations.repository");
let LocationsService = class LocationsService {
    constructor(locationsRepository) {
        this.locationsRepository = locationsRepository;
    }
    async getAllCountries() {
        return this.locationsRepository.findAllCountries();
    }
    async searchCities(params) {
        return this.locationsRepository.searchCities(params);
    }
    async getPopularCities(countryCode) {
        return this.locationsRepository.getPopularCities(countryCode, 10);
    }
    async getAllSports() {
        return this.locationsRepository.findAllSports();
    }
    async getCityById(id) {
        const city = await this.locationsRepository.findCityById(id);
        if (!city) {
            throw new common_1.NotFoundException(`Город с ID ${id} не найден`);
        }
        return city;
    }
    async getCountryByCode(code) {
        const country = await this.locationsRepository.findCountryByCode(code);
        if (!country) {
            throw new common_1.NotFoundException(`Страна с кодом ${code} не найдена`);
        }
        return country;
    }
};
LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [locations_repository_1.LocationsRepository])
], LocationsService);
exports.LocationsService = LocationsService;
