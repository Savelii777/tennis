import { Markup } from 'telegraf';
export declare class KeyboardService {
    getMainKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getLevelButtons(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getProfileKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
}
