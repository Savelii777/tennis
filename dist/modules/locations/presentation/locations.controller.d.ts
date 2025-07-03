import { LocationsService } from '../application/services/locations.service';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    getCountries(): Promise<({
        _count: {
            users: number;
            cities: number;
        };
    } & {
        name: string;
        id: number;
        createdAt: Date;
        code: string;
        flagUrl: string | null;
    })[]>;
    searchCities(countryCode?: string, query?: string, limit?: string): Promise<({
        country: {
            name: string;
            code: string;
            flagUrl: string | null;
        };
        _count: {
            users: number;
        };
    } & {
        name: string;
        id: number;
        countryCode: string;
        createdAt: Date;
        population: number;
        lat: number;
        lng: number;
        timezone: string | null;
    })[]>;
    getPopularCities(countryCode: string): Promise<({
        country: {
            name: string;
            code: string;
            flagUrl: string | null;
        };
        _count: {
            users: number;
        };
    } & {
        name: string;
        id: number;
        countryCode: string;
        createdAt: Date;
        population: number;
        lat: number;
        lng: number;
        timezone: string | null;
    })[]>;
    getSports(): Promise<({
        _count: {
            users: number;
        };
    } & {
        title: string;
        id: number;
        createdAt: Date;
        slug: string;
        emoji: string | null;
        icon: string | null;
    })[]>;
    getCityById(id: string): Promise<{
        country: {
            name: string;
            code: string;
            flagUrl: string | null;
        };
        _count: {
            users: number;
        };
    } & {
        name: string;
        id: number;
        countryCode: string;
        createdAt: Date;
        population: number;
        lat: number;
        lng: number;
        timezone: string | null;
    }>;
}
