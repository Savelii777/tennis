"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedLocations = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedLocations() {
    console.log('🌍 Seeding countries...');
    // Создаем страны
    const countries = [
        { name: 'Russia', code: 'RU', flagUrl: '🇷🇺' },
        { name: 'United States', code: 'US', flagUrl: '🇺🇸' },
        { name: 'Spain', code: 'ES', flagUrl: '🇪🇸' },
        { name: 'France', code: 'FR', flagUrl: '🇫🇷' },
        { name: 'Germany', code: 'DE', flagUrl: '🇩🇪' },
        { name: 'Italy', code: 'IT', flagUrl: '🇮🇹' },
        { name: 'United Kingdom', code: 'GB', flagUrl: '🇬🇧' },
        { name: 'Brazil', code: 'BR', flagUrl: '🇧🇷' },
        { name: 'Argentina', code: 'AR', flagUrl: '🇦🇷' },
        { name: 'Australia', code: 'AU', flagUrl: '🇦🇺' },
    ];
    for (const country of countries) {
        await prisma.country.upsert({
            where: { code: country.code },
            update: {},
            create: country,
        });
    }
    console.log('🏙️ Seeding cities...');
    // Создаем города (примеры крупных городов)
    const cities = [
        // Россия
        { name: 'Moscow', countryCode: 'RU', population: 12506468, lat: 55.7558, lng: 37.6173 },
        { name: 'Saint Petersburg', countryCode: 'RU', population: 5383890, lat: 59.9311, lng: 30.3609 },
        { name: 'Novosibirsk', countryCode: 'RU', population: 1625631, lat: 55.0084, lng: 82.9357 },
        { name: 'Yekaterinburg', countryCode: 'RU', population: 1493749, lat: 56.8431, lng: 60.6454 },
        // США
        { name: 'New York', countryCode: 'US', population: 8336817, lat: 40.7128, lng: -74.0060 },
        { name: 'Los Angeles', countryCode: 'US', population: 3979576, lat: 34.0522, lng: -118.2437 },
        { name: 'Chicago', countryCode: 'US', population: 2693976, lat: 41.8781, lng: -87.6298 },
        { name: 'Miami', countryCode: 'US', population: 463347, lat: 25.7617, lng: -80.1918 },
        // Испания
        { name: 'Madrid', countryCode: 'ES', population: 3223334, lat: 40.4168, lng: -3.7038 },
        { name: 'Barcelona', countryCode: 'ES', population: 1620343, lat: 41.3851, lng: 2.1734 },
        { name: 'Valencia', countryCode: 'ES', population: 791413, lat: 39.4699, lng: -0.3763 },
        // Германия
        { name: 'Berlin', countryCode: 'DE', population: 3669491, lat: 52.5200, lng: 13.4050 },
        { name: 'Hamburg', countryCode: 'DE', population: 1899160, lat: 53.5511, lng: 9.9937 },
        { name: 'Munich', countryCode: 'DE', population: 1471508, lat: 48.1351, lng: 11.5820 },
        // Франция
        { name: 'Paris', countryCode: 'FR', population: 2165423, lat: 48.8566, lng: 2.3522 },
        { name: 'Marseille', countryCode: 'FR', population: 861635, lat: 43.2965, lng: 5.3698 },
        { name: 'Lyon', countryCode: 'FR', population: 513275, lat: 45.7640, lng: 4.8357 },
    ];
    for (const city of cities) {
        await prisma.city.upsert({
            where: {
                name_countryCode: {
                    name: city.name,
                    countryCode: city.countryCode
                }
            },
            update: {},
            create: city,
        });
    }
    console.log('🎾 Seeding sports...');
    // Создаем виды спорта
    const sports = [
        { title: 'Tennis', slug: 'tennis', emoji: '🎾' },
        { title: 'Padel', slug: 'padel', emoji: '🥎' },
    ];
    for (const sport of sports) {
        await prisma.sport.upsert({
            where: { slug: sport.slug },
            update: {},
            create: sport,
        });
    }
    console.log('✅ Locations seeded successfully!');
}
exports.seedLocations = seedLocations;
