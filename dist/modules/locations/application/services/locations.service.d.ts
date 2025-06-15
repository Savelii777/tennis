import { LocationsRepository } from '../../infrastructure/repositories/locations.repository';
export interface SearchCitiesParams {
    countryCode?: string;
    query?: string;
    limit?: number;
}
export declare class LocationsService {
    private readonly locationsRepository;
    constructor(locationsRepository: LocationsRepository);
    getAllCountries(): Promise<(import(".prisma/client").Country & {
        _count: {
            cities: number;
            users: number;
        };
    })[]>;
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
    getPopularCities(countryCode: string): Promise<(import(".prisma/client").City & {
        _count: {
            users: number;
        };
        country: {
            name: string;
            code: string;
            flagUrl: string | null;
        };
    })[]>;
    getAllSports(): Promise<(import(".prisma/client").Sport & {
        _count: {
            users: number;
        };
    })[]>;
    getCityById(id: number): Promise<import(".prisma/client").City & {
        _count: {
            users: number;
        };
        country: {
            name: string;
            code: string;
            flagUrl: string | null;
        };
    }>;
    getCountryByCode(code: string): Promise<import(".prisma/client").Country & {
        cities: import(".prisma/client").City[];
    }>;
}
