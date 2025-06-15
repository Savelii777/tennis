import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { SearchCitiesParams } from '../../application/services/locations.service';

@Injectable()
export class LocationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllCountries() {
    return this.prisma.country.findMany({
      orderBy: [
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            cities: true,
            users: true
          }
        }
      }
    });
  }

  async findCountryByCode(code: string) {
    return this.prisma.country.findUnique({
      where: { code },
      include: {
        cities: {
          take: 5,
          orderBy: { population: 'desc' }
        }
      }
    });
  }

  async searchCities(params: SearchCitiesParams) {
    const { countryCode, query, limit = 10 } = params;
    
    const where: any = {
      population: {
        gte: 500000 // Только города с населением от 500k
      }
    };

    if (countryCode) {
      where.countryCode = countryCode;
    }

    if (query) {
      where.name = {
        contains: query,
        mode: 'insensitive'
      };
    }

    return this.prisma.city.findMany({
      where,
      include: {
        country: {
          select: {
            name: true,
            code: true,
            flagUrl: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: [
        { population: 'desc' }
      ],
      take: limit
    });
  }

  async getPopularCities(countryCode: string, limit: number) {
    return this.prisma.city.findMany({
      where: {
        countryCode,
        population: {
          gte: 500000
        }
      },
      include: {
        country: {
          select: {
            name: true,
            code: true,
            flagUrl: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: [
        { population: 'desc' }
      ],
      take: limit
    });
  }

  async findCityById(id: number) {
    return this.prisma.city.findUnique({
      where: { id },
      include: {
        country: {
          select: {
            name: true,
            code: true,
            flagUrl: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });
  }

  async findAllSports() {
    return this.prisma.sport.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: { title: 'asc' }
    });
  }
}