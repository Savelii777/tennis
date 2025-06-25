"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsHandler = void 0;
// src/modules/telegram/handlers/locations.handler.ts
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const base_bot_handler_1 = require("./base-bot.handler");
const locations_service_1 = require("../../locations/application/services/locations.service");
const profile_state_enum_1 = require("../interfaces/profile-state.enum");
let LocationsHandler = class LocationsHandler extends base_bot_handler_1.BaseBotHandler {
    constructor(usersService, ballsService, locationsService) {
        super(usersService, ballsService);
        this.locationsService = locationsService;
    }
    async handleLocations(ctx) {
        this.logger.log('📍 КОРТЫ кнопка нажата');
        try {
            const user = await this.getUser(ctx);
            if (!user) {
                await ctx.reply('❌ Пользователь не найден. Отправьте /start');
                return;
            }
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🔍 Найти корты', 'find_courts')],
                [telegraf_1.Markup.button.callback('📍 Корты рядом', 'nearby_courts')],
                [telegraf_1.Markup.button.callback('⭐ Популярные корты', 'popular_courts')],
                [telegraf_1.Markup.button.callback('➕ Добавить корт', 'add_court')],
            ]);
            await ctx.reply(`📍 **Корты и локации**\n\n` +
                `🎾 Найдите идеальное место для игры!\n\n` +
                `Что вас интересует?`, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка в handleLocations: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке раздела кортов');
        }
    }
    async handleFindCourts(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        this.setUserState(userId, {
            step: profile_state_enum_1.ProfileStep.AWAITING_CITY_SEARCH,
            data: {}
        });
        await ctx.editMessageText(`🔍 **Поиск кортов**\n\n` +
            `Введите название города:`, { parse_mode: 'Markdown' });
    }
    async handleNearbyCourts(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`📍 **Корты рядом**\n\n` +
            `Для определения ближайших кортов\n` +
            `предоставьте геолокацию или укажите адрес.`, {
            parse_mode: 'Markdown',
            reply_markup: telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🗺️ Указать адрес', 'specify_address')],
                [telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_locations')]
            ]).reply_markup
        });
    }
    async handlePopularCourts(ctx) {
        await ctx.answerCbQuery();
        const message = `⭐ **Популярные корты:**\n\n` +
            `🏆 **Теннисный центр "Олимпийский"**\n` +
            `📍 Олимпийский проспект, 16\n` +
            `⭐ 4.9/5.0 • 🎾 12 кортов\n` +
            `💰 2000-3500 руб/час\n` +
            `🏅 Особенности: Крытые корты, Хард, Парковка\n\n` +
            `🥇 **ТЦ "Лужники"**\n` +
            `📍 Лужники, стр. 24\n` +
            `⭐ 4.8/5.0 • 🎾 8 кортов\n` +
            `💰 1800-3000 руб/час\n` +
            `🏅 Особенности: Открытые корты, Грунт\n\n` +
            `🥈 **Теннисный клуб "Невский"**\n` +
            `📍 Невский проспект, 120\n` +
            `⭐ 4.7/5.0 • 🎾 6 кортов\n` +
            `💰 1500-2500 руб/час\n` +
            `🏅 Особенности: Центр города, Хард`;
        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('🔍 Найти другие', 'find_courts')],
                [telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_locations')]
            ]).reply_markup
        });
    }
    async handleAddCourt(ctx) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(`➕ **Добавить корт**\n\n` +
            `Функция в разработке!\n\n` +
            `Скоро вы сможете:\n` +
            `• Добавлять новые корты\n` +
            `• Указывать характеристики\n` +
            `• Загружать фотографии\n` +
            `• Оставлять отзывы`, {
            parse_mode: 'Markdown',
            reply_markup: telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_locations')]
            ]).reply_markup
        });
    }
    async handleSpecifyAddress(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.from)
            return;
        const userId = ctx.from.id.toString();
        this.setUserState(userId, {
            step: profile_state_enum_1.ProfileStep.AWAITING_CITY_SEARCH,
            data: {}
        });
        await ctx.editMessageText(`🗺️ **Укажите адрес**\n\n` +
            `Введите ваш адрес или район:`, { parse_mode: 'Markdown' });
    }
    async handleBackToLocations(ctx) {
        await ctx.answerCbQuery();
        await this.handleLocations(ctx);
    }
    // Метод для обработки поиска города
    async handleCitySearch(ctx, text, userId, userState) {
        try {
            const cities = await this.locationsService.searchCities({
                query: text,
                limit: 5
            });
            if (cities.length === 0) {
                await ctx.reply(`😔 **Город не найден**\n\n` +
                    `Попробуйте ввести название по-другому или выберите из популярных городов.`, {
                    parse_mode: 'Markdown',
                    reply_markup: telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('⭐ Популярные города', 'popular_cities')],
                        [telegraf_1.Markup.button.callback('🔄 Попробовать снова', 'find_courts')]
                    ]).reply_markup
                });
                return;
            }
            let message = `🏙️ **Найденные города:**\n\n`;
            const buttons = [];
            cities.forEach((city, index) => {
                message += `${index + 1}. **${city.name}**, ${city.country.name}\n`;
                message += `👥 Игроков: ${city._count.users}\n\n`;
                buttons.push([telegraf_1.Markup.button.callback(`🎾 ${city.name}`, `city_courts_${city.id}`)]);
            });
            buttons.push([telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_locations')]);
            await ctx.reply(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup
            });
            this.clearUserState(userId);
        }
        catch (error) {
            this.logger.error(`Ошибка поиска города: ${error}`);
            await ctx.reply('❌ Ошибка при поиске города');
            this.clearUserState(userId);
        }
    }
    async handleCityCourts(ctx) {
        await ctx.answerCbQuery();
        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery))
            return;
        const cityId = parseInt(ctx.callbackQuery.data.split('_')[2]);
        try {
            const city = await this.locationsService.getCityById(cityId);
            const message = `🎾 **Корты в городе ${city.name}**\n\n` +
                `📊 **Статистика:**\n` +
                `👥 Игроков в городе: ${city._count.users}\n` +
                `🏙️ Население: ${city.population?.toLocaleString('ru-RU') || 'Не указано'}\n\n` +
                `🏆 **Рекомендуемые корты:**\n\n` +
                `1. **Центральный теннисный клуб**\n` +
                `📍 Центр города\n` +
                `⭐ 4.8/5.0 • 🎾 6 кортов\n` +
                `💰 от 1500 руб/час\n\n` +
                `2. **Спортивный комплекс "Олимп"**\n` +
                `📍 Спортивный район\n` +
                `⭐ 4.6/5.0 • 🎾 4 корта\n` +
                `💰 от 1200 руб/час\n\n` +
                `3. **Теннисная академия**\n` +
                `📍 Жилой район\n` +
                `⭐ 4.7/5.0 • 🎾 8 кортов\n` +
                `💰 от 1800 руб/час`;
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('🔄 Обновить список', `city_courts_${cityId}`)],
                    [telegraf_1.Markup.button.callback('➕ Добавить корт', 'add_court')],
                    [telegraf_1.Markup.button.callback('⬅️ Назад к поиску', 'find_courts')]
                ]).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка получения кортов города: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке кортов');
        }
    }
    async handlePopularCities(ctx) {
        await ctx.answerCbQuery();
        try {
            const cities = await this.locationsService.getPopularCities('RU');
            let message = `⭐ **Популярные города России:**\n\n`;
            const buttons = [];
            cities.forEach((city, index) => {
                message += `${index + 1}. **${city.name}**\n`;
                message += `👥 Игроков: ${city._count.users}\n`;
                message += `🏙️ Население: ${city.population?.toLocaleString('ru-RU')}\n\n`;
                buttons.push([telegraf_1.Markup.button.callback(`🎾 ${city.name}`, `city_courts_${city.id}`)]);
            });
            buttons.push([telegraf_1.Markup.button.callback('⬅️ Назад', 'back_to_locations')]);
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup
            });
        }
        catch (error) {
            this.logger.error(`Ошибка загрузки популярных городов: ${error}`);
            await ctx.reply('❌ Ошибка при загрузке городов');
        }
    }
};
__decorate([
    (0, nestjs_telegraf_1.Action)('find_courts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], LocationsHandler.prototype, "handleFindCourts", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('nearby_courts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], LocationsHandler.prototype, "handleNearbyCourts", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('popular_courts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], LocationsHandler.prototype, "handlePopularCourts", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('add_court'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], LocationsHandler.prototype, "handleAddCourt", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('specify_address'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], LocationsHandler.prototype, "handleSpecifyAddress", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_locations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], LocationsHandler.prototype, "handleBackToLocations", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^city_courts_(\d+)$/),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], LocationsHandler.prototype, "handleCityCourts", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('popular_cities'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], LocationsHandler.prototype, "handlePopularCities", null);
LocationsHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object, locations_service_1.LocationsService])
], LocationsHandler);
exports.LocationsHandler = LocationsHandler;
