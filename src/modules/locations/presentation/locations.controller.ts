import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { LocationsService } from '../application/services/locations.service';

@ApiTags('locations')
@Controller()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('countries')
  @ApiOperation({ 
    summary: 'Получить список всех стран',
    description: 'Возвращает список стран отсортированный по популярности'
  })
  @ApiResponse({ status: 200, description: 'Список стран' })
  async getCountries() {
    return this.locationsService.getAllCountries();
  }

  @Get('cities')
  @ApiOperation({ 
    summary: 'Поиск городов',
    description: 'Поиск городов по стране и части названия'
  })
  @ApiQuery({ name: 'country', required: false, description: 'Код страны (ISO alpha-2)' })
  @ApiQuery({ name: 'query', required: false, description: 'Часть названия города' })
  @ApiQuery({ name: 'limit', required: false, description: 'Лимит результатов', example: 10 })
  @ApiResponse({ status: 200, description: 'Список городов' })
  async searchCities(
    @Query('country') countryCode?: string,
    @Query('query') query?: string,
    @Query('limit') limit?: string,
  ) {
    return this.locationsService.searchCities({
      countryCode,
      query,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('cities/popular')
  @ApiOperation({ 
    summary: 'Популярные города',
    description: 'Топ-10 активных городов в стране'
  })
  @ApiQuery({ name: 'country', required: true, description: 'Код страны (ISO alpha-2)' })
  @ApiResponse({ status: 200, description: 'Популярные города' })
  async getPopularCities(@Query('country') countryCode: string) {
    return this.locationsService.getPopularCities(countryCode);
  }

  @Get('sports')
  @ApiOperation({ 
    summary: 'Получить список видов спорта',
    description: 'Возвращает доступные виды спорта'
  })
  @ApiResponse({ status: 200, description: 'Список видов спорта' })
  async getSports() {
    return this.locationsService.getAllSports();
  }

  @Get('cities/:id')
  @ApiOperation({ 
    summary: 'Получить информацию о городе',
    description: 'Детальная информация о городе по ID'
  })
  @ApiResponse({ status: 200, description: 'Информация о городе' })
  async getCityById(@Param('id') id: string) {
    return this.locationsService.getCityById(parseInt(id));
  }
}