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
exports.LocationsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let LocationsRepository = class LocationsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async findCountryByCode(code) {
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
    async searchCities(params) {
        const { countryCode, query, limit = 10 } = params;
        const where = {
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
    async getPopularCities(countryCode, limit) {
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
    async findCityById(id) {
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
};
LocationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationsRepository);
exports.LocationsRepository = LocationsRepository;
