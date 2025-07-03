import { Markup } from 'telegraf';
export declare class KeyboardService {
    getMainKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getLevelButtons(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getProfileKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    /**
     * Клавиатура для публичного профиля (чужой профиль)
     */
    getPublicProfileKeyboard(targetUserId: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
}
