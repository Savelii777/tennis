import { LocationsService } from '../application/services/locations.service';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    getCountries(): Promise<(import(".prisma/client").Country & {
        _count: {
            cities: number;
            users: number;
        };
    })[]>;
    searchCities(countryCode?: string, query?: string, limit?: string): Promise<(import(".prisma/client").City & {
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
    getSports(): Promise<(import(".prisma/client").Sport & {
        _count: {
            users: number;
        };
    })[]>;
    getCityById(id: string): Promise<import(".prisma/client").City & {
        _count: {
            users: number;
        };
        country: {
            name: string;
            code: string;
            flagUrl: string | null;
        };
    }>;
}
