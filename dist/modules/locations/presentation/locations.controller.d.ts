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
        createdAt: Date;
        countryCode: string;
        timezone: string | null;
        population: number;
        lat: number;
        lng: number;
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
        createdAt: Date;
        countryCode: string;
        timezone: string | null;
        population: number;
        lat: number;
        lng: number;
    })[]>;
    getSports(): Promise<({
        _count: {
            users: number;
        };
    } & {
        title: string;
        id: number;
        createdAt: Date;
        emoji: string | null;
        slug: string;
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
        createdAt: Date;
        countryCode: string;
        timezone: string | null;
        population: number;
        lat: number;
        lng: number;
    }>;
}
