"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizationService = void 0;
const common_1 = require("@nestjs/common");
const ru_1 = require("./locales/ru");
const en_1 = require("./locales/en");
let LocalizationService = class LocalizationService {
    constructor() {
        this.locales = {
            ru: ru_1.ruLocale,
            en: en_1.enLocale
        };
        this.defaultLocale = 'ru';
    }
    // Получить переведенный текст с подстановкой переменных
    t(key, locale = this.defaultLocale, params = {}) {
        const keys = key.split('.');
        let value = this.locales[locale] || this.locales[this.defaultLocale];
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined)
                break;
        }
        if (typeof value !== 'string') {
            return key; // Возвращаем ключ, если перевод не найден
        }
        // Подстановка переменных
        return this.interpolate(value, params);
    }
    // Подстановка переменных в строку
    interpolate(template, params) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key]?.toString() || match;
        });
    }
    // Получить локаль пользователя
    getUserLocale(userId) {
        // Здесь можно добавить логику получения локали из БД
        // Пока возвращаем русский по умолчанию
        return 'ru';
    }
    // Установить локаль пользователя
    setUserLocale(userId, locale) {
        // Здесь можно добавить логику сохранения локали в БД
    }
    // Получить доступные локали
    getAvailableLocales() {
        return Object.keys(this.locales);
    }
};
exports.LocalizationService = LocalizationService;
exports.LocalizationService = LocalizationService = __decorate([
    (0, common_1.Injectable)()
], LocalizationService);
