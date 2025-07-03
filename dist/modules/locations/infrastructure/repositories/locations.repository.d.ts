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
            createdAt: Date;
            countryCode: string;
            timezone: string | null;
            population: number;
            lat: number;
            lng: number;
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
        createdAt: Date;
        countryCode: string;
        timezone: string | null;
        population: number;
        lat: number;
        lng: number;
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
        createdAt: Date;
        countryCode: string;
        timezone: string | null;
        population: number;
        lat: number;
        lng: number;
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
        createdAt: Date;
        countryCode: string;
        timezone: string | null;
        population: number;
        lat: number;
        lng: number;
    }) | null>;
    findAllSports(): Promise<({
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
}
