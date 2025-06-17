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
        country: {
            name: string;
            code: string;
            flagUrl: string | null;
        };
        _count: {
            users: number;
        };
    })[]>;
    getPopularCities(countryCode: string): Promise<(import(".prisma/client").City & {
        country: {
            name: string;
            code: string;
            flagUrl: string | null;
        };
        _count: {
            users: number;
        };
    })[]>;
    getSports(): Promise<(import(".prisma/client").Sport & {
        _count: {
            users: number;
        };
    })[]>;
    getCityById(id: string): Promise<import(".prisma/client").City & {
        country: {
            name: string;
            code: string;
            flagUrl: string | null;
        };
        _count: {
            users: number;
        };
    }>;
}
