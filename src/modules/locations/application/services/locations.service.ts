import { Injectable, NotFoundException } from '@nestjs/common';
import { LocationsRepository } from '../../infrastructure/repositories/locations.repository';

export interface SearchCitiesParams {
  countryCode?: string;
  query?: string;
  limit?: number;
}

@Injectable()
export class LocationsService {
  constructor(private readonly locationsRepository: LocationsRepository) {}

  async getAllCountries() {
    return this.locationsRepository.findAllCountries();
  }

  async searchCities(params: SearchCitiesParams) {
    return this.locationsRepository.searchCities(params);
  }

  async getPopularCities(countryCode: string) {
    return this.locationsRepository.getPopularCities(countryCode, 10);
  }

  async getAllSports() {
    return this.locationsRepository.findAllSports();
  }

  async getCityById(id: number) {
    const city = await this.locationsRepository.findCityById(id);
    if (!city) {
      throw new NotFoundException(`Город с ID ${id} не найден`);
    }
    return city;
  }

  async getCountryByCode(code: string) {
    const country = await this.locationsRepository.findCountryByCode(code);
    if (!country) {
      throw new NotFoundException(`Страна с кодом ${code} не найдена`);
    }
    return country;
  }
}