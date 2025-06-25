"use strict";
// // src/modules/telegram/handlers/settings.handler.ts
// import { Injectable } from '@nestjs/common';
// import { Action } from 'nestjs-telegraf';
// import { Context, Markup } from 'telegraf';
// import { BaseBotHandler } from './base-bot.handler';
// import { SettingsService } from '../../settings/settings.service';
// import { ProfileStep } from '../interfaces/profile-state.enum';
// @Injectable()
// export class SettingsHandler extends BaseBotHandler {
//   constructor(
//     usersService: any,
//     ballsService: any,
//     private readonly settingsService: SettingsService,
//   ) {
//     super(usersService, ballsService);
//   }
//   async handleSettings(ctx: Context) {
//     this.logger.log('⚙️ НАСТРОЙКИ кнопка нажата');
//     try {
//       const user = await this.getUser(ctx);
//       if (!user) {
//         await ctx.reply('❌ Пользователь не найден. Отправьте /start');
//         return;
//       }
//       const keyboard = Markup.inlineKeyboard([
//         [Markup.button.callback('🧑 Профиль', 'settings_profile')],
//         [Markup.button.callback('🔔 Уведомления', 'settings_notifications')],
//         [Markup.button.callback('🎯 Предпочтения', 'settings_preferences')],
//         [Markup.button.callback('🌐 Язык', 'settings_language')],
//         [Markup.button.callback('🔒 Приватность', 'settings_privacy')],
//       ]);
//       await ctx.reply(
//         `⚙️ **Настройки**\n\n` +
//         `Здесь вы можете настроить бота под себя:\n\n` +
//         `🧑 **Профиль** - изменить личные данные\n` +
//         `🔔 **Уведомления** - управление push-сообщениями\n` +
//         `🎯 **Предпочтения** - поиск партнеров\n` +
//         `🌐 **Язык** - выбор языка интерфейса\n` +
//         `🔒 **Приватность** - видимость профиля\n\n` +
//         `Выберите раздел для настройки:`,
//         {
//           parse_mode: 'Markdown',
//           reply_markup: keyboard.reply_markup
//         }
//       );
//     } catch (error) {
//       this.logger.error(`Ошибка в handleSettings: ${error}`);
//       await ctx.reply('❌ Ошибка при загрузке настроек');
//     }
//   }
//   // ==================== ОБРАБОТКА ТЕКСТОВЫХ СОСТОЯНИЙ ====================
//   async handleTextState(ctx: Context, userState: any): Promise<void> {
//     if (!ctx.message || !('text' in ctx.message)) return;
//     if (!ctx.from) return;
//     const text = ctx.message.text;
//     const userId = ctx.from.id.toString();
//     switch (userState.step) {
//       case ProfileStep.AWAITING_NEW_NAME:
//         await this.processNewName(ctx, text, userId);
//         break;
//       case ProfileStep.AWAITING_NEW_CITY:
//         await this.processNewCity(ctx, text, userId);
//         break;
//       case ProfileStep.AWAITING_NEW_BIO:
//         await this.processNewBio(ctx, text, userId);
//         break;
//       default:
//         this.logger.warn(`Неизвестное состояние: ${userState.step}`);
//         await ctx.reply('❌ Произошла ошибка. Попробуйте снова.');
//         this.clearUserState(userId);
//         break;
//     }
//   }
//   private async processNewName(ctx: Context, text: string, userId: string) {
//     try {
//       const user = await this.getUser(ctx);
//       if (!user) return;
//       // Используем существующий метод update из UsersService
//       await this.usersService.update(user.id.toString(), {
//         first_name: text.trim()
//       });
//       await ctx.reply(
//         `✅ **Имя обновлено!**\n\n` +
//         `Новое имя: **${text.trim()}**`,
//         { 
//           parse_mode: 'Markdown',
//           reply_markup: Markup.inlineKeyboard([
//             [Markup.button.callback('⬅️ Назад к настройкам', 'back_to_settings')]
//           ]).reply_markup
//         }
//       );
//       this.clearUserState(userId);
//     } catch (error) {
//       this.logger.error(`Ошибка обновления имени: ${error}`);
//       await ctx.reply('❌ Ошибка при обновлении имени');
//       this.clearUserState(userId);
//     }
//   }
//   private async processNewCity(ctx: Context, text: string, userId: string) {
//     try {
//       const user = await this.getUser(ctx);
//       if (!user) return;
//       // Обновляем настройки пользователя через SettingsService
//       await this.settingsService.updateSettings(user.id, {
//         cityId: null, // Можно добавить поиск города по названию
//         language: 'ru' // сохраняем существующий язык
//       });
//       await ctx.reply(
//         `✅ **Город обновлен!**\n\n` +
//         `Новый город: **${text.trim()}**`,
//         { 
//           parse_mode: 'Markdown',
//           reply_markup: Markup.inlineKeyboard([
//             [Markup.button.callback('⬅️ Назад к настройкам', 'back_to_settings')]
//           ]).reply_markup
//         }
//       );
//       this.clearUserState(userId);
//     } catch (error) {
//       this.logger.error(`Ошибка обновления города: ${error}`);
//       await ctx.reply('❌ Ошибка при обновлении города');
//       this.clearUserState(userId);
//     }
//   }
//   private async processNewBio(ctx: Context, text: string, userId: string) {
//     try {
//       const user = await this.getUser(ctx);
//       if (!user) return;
//       // Можно сохранить bio в настройках или профиле пользователя
//       await ctx.reply(
//         `✅ **Описание обновлено!**\n\n` +
//         `Новое описание: **${text.trim()}**`,
//         { 
//           parse_mode: 'Markdown',
//           reply_markup: Markup.inlineKeyboard([
//             [Markup.button.callback('⬅️ Назад к настройкам', 'back_to_settings')]
//           ]).reply_markup
//         }
//       );
//       this.clearUserState(userId);
//     } catch (error) {
//       this.logger.error(`Ошибка обновления описания: ${error}`);
//       await ctx.reply('❌ Ошибка при обновлении описания');
//       this.clearUserState(userId);
//     }
//   }
//   // ==================== ACTION ОБРАБОТЧИКИ ====================
//   @Action('settings_profile')
//   async handleSettingsProfile(ctx: Context) {
//     this.logger.log('🎯 Action: settings_profile');
//     await ctx.answerCbQuery();
//     await ctx.editMessageText(
//       `🧑 **Настройки профиля**\n\n` +
//       `Что хотите изменить?`,
//       { 
//         parse_mode: 'Markdown',
//         reply_markup: Markup.inlineKeyboard([
//           [Markup.button.callback('📝 Имя', 'change_name')],
//           [Markup.button.callback('🏙️ Город', 'change_city')],
//           [Markup.button.callback('📖 О себе', 'change_bio')],
//           [Markup.button.callback('⬅️ Назад', 'back_to_settings')]
//         ]).reply_markup
//       }
//     );
//   }
//   @Action('settings_notifications')
//   async handleSettingsNotifications(ctx: Context) {
//     this.logger.log('🎯 Action: settings_notifications');
//     await ctx.answerCbQuery();
//     try {
//       const user = await this.getUser(ctx);
//       if (!user) return;
//       // Получаем текущие настройки
//       const settings = await this.settingsService.getSettings(user.id);
//       const telegramStatus = settings?.notifyTelegram ? '✅' : '❌';
//       const emailStatus = settings?.notifyEmail ? '✅' : '❌';
//       const allNotifications = settings?.notificationsEnabled ? '✅' : '❌';
//       await ctx.editMessageText(
//         `🔔 **Настройки уведомлений**\n\n` +
//         `${allNotifications} Все уведомления\n` +
//         `${telegramStatus} Telegram уведомления\n` +
//         `${emailStatus} Email уведомления\n\n` +
//         `Выберите что изменить:`,
//         { 
//           parse_mode: 'Markdown',
//           reply_markup: Markup.inlineKeyboard([
//             [Markup.button.callback('🔔 Все уведомления', 'toggle_all_notifications')],
//             [Markup.button.callback('📱 Telegram', 'toggle_telegram_notifications')],
//             [Markup.button.callback('📧 Email', 'toggle_email_notifications')],
//             [Markup.button.callback('⬅️ Назад', 'back_to_settings')]
//           ]).reply_markup
//         }
//       );
//     } catch (error) {
//       this.logger.error(`Ошибка загрузки настроек уведомлений: ${error}`);
//       await ctx.editMessageText(
//         `🔔 **Настройки уведомлений**\n\n` +
//         `Функция настройки уведомлений временно недоступна.`,
//         { 
//           parse_mode: 'Markdown',
//           reply_markup: Markup.inlineKeyboard([
//             [Markup.button.callback('⬅️ Назад', 'back_to_settings')]
//           ]).reply_markup
//         }
//       );
//     }
//   }
//   @Action('settings_preferences')
//   async handleSettingsPreferences(ctx: Context) {
//     this.logger.log('🎯 Action: settings_preferences');
//     await ctx.answerCbQuery();
//     await ctx.editMessageText(
//       `🎯 **Предпочтения**\n\n` +
//       `Функция настройки предпочтений в разработке!\n\n` +
//       `Скоро вы сможете настроить:\n` +
//       `• Предпочитаемый уровень игры\n` +
//       `• Время для игры\n` +
//       `• Тип покрытия корта\n` +
//       `• Максимальное расстояние`,
//       { 
//         parse_mode: 'Markdown',
//         reply_markup: Markup.inlineKeyboard([
//           [Markup.button.callback('⬅️ Назад', 'back_to_settings')]
//         ]).reply_markup
//       }
//     );
//   }
//   @Action('settings_language')
//   async handleSettingsLanguage(ctx: Context) {
//     this.logger.log('🎯 Action: settings_language');
//     await ctx.answerCbQuery();
//     try {
//       const user = await this.getUser(ctx);
//       if (!user) return;
//       const settings = await this.settingsService.getSettings(user.id);
//       const currentLang = settings?.language || 'ru';
//       await ctx.editMessageText(
//         `🌐 **Язык интерфейса**\n\n` +
//         `Текущий язык: **${currentLang === 'ru' ? 'Русский' : 'English'}**\n\n` +
//         `Выберите язык:`,
//         { 
//           parse_mode: 'Markdown',
//           reply_markup: Markup.inlineKeyboard([
//             [Markup.button.callback(currentLang === 'ru' ? '🇷🇺 Русский ✅' : '🇷🇺 Русский', 'set_language_ru')],
//             [Markup.button.callback(currentLang === 'en' ? '🇬🇧 English ✅' : '🇬🇧 English', 'set_language_en')],
//             [Markup.button.callback('⬅️ Назад', 'back_to_settings')]
//           ]).reply_markup
//         }
//       );
//     } catch (error) {
//       this.logger.error(`Ошибка загрузки языковых настроек: ${error}`);
//       await ctx.editMessageText(
//         `🌐 **Язык интерфейса**\n\n` +
//         `Выберите язык:`,
//         { 
//           parse_mode: 'Markdown',
//           reply_markup: Markup.inlineKeyboard([
//             [Markup.button.callback('🇷🇺 Русский ✅', 'set_language_ru')],
//             [Markup.button.callback('🇬🇧 English', 'set_language_en')],
//             [Markup.button.callback('⬅️ Назад', 'back_to_settings')]
//           ]).reply_markup
//         }
//       );
//     }
//   }
//   @Action('settings_privacy')
//   async handleSettingsPrivacy(ctx: Context) {
//     this.logger.log('🎯 Action: settings_privacy');
//     await ctx.answerCbQuery();
//     await ctx.editMessageText(
//       `🔒 **Приватность**\n\n` +
//       `👁️ **Профиль:** Публичный\n` +
//       `📊 **Статистика:** Показывается\n` +
//       `🎮 **Приглашения:** Разрешены\n\n` +
//       `Функция настройки приватности в разработке!`,
//       { 
//         parse_mode: 'Markdown',
//         reply_markup: Markup.inlineKeyboard([
//           [Markup.button.callback('⬅️ Назад', 'back_to_settings')]
//         ]).reply_markup
//       }
//     );
//   }
//   // ==================== ОБРАБОТЧИКИ ИЗМЕНЕНИЙ ====================
//   @Action('toggle_all_notifications')
//   async handleToggleAllNotifications(ctx: Context) {
//     await ctx.answerCbQuery();
//     try {
//       const user = await this.getUser(ctx);
//       if (!user) return;
//       const settings = await this.settingsService.getSettings(user.id);
//       const newValue = !settings?.notificationsEnabled;
//       await this.settingsService.updateSettings(user.id, {
//         notificationsEnabled: newValue
//       });
//       await ctx.answerCbQuery(`Все уведомления ${newValue ? 'включены' : 'отключены'}`);
//       await this.handleSettingsNotifications(ctx);
//     } catch (error) {
//       this.logger.error(`Ошибка переключения всех уведомлений: ${error}`);
//       await ctx.answerCbQuery('❌ Ошибка при изменении настроек');
//     }
//   }
//   @Action('toggle_telegram_notifications')
//   async handleToggleTelegramNotifications(ctx: Context) {
//     await ctx.answerCbQuery();
//     try {
//       const user = await this.getUser(ctx);
//       if (!user) return;
//       const settings = await this.settingsService.getSettings(user.id);
//       const newValue = !settings?.notifyTelegram;
//       await this.settingsService.updateSettings(user.id, {
//         notifyTelegram: newValue
//       });
//       await ctx.answerCbQuery(`Telegram уведомления ${newValue ? 'включены' : 'отключены'}`);
//       await this.handleSettingsNotifications(ctx);
//     } catch (error) {
//       this.logger.error(`Ошибка переключения Telegram уведомлений: ${error}`);
//       await ctx.answerCbQuery('❌ Ошибка при изменении настроек');
//     }
//   }
//   @Action('toggle_email_notifications')
//   async handleToggleEmailNotifications(ctx: Context) {
//     await ctx.answerCbQuery();
//     try {
//       const user = await this.getUser(ctx);
//       if (!user) return;
//       const settings = await this.settingsService.getSettings(user.id);
//       const newValue = !settings?.notifyEmail;
//       await this.settingsService.updateSettings(user.id, {
//         notifyEmail: newValue
//       });
//       await ctx.answerCbQuery(`Email уведомления ${newValue ? 'включены' : 'отключены'}`);
//       await this.handleSettingsNotifications(ctx);
//     } catch (error) {
//       this.logger.error(`Ошибка переключения Email уведомлений: ${error}`);
//       await ctx.answerCbQuery('❌ Ошибка при изменении настроек');
//     }
//   }
//   @Action('set_language_ru')
//   async handleSetLanguageRu(ctx: Context) {
//     await ctx.answerCbQuery();
//     try {
//       const user = await this.getUser(ctx);
//       if (!user) return;
//       await this.settingsService.updateSettings(user.id, {
//         language: 'ru'
//       });
//       await ctx.answerCbQuery('Язык изменен на русский');
//       await this.handleSettingsLanguage(ctx);
//     } catch (error) {
//       this.logger.error(`Ошибка смены языка: ${error}`);
//       await ctx.answerCbQuery('❌ Ошибка при изменении языка');
//     }
//   }
//   @Action('set_language_en')
//   async handleSetLanguageEn(ctx: Context) {
//     await ctx.answerCbQuery();
//     try {
//       const user = await this.getUser(ctx);
//       if (!user) return;
//       await this.settingsService.updateSettings(user.id, {
//         language: 'en'
//       });
//       await ctx.answerCbQuery('Language changed to English');
//       await this.handleSettingsLanguage(ctx);
//     } catch (error) {
//       this.logger.error(`Ошибка смены языка: ${error}`);
//       await ctx.answerCbQuery('❌ Error changing language');
//     }
//   }
//   @Action('change_name')
//   async handleChangeName(ctx: Context) {
//     await ctx.answerCbQuery();
//     if (!ctx.from) return;
//     const userId = ctx.from.id.toString();
//     this.setUserState(userId, {
//       step: ProfileStep.AWAITING_NEW_NAME,
//       data: {}
//     });
//     await ctx.editMessageText(
//       `📝 **Изменение имени**\n\n` +
//       `Введите новое имя:`,
//       { parse_mode: 'Markdown' }
//     );
//   }
//   @Action('change_city')
//   async handleChangeCity(ctx: Context) {
//     await ctx.answerCbQuery();
//     if (!ctx.from) return;
//     const userId = ctx.from.id.toString();
//     this.setUserState(userId, {
//       step: ProfileStep.AWAITING_NEW_CITY,
//       data: {}
//     });
//     await ctx.editMessageText(
//       `🏙️ **Изменение города**\n\n` +
//       `Введите название города:`,
//       { parse_mode: 'Markdown' }
//     );
//   }
//   @Action('change_bio')
//   async handleChangeBio(ctx: Context) {
//     await ctx.answerCbQuery();
//     if (!ctx.from) return;
//     const userId = ctx.from.id.toString();
//     this.setUserState(userId, {
//       step: ProfileStep.AWAITING_NEW_BIO,
//       data: {}
//     });
//     await ctx.editMessageText(
//       `📖 **Изменение описания**\n\n` +
//       `Расскажите о себе (опыт игры, любимые корты, цели):`,
//       { parse_mode: 'Markdown' }
//     );
//   }
//   @Action('back_to_settings')
//   async handleBackToSettings(ctx: Context) {
//     this.logger.log('🎯 Action: back_to_settings');
//     await ctx.answerCbQuery();
//     await this.handleSettings(ctx);
//   }
// }
