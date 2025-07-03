import { PrismaService } from '../../../../prisma/prisma.service';
import { SearchCitiesParams } from '../../application/services/locations.service';
export declare class LocationsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllCountries(): Promise<({
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
    findCountryByCode(code: string): Promise<({
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
    }) | null>;
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
    getPopularCities(countryCode: string, limit: number): Promise<({
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
    findCityById(id: number): Promise<({
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
    }) | null>;
    findAllSports(): Promise<({
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
}
