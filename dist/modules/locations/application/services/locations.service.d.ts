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
            users: number;
            cities: number;
        };
    })[]>;
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
    getPopularCities(countryCode: string): Promise<(import(".prisma/client").City & {
        country: {
            code: string;
            name: string;
            flagUrl: string | null;
        };
        _count: {
            users: number;
        };
    })[]>;
    getAllSports(): Promise<(import(".prisma/client").Sport & {
        _count: {
            users: number;
        };
    })[]>;
    getCityById(id: number): Promise<import(".prisma/client").City & {
        country: {
            code: string;
            name: string;
            flagUrl: string | null;
        };
        _count: {
            users: number;
        };
    }>;
    getCountryByCode(code: string): Promise<import(".prisma/client").Country & {
        cities: import(".prisma/client").City[];
    }>;
}
