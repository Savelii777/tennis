import { LocationsRepository } from '../../infrastructure/repositories/locations.repository';
export interface SearchCitiesParams {
    countryCode?: string;
    query?: string;
    limit?: number;
}
export declare class LocationsService {
    private readonly locationsRepository;
    constructor(locationsRepository: LocationsRepository);
    getAllCountries(): Promise<({
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
    searchCities(params: SearchCitiesParams): Promise<({
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
    getAllSports(): Promise<({
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
    getCityById(id: number): Promise<{
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
    getCountryByCode(code: string): Promise<{
        cities: {
            name: string;
            id: number;
            countryCode: string;
            createdAt: Date;
            population: number;
            lat: number;
            lng: number;
            timezone: string | null;
        }[];
    } & {
        name: string;
        id: number;
        createdAt: Date;
        code: string;
        flagUrl: string | null;
    }>;
}
