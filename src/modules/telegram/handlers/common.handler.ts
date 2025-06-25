import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf, Markup } from 'telegraf';
import { Start, Command } from 'nestjs-telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
import { UsersService } from '../../users/application/services/users.service';
import { BallsService } from '../../users/application/services/balls.service';
import { NotificationsService } from '../../notifications/application/services/notifications.service';
import { TelegramService } from '../telegram.service';
import { ReferralsService } from '../../referrals/application/services/referrals.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CommonHandler {
  private readonly logger = new Logger(CommonHandler.name);

  constructor(
    private readonly stateService: StateService,
    private readonly keyboardService: KeyboardService,
    private readonly usersService: UsersService,
    private readonly ballsService: BallsService,
    private readonly notificationsService: NotificationsService,
    private readonly telegramService: TelegramService,
    private readonly referralsService: ReferralsService,
    private readonly prisma: PrismaService
  ) {}

  register(bot: Telegraf<Context>) {
    // Регистрируем действия
    bot.action('back_to_profile', this.handleBackToProfile.bind(this));
    bot.command('menu', this.handleMenu.bind(this));
  }

  @Start()
  async handleStart(ctx: Context) {
    this.logger.log('🚀 Команда /start получена');
    
    if (!ctx.from) {
      this.logger.error('❌ Нет данных пользователя');
      return;
    }
    
    const telegramId = ctx.from.id.toString();
    let telegramChatId = ctx.chat?.id.toString();
    
    // Обрабатываем стартовую команду с реферальным кодом
    let startPayload = '';
    if ('startPayload' in ctx && ctx.startPayload) {
      startPayload = typeof ctx.startPayload === 'string' ? ctx.startPayload : '';
      this.logger.log(`📦 Получен payload: ${startPayload}`);
    }
    
    // Проверяем, существует ли пользователь
    let user = await this.usersService.findByTelegramId(telegramId);
    
    if (!user) {
      this.logger.log('🆕 Новый пользователь, создаем...');
      
      // Создаем данные для нового пользователя
      const userData = {
        telegram_id: telegramId,
        telegramChatId: telegramChatId ? BigInt(telegramChatId) : undefined,
        username: ctx.from.username || '',
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name || undefined,
        photo_url: ''
      };

      // Создаем пользователя
      user = await this.usersService.create(userData);
      this.logger.log('✅ Новый пользователь создан');

      // Сохраняем chat_id для уведомлений
      if (telegramChatId) {
        await this.usersService.updateTelegramChatId(user.id.toString(), parseInt(telegramChatId));
        this.logger.log(`💬 Сохранен chat_id: ${telegramChatId}`);
      }

      // Обработка реферального кода
      if (startPayload && startPayload.startsWith('ref_')) {
        const referralCode = startPayload.replace('ref_', '');
        this.logger.log(`🔗 Обнаружен реферальный код: ${referralCode}`);
        
        try {
          // Находим пользователя по реферальному коду
          const referrer = await this.referralsService.findUserByReferralCode(referralCode);
          
          if (referrer && referrer.id !== user.id) {
            // Создаем реферальную связь
            await this.referralsService.createReferral({
              referrerId: referrer.id,
              referredId: user.id
            });
            
            // Начисляем бонусы рефереру
            const referralBonus = 50;
            await this.ballsService.addBalls(
              referrer.id.toString(),
              referralBonus,
              'REFERRAL',
              `Бонус за приглашение ${user.first_name}`
            );
            
            // Уведомляем реферера
            if (this.notificationsService) {
            await this.notificationsService.createNotification({
              userId: referrer.id,
              message: `Новый реферал: ${user.first_name} зарегистрировался по вашему приглашению! +${referralBonus} мячей`,
              type: 'REFERRAL_BONUS'
              // Убираем поле data, если оно не определено в типе CreateNotificationData
            });
            }
            
            // Начисляем стартовый бонус новому пользователю
            const startBonus = 50;
            await this.ballsService.addBalls(
              user.id.toString(),
              startBonus,
              'REFERRAL',
              `Бонус за регистрацию по приглашению`
            );
            
            await ctx.reply(
              `🎾 **Добро пожаловать в Tennis Bot, ${user.first_name}!**\n\n` +
              `✅ Вы зарегистрировались по приглашению!\n` +
              `🎁 Бонус: ${startBonus} мячей\n\n` +
              `Для начала давайте настроим ваш профиль!`,
              { 
                parse_mode: 'Markdown',
                reply_markup: Markup.inlineKeyboard([
                  [Markup.button.callback('🔄 Настроить профиль', 'setup_profile')]
                ]).reply_markup
              }
            );
            
            return;
          }
        } catch (error) {
          this.logger.error(`Ошибка обработки реферального кода: ${error}`);
        }
      } else {
        // Обычная регистрация без реферала
        await ctx.reply(
          `🎾 **Добро пожаловать в Tennis Bot, ${ctx.from.first_name}!**\n\n` +
          `✅ Вы успешно зарегистрированы!\n\n` +
          `🎾 Что вы можете делать:\n` +
          `• Искать партнеров для игры\n` +
          `• Участвовать в турнирах\n` +
          `• Записывать результаты матчей\n` +
          `• Зарабатывать мячи и открывать кейсы\n` +
          `• Получать советы от AI-Coach\n\n` +
          `Для начала давайте настроим ваш профиль!`,
          { 
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('🔄 Настроить профиль', 'setup_profile')]
            ]).reply_markup
          }
        );

        // Начисляем стартовый бонус
        const startBonus = 100;
        await this.ballsService.addBalls(
          user.id.toString(),
          startBonus,
          'BONUS',
          'Стартовый бонус за регистрацию'
        );
      }
    } else {
      this.logger.log('Пользователь уже существует');
      
      // Обновляем chat_id если он изменился
      if (telegramChatId && user.telegramChatId !== BigInt(telegramChatId)) {
        await this.usersService.updateTelegramChatId(user.id.toString(), parseInt(telegramChatId));
        this.logger.log(`💬 Обновлен chat_id для пользователя ${user.id}: ${telegramChatId}`);
      }

      // Включаем уведомления, если пользователь снова запустил бота
      if (this.telegramService) {
        await this.telegramService.toggleNotifications(user.id, true);
      }
      
      // Получаем статистику для приветствия
      const ballsBalance = await this.ballsService.getUserBalance(user.id.toString());
      const unreadNotifications = this.notificationsService 
        ? await this.notificationsService.getUnreadCount(user.id)
        : 0;

      let welcomeMessage = `👋 **С возвращением, ${user.first_name}!**\n\n`;
      
      // Добавляем информацию о балансе
      if (ballsBalance > 0) {
        welcomeMessage += `🎾 **Баланс:** ${ballsBalance} мячей\n`;
      }
      
      // Добавляем информацию о непрочитанных уведомлениях
      if (unreadNotifications > 0) {
        welcomeMessage += `🔔 **Новых уведомлений:** ${unreadNotifications}\n`;
      }
      
      welcomeMessage += `\nВыберите действие:`;

      await ctx.reply(welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: this.keyboardService.getMainKeyboard().reply_markup
      });
    }
  }

  async handleMenu(ctx: Context) {
    try {
      await ctx.reply(
        `🎾 **Главное меню**\n\n` +
        `Выберите действие:`,
        {
          parse_mode: 'Markdown',
          reply_markup: this.keyboardService.getMainKeyboard().reply_markup
        }
      );
    } catch (error) {
      this.logger.error(`Ошибка в handleMenu: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке меню');
    }
  }

  async handleBackToProfile(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;

      // Используем ProfileHandler для отображения профиля
      // В настоящей реализации лучше инжектировать ProfileHandler, 
      // но для примера вызовем снова текущий метод
      
      await ctx.reply(
        `Возвращаемся к профилю...`,
        {
          parse_mode: 'Markdown',
          reply_markup: this.keyboardService.getMainKeyboard().reply_markup
        }
      );
      
      // Эмулируем нажатие кнопки "Профиль"
      await ctx.reply('👤 Профиль');
    } catch (error) {
      this.logger.error(`Ошибка в handleBackToProfile: ${error}`);
      await ctx.reply('❌ Ошибка при возврате к профилю');
    }
  }

  async handleInviteButton(ctx: Context) {
    try {
      if (!ctx.from) return;

      const userId = ctx.from.id.toString();
      const user = await this.usersService.findByTelegramId(userId);
      
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }

      // Предположим, что referralCode это поле у пользователя
      const referralCode = `ref_${userId}`;
      const botName = process.env.TELEGRAM_BOT_USERNAME || 'your_bot_name';
      const inviteLink = `https://t.me/${botName}?start=${referralCode}`;

      await ctx.reply(
        `🔗 **Пригласите друга и получите бонусы!**\n\n` +
        `За каждого приглашенного друга вы получите 50 мячей.\n\n` +
        `Ваша реферальная ссылка:\n` +
        `${inviteLink}\n\n` +
        `Скопируйте ссылку и отправьте друзьям!`,
        { parse_mode: 'Markdown' }
      );

    } catch (error) {
      this.logger.error(`Ошибка в handleInviteButton: ${error}`);
      await ctx.reply('❌ Ошибка при создании приглашения');
    }
  }

  // Вспомогательные методы
  getLevelText(level: string): string {
    const levels = {
      'BEGINNER': 'Начинающий',
      'AMATEUR': 'Любитель',
      'CONFIDENT': 'Уверенный',
      'TOURNAMENT': 'Турнирный',
      'SEMI_PRO': 'Полупрофессионал',
      'ANY': 'Любой'
    };
    
    return levels[level as keyof typeof levels] || 'Не указан';
  }
}