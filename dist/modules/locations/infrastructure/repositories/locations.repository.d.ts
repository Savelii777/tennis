import { PrismaService } from '../../../../prisma/prisma.service';
import { SearchCitiesParams } from '../../application/services/locations.service';
export declare class LocationsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllCountries(): Promise<(import(".prisma/client").Country & {
        _count: {
            cities: number;
            users: number;
        };
    })[]>;
    findCountryByCode(code: string): Promise<(import(".prisma/client").Country & {
        cities: import(".prisma/client").City[];
    }) | null>;
    searchCities(params: SearchCitiesParams): Promise<(import(".prisma/client").City & {
        _count: {
            users: number;
        };
        country: {
            name: string;
            code: string;
            flagUrl: string | null;
        };
    })[]>;
    getPopularCities(countryCode: string, limit: number): Promise<(import(".prisma/client").City & {
        _count: {
            users: number;
        };
        country: {
            name: string;
            code: string;
            flagUrl: string | null;
        };
    })[]>;
    findCityById(id: number): Promise<(import(".prisma/client").City & {
        _count: {
            users: number;
        };
        country: {
            name: string;
            code: string;
            flagUrl: string | null;
        };
    }) | null>;
    findAllSports(): Promise<(import(".prisma/client").Sport & {
        _count: {
            users: number;
        };
    })[]>;
}
