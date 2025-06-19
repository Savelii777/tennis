import { PrismaService } from '../../../../prisma/prisma.service';
import { SearchCitiesParams } from '../../application/services/locations.service';
export declare class LocationsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllCountries(): Promise<(import(".prisma/client").Country & {
        _count: {
            users: number;
            cities: number;
        };
    })[]>;
    findCountryByCode(code: string): Promise<(import(".prisma/client").Country & {
        cities: import(".prisma/client").City[];
    }) | null>;
    searchCities(params: SearchCitiesParams): Promise<(import(".prisma/client").City & {
        country: {
            code: string;
            name: string;
            flagUrl: string | null;
        };
        _count: {
            users: number;
        };
    })[]>;
    getPopularCities(countryCode: string, limit: number): Promise<(import(".prisma/client").City & {
        country: {
            code: string;
            name: string;
            flagUrl: string | null;
        };
        _count: {
            users: number;
        };
    })[]>;
    findCityById(id: number): Promise<(import(".prisma/client").City & {
        country: {
            code: string;
            name: string;
            flagUrl: string | null;
        };
        _count: {
            users: number;
        };
    }) | null>;
    findAllSports(): Promise<(import(".prisma/client").Sport & {
        _count: {
            users: number;
        };
    })[]>;
}
