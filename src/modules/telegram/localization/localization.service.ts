import { Injectable } from '@nestjs/common';
import { ruLocale } from './locales/ru';
import { enLocale } from './locales/en';

export type Locale = 'ru' | 'en';
export type LocaleData = typeof ruLocale;

@Injectable()
export class LocalizationService {
  private locales: Record<Locale, LocaleData> = {
    ru: ruLocale,
    en: enLocale
  };

  private defaultLocale: Locale = 'ru';

  // Получить переведенный текст с подстановкой переменных
  t(
    key: string, 
    locale: Locale = this.defaultLocale, 
    params: Record<string, any> = {}
  ): string {
    const keys = key.split('.');
    let value: any = this.locales[locale] || this.locales[this.defaultLocale];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (typeof value !== 'string') {
      return key; // Возвращаем ключ, если перевод не найден
    }
    
    // Подстановка переменных
    return this.interpolate(value, params);
  }

  // Подстановка переменных в строку
  private interpolate(template: string, params: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  // Получить локаль пользователя
  getUserLocale(userId: string): Locale {
    // Здесь можно добавить логику получения локали из БД
    // Пока возвращаем русский по умолчанию
    return 'ru';
  }

  // Установить локаль пользователя
  setUserLocale(userId: string, locale: Locale): void {
    // Здесь можно добавить логику сохранения локали в БД
  }

  // Получить доступные локали
  getAvailableLocales(): Locale[] {
    return Object.keys(this.locales) as Locale[];
  }
}