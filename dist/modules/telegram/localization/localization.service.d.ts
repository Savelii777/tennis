import { ruLocale } from './locales/ru';
export type Locale = 'ru' | 'en';
export type LocaleData = typeof ruLocale;
export declare class LocalizationService {
    private locales;
    private defaultLocale;
    t(key: string, locale?: Locale, params?: Record<string, any>): string;
    private interpolate;
    getUserLocale(userId: string): Locale;
    setUserLocale(userId: string, locale: Locale): void;
    getAvailableLocales(): Locale[];
}
