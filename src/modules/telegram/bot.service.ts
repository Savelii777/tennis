import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectBot, Start, Command, Hears, On, Update, Action } from 'nestjs-telegraf';
import { Telegraf, Markup, Context } from 'telegraf';
import { UsersService } from '../users/application/services/users.service';
import { ProfileStep, UserState } from './interfaces/user-state.interface';

@Update()
@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  
  // Храним состояния пользователей в памяти (в продакшене лучше использовать Redis)
  private userStates = new Map<string, UserState>();

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    this.logger.log('🚀 BotService инициализирован');
    this.logger.log(`Bot instance: ${!!this.bot}`);
    
    // Middleware для логирования
    this.bot.use(async (ctx, next) => {
      this.logger.log(`📨 Получено: ${ctx.updateType} от ${ctx.from?.id}`);
      if (ctx.message && 'text' in ctx.message) {
        this.logger.log(`📝 Текст: "${ctx.message.text}"`);
      }
      await next();
    });
    
    this.logger.log('✅ Middleware добавлен');
  }

  private getMainKeyboard() {
    return Markup.keyboard([
      ['👤 Профиль', '🎾 Играть'],
      ['🏆 Турниры', '📝 Записать результат'],
      ['📱 Stories', '🤖 AI-Coach']
    ]).resize().persistent();
  }

  private getUserState(userId: string): UserState {
    return this.userStates.get(userId) || { step: ProfileStep.IDLE, data: {} };
  }

  private setUserState(userId: string, state: UserState) {
    this.userStates.set(userId, state);
  }

  private clearUserState(userId: string) {
    this.userStates.delete(userId);
  }

  @Start()
  async handleStart(ctx: Context) {
    this.logger.log(`🌟 START от пользователя: ${ctx.from?.id} (${ctx.from?.first_name})`);
    
    try {
      if (!ctx.from) {
        this.logger.warn('Нет from field');
        return;
      }

      await ctx.reply('🎾 Запускаю Tennis Bot...');

      let user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      
      if (!user) {
        this.logger.log('Создаем нового пользователя...');
        
        const userData = {
          telegram_id: ctx.from.id.toString(),
          username: ctx.from.username || `user_${ctx.from.id}`,
          first_name: ctx.from.first_name,
          last_name: ctx.from.last_name || undefined,
          photo_url: ''
        };
        
        user = await this.usersService.create(userData);
        this.logger.log('✅ Новый пользователь создан');
        
        await ctx.reply(
          `🎾 Добро пожаловать в Tennis Bot, ${ctx.from.first_name}!\n\nВы успешно зарегистрированы!`,
          this.getMainKeyboard()
        );
      } else {
        this.logger.log('Пользователь уже существует');
        
        await ctx.reply(
          `👋 С возвращением, ${user.first_name}!\n\nВыберите действие:`,
          this.getMainKeyboard()
        );
      }

    } catch (error) {
      this.logger.error(`Ошибка в handleStart: ${error instanceof Error ? error.message : String(error)}`);
      await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
    }
  }

  @Command('debug')
  async handleDebug(ctx: Context) {
    this.logger.log('🐛 DEBUG команда');
    
    const userId = ctx.from?.id.toString();
    const userState = userId ? this.getUserState(userId) : null;
    
    const debugInfo = {
      userId: ctx.from?.id,
      chatId: ctx.chat?.id,
      updateType: ctx.updateType,
      text: ctx.message && 'text' in ctx.message ? ctx.message.text : 'no text',
      userState: userState
    };

    await ctx.reply(
      `🐛 **Debug Info:**\n` +
      `User ID: ${debugInfo.userId}\n` +
      `Chat ID: ${debugInfo.chatId}\n` +
      `Update: ${debugInfo.updateType}\n` +
      `Text: ${debugInfo.text}\n` +
      `State: ${JSON.stringify(debugInfo.userState)}`,
      { parse_mode: 'Markdown' }
    );
  }

  @Command('menu')
  async handleMenu(ctx: Context) {
    this.logger.log('📋 MENU команда');
    
    await ctx.reply(
      '📋 Главное меню:',
      this.getMainKeyboard()
    );
  }

  @Hears('👤 Профиль')
  async handleProfile(ctx: Context) {
    this.logger.log('👤 ПРОФИЛЬ кнопка нажата');
    
    try {
      if (!ctx.from) return;

      const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      
      if (!user) {
        await ctx.reply('❌ Пользователь не найден. Отправьте /start');
        return;
      }

      try {
        const stats = await this.usersService.getProfileStatistics(user.id.toString());
        const profileStatus = await this.usersService.getProfileCompletionStatus(user.id.toString());
        
        const message = `👤 **Ваш профиль**\n\n` +
          `Имя: ${user.first_name} ${user.last_name || ''}\n` +
          `Username: @${user.username || 'не указан'}\n` +
          `ID: ${user.telegram_id}\n\n` +
          `📊 **Статистика:**\n` +
          `🎾 Матчей сыграно: ${stats.matchesPlayed}\n` +
          `🏆 Побед: ${stats.matchWins}\n` +
          `😔 Поражений: ${stats.matchLosses}\n` +
          `📈 Процент побед: ${stats.winRate || 0}%\n` +
          `🏅 Рейтинг: ${stats.ratingPoints} очков\n\n` +
          `${!profileStatus.profileComplete ? '⚠️ Профиль не полностью заполнен' : '✅ Профиль заполнен'}`;

        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('🔄 Настроить профиль', 'setup_profile')],
          [Markup.button.callback('📊 Подробная статистика', 'detailed_stats')],
          [Markup.button.callback('🎾 История матчей', 'match_history')],
        ]);

        await ctx.reply(message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        });

      } catch (statsError) {
        this.logger.error(`Ошибка получения статистики: ${statsError instanceof Error ? statsError.message : String(statsError)}`);
        
        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('🔄 Настроить профиль', 'setup_profile')],
        ]);
        
        await ctx.reply(
          `👤 **Ваш профиль**\n\n` +
          `Имя: ${user.first_name} ${user.last_name || ''}\n` +
          `Username: @${user.username || 'не указан'}\n` +
          `ID: ${user.telegram_id}\n\n` +
          `⚠️ Для получения статистики заполните профиль.`,
          {
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup
          }
        );
      }

    } catch (error) {
      this.logger.error(`Ошибка в handleProfile: ${error instanceof Error ? error.message : String(error)}`);
      await ctx.reply('❌ Ошибка при загрузке профиля');
    }
  }

  @Action('setup_profile')
  async handleSetupProfile(ctx: Context) {
    this.logger.log('🔄 Настройка профиля начата');
    
    await ctx.answerCbQuery();
    
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    
    // Сбрасываем состояние и начинаем заново
    this.setUserState(userId, {
      step: ProfileStep.AWAITING_FIRST_NAME,
      data: {}
    });
    
    await ctx.reply(
      `👋 **Настройка профиля**\n\n` +
      `Давайте заполним ваш профиль для лучшего подбора партнёров!\n\n` +
      `**Шаг 1 из 8: Основная информация**\n\n` +
      `Как вас зовут? Введите ваше **имя**:`,
      { parse_mode: 'Markdown' }
    );
  }

  @Action('detailed_stats')
  async handleDetailedStats(ctx: Context) {
    this.logger.log('📊 Подробная статистика запрошена');
    
    await ctx.answerCbQuery();
    
    if (!ctx.from) return;

    try {
      const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }

      const stats = await this.usersService.getProfileStatistics(user.id.toString());
      const achievements = await this.usersService.getUserAchievements(user.id.toString());
      
      const statsMessage = `📊 **Подробная статистика**\n\n` +
        `🎾 **Матчи:**\n` +
        `• Всего сыграно: ${stats.matchesPlayed}\n` +
        `• Побед: ${stats.matchWins}\n` +
        `• Поражений: ${stats.matchLosses}\n` +
        `• Процент побед: ${stats.winRate || 0}%\n\n` +
        `🏆 **Турниры:**\n` +
        `• Участие: ${stats.tournamentsPlayed}\n` +
        `• Побед: ${stats.tournamentsWon}\n\n` +
        `🏅 **Рейтинг:**\n` +
        `• Текущий рейтинг: ${stats.ratingPoints} очков\n` +
        `• NTRP: ${user.profile?.ntrp_rating || 'Не определен'}\n\n` +
        `🏅 **Достижения:** ${Object.keys(achievements).length > 0 ? Object.keys(achievements).join(', ') : 'Пока нет'}\n\n` +
        `📅 **Последняя активность:** ${stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'Не зафиксирована'}`;

      await ctx.reply(statsMessage, { parse_mode: 'Markdown' });

    } catch (error) {
      this.logger.error(`Ошибка получения подробной статистики: ${error instanceof Error ? error.message : String(error)}`);
      await ctx.reply('❌ Ошибка при загрузке статистики');
    }
  }

  @Action('match_history')
  async handleMatchHistory(ctx: Context) {
    this.logger.log('🎾 История матчей запрошена');
    
    await ctx.answerCbQuery();
    
    if (!ctx.from) return;

    try {
      const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }

      const recentMatches = await this.usersService.getRecentMatches(user.id.toString(), 5);
      
      if (recentMatches.length === 0) {
        await ctx.reply('📭 У вас пока нет истории матчей');
        return;
      }

      let historyMessage = `🎾 **Последние матчи:**\n\n`;
      
      recentMatches.forEach((match, index) => {
        historyMessage += `${index + 1}. ${match.result || 'Не завершен'}\n`;
        historyMessage += `   📅 ${new Date(match.scheduledTime).toLocaleDateString()}\n`;
        historyMessage += `   👥 Соперник: ${match.opponentName || 'Неизвестно'}\n\n`;
      });

      await ctx.reply(historyMessage, { parse_mode: 'Markdown' });

    } catch (error) {
      this.logger.error(`Ошибка получения истории матчей: ${error instanceof Error ? error.message : String(error)}`);
      await ctx.reply('❌ Ошибка при загрузке истории матчей');
    }
  }

  @Hears('🎾 Играть')
  async handlePlay(ctx: Context) {
    this.logger.log('🎾 ИГРАТЬ кнопка нажата');
    
    await ctx.reply(
      '🎾 **Поиск игры**\n\nЭта функция будет доступна после настройки профиля.',
      { parse_mode: 'Markdown' }
    );
  }

  @Hears('🏆 Турниры')
  async handleTournaments(ctx: Context) {
    this.logger.log('🏆 ТУРНИРЫ кнопка нажата');
    
    await ctx.reply(
      '🏆 **Турниры**\n\nСписок доступных турниров будет здесь.',
      { parse_mode: 'Markdown' }
    );
  }

  @On('text')
  async handleText(ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;
    
    const text = ctx.message.text;
    const userId = ctx.from?.id.toString();
    
    if (!userId) return;
    
    const userState = this.getUserState(userId);
    
    this.logger.log(`💬 Текст от ${userId}, состояние: ${userState.step}, текст: "${text}"`);

    // Обрабатываем процесс настройки профиля
    if (userState.step !== ProfileStep.IDLE) {
      await this.handleProfileSetup(ctx, text, userId, userState);
      return;
    }

    // Обычные сообщения вне настройки профиля
    if (!text.startsWith('/') && !['👤', '🎾', '🏆', '📝', '📱', '🤖'].some(emoji => text.includes(emoji))) {
      await ctx.reply(
        `Вы написали: "${text}"\n\n` +
        `Используйте команды:\n` +
        `• /start - начать\n` +
        `• /menu - показать меню\n` +
        `• /debug - отладка\n\n` +
        `Или выберите действие из меню ниже:`,
        this.getMainKeyboard()
      );
    }
  }

  private async handleProfileSetup(ctx: Context, text: string, userId: string, userState: UserState) {
    switch (userState.step) {
      case ProfileStep.AWAITING_FIRST_NAME:
        await this.handleFirstName(ctx, text, userId, userState);
        break;
      
      case ProfileStep.AWAITING_LAST_NAME:
        await this.handleLastName(ctx, text, userId, userState);
        break;
      
      case ProfileStep.AWAITING_CITY:
        await this.handleCity(ctx, text, userId, userState);
        break;
      
      case ProfileStep.AWAITING_COURT:
        await this.handleCourt(ctx, text, userId, userState);
        break;
      
      default:
        this.logger.warn(`Неизвестное состояние: ${userState.step}`);
        break;
    }
  }

  private async handleFirstName(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.firstName = text.trim();
    userState.step = ProfileStep.AWAITING_LAST_NAME;
    this.setUserState(userId, userState);
    
    await ctx.reply(
      `✅ Имя: **${text}**\n\n` +
      `**Шаг 2 из 8**\n\n` +
      `Теперь введите вашу **фамилию**:`,
      { parse_mode: 'Markdown' }
    );
  }

  private async handleLastName(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.lastName = text.trim();
    userState.step = ProfileStep.AWAITING_CITY;
    this.setUserState(userId, userState);
    
    await ctx.reply(
      `✅ Фамилия: **${text}**\n\n` +
      `**Шаг 3 из 8**\n\n` +
      `В каком **городе** вы играете в теннис?`,
      { parse_mode: 'Markdown' }
    );
  }

  private async handleCity(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.city = text.trim();
    userState.step = ProfileStep.AWAITING_COURT;
    this.setUserState(userId, userState);
    
    await ctx.reply(
      `✅ Город: **${text}**\n\n` +
      `**Шаг 4 из 8**\n\n` +
      `На каком **корте** вы чаще всего играете? (можно указать название корта или "любой")`,
      { parse_mode: 'Markdown' }
    );
  }

  private async handleCourt(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.preferredCourt = text.trim();
    userState.step = ProfileStep.AWAITING_HAND;
    this.setUserState(userId, userState);
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🤚 Правша', 'hand_right')],
      [Markup.button.callback('🤚 Левша', 'hand_left')],
    ]);
    
    await ctx.reply(
      `✅ Корт: **${text}**\n\n` +
      `**Шаг 5 из 8**\n\n` +
      `Какой рукой вы играете?`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      }
    );
  }

  @Action(['hand_right', 'hand_left'])
  async handleHand(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    const userState = this.getUserState(userId);
    const hand = ctx.callbackQuery.data === 'hand_right' ? 'RIGHT' : 'LEFT';
    const handText = hand === 'RIGHT' ? 'Правша' : 'Левша';
    
    userState.data.dominantHand = hand;
    userState.step = ProfileStep.AWAITING_FREQUENCY;
    this.setUserState(userId, userState);
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('1 раз в неделю', 'freq_once')],
      [Markup.button.callback('2 раза в неделю', 'freq_twice')],
      [Markup.button.callback('3 раза в неделю', 'freq_three')],
      [Markup.button.callback('4+ раз в неделю', 'freq_four_plus')],
    ]);
    
    await ctx.editMessageText(
      `✅ Игровая рука: **${handText}**\n\n` +
      `**Шаг 6 из 8**\n\n` +
      `Как часто вы играете в теннис?`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      }
    );
  }

  @Action(['freq_once', 'freq_twice', 'freq_three', 'freq_four_plus'])
  async handleFrequency(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    const userState = this.getUserState(userId);
    
    const freqMap = {
      'freq_once': { value: 'ONCE', text: '1 раз в неделю' },
      'freq_twice': { value: 'TWICE', text: '2 раза в неделю' },
      'freq_three': { value: 'THREE_TIMES', text: '3 раза в неделю' },
      'freq_four_plus': { value: 'FOUR_PLUS', text: '4+ раз в неделю' }
    };
    
    const freq = freqMap[ctx.callbackQuery.data as keyof typeof freqMap];
    
    userState.data.weeklyPlayFrequency = freq.value as any;
    userState.step = ProfileStep.AWAITING_TOURNAMENTS;
    this.setUserState(userId, userState);
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('✅ Да, участвую', 'tournaments_yes')],
      [Markup.button.callback('❌ Нет, не участвую', 'tournaments_no')],
    ]);
    
    await ctx.editMessageText(
      `✅ Частота игры: **${freq.text}**\n\n` +
      `**Шаг 7 из 8**\n\n` +
      `Участвуете ли вы в турнирах?`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      }
    );
  }

  @Action(['tournaments_yes', 'tournaments_no'])
  async handleTournamentsChoice(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    const userState = this.getUserState(userId);
    
    const playsInTournaments = ctx.callbackQuery.data === 'tournaments_yes';
    const tournamentsText = playsInTournaments ? 'Да, участвую' : 'Нет, не участвую';
    
    userState.data.playsInTournaments = playsInTournaments;
    userState.step = ProfileStep.AWAITING_LEVEL;
    this.setUserState(userId, userState);
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🟢 Новичок (1.0-2.0)', 'level_beginner')],
      [Markup.button.callback('🔵 Любитель (2.5-3.5)', 'level_amateur')],
      [Markup.button.callback('🟡 Уверенный игрок (4.0-4.5)', 'level_confident')],
      [Markup.button.callback('🟠 Турнирный уровень (5.0-6.0)', 'level_tournament')],
      [Markup.button.callback('🔴 Полупрофи / тренер', 'level_semipro')],
    ]);
    
    await ctx.editMessageText(
      `✅ Турниры: **${tournamentsText}**\n\n` +
      `**Шаг 8 из 8**\n\n` +
      `Какой у вас уровень игры?`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      }
    );
  }

  @Action(['level_beginner', 'level_amateur', 'level_confident', 'level_tournament', 'level_semipro'])
  async handleLevel(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    const userState = this.getUserState(userId);
    
    const levelMap = {
      'level_beginner': { value: 'BEGINNER', text: 'Новичок (1.0-2.0)' },
      'level_amateur': { value: 'AMATEUR', text: 'Любитель (2.5-3.5)' },
      'level_confident': { value: 'CONFIDENT', text: 'Уверенный игрок (4.0-4.5)' },
      'level_tournament': { value: 'TOURNAMENT', text: 'Турнирный уровень (5.0-6.0)' },
      'level_semipro': { value: 'SEMI_PRO', text: 'Полупрофи / тренер' }
    };
    
    const level = levelMap[ctx.callbackQuery.data as keyof typeof levelMap];
    userState.data.selfAssessedLevel = level.value as any;
    this.setUserState(userId, userState);
    
    await ctx.editMessageText(
      `✅ Уровень игры: **${level.text}**\n\n` +
      `🔄 Сохраняю ваш профиль...`,
      { parse_mode: 'Markdown' }
    );
    
    // Сохраняем профиль
    await this.saveProfile(ctx, userId, userState);
  }

  private async saveProfile(ctx: Context, userId: string, userState: UserState) {
    try {
      const user = await this.usersService.findByTelegramId(userId);
      if (!user) {
        await ctx.reply('❌ Ошибка: пользователь не найден');
        return;
      }

      const profileData = userState.data;
      
      // Сохраняем первый шаг профиля
      const stepOneData = {
        firstName: profileData.firstName!,
        lastName: profileData.lastName!,
        city: profileData.city!,
        preferredCourt: profileData.preferredCourt,
        dominantHand: profileData.dominantHand!,
        preferredPlayTime: ['EVENING'], // Значение по умолчанию
        playsInTournaments: profileData.playsInTournaments!,
        weeklyPlayFrequency: profileData.weeklyPlayFrequency!,
      };

      await this.usersService.completeProfileStepOne(user.id.toString(), stepOneData);

      // Сохраняем второй шаг профиля
      const stepTwoData = {
        selfAssessedLevel: profileData.selfAssessedLevel!,
        ntrpRating: this.getNtrpRating(profileData.selfAssessedLevel!),
        backhandType: 'TWO_HANDED', // Значение по умолчанию
        preferredSurface: 'HARD', // Значение по умолчанию
        playingStyle: 'UNIVERSAL', // Значение по умолчанию
        favoriteShot: 'FOREHAND', // Значение по умолчанию
        opponentPreference: 'ANY' // Значение по умолчанию
      };

      await this.usersService.completeProfileStepTwo(user.id.toString(), stepTwoData);

      const summaryMessage = `✅ **Профиль успешно настроен!**\n\n` +
        `👤 **Ваши данные:**\n` +
        `• Имя: ${profileData.firstName} ${profileData.lastName}\n` +
        `• Город: ${profileData.city}\n` +
        `• Корт: ${profileData.preferredCourt || 'Любой'}\n` +
        `• Игровая рука: ${profileData.dominantHand === 'RIGHT' ? 'Правша' : 'Левша'}\n` +
        `• Частота игры: ${this.getFrequencyText(profileData.weeklyPlayFrequency!)}\n` +
        `• Турниры: ${profileData.playsInTournaments ? 'Участвую' : 'Не участвую'}\n` +
        `• Уровень: ${this.getLevelText(profileData.selfAssessedLevel!)}\n\n` +
        `Теперь вы можете искать партнёров для игры! 🎾`;

      await ctx.editMessageText(summaryMessage, { parse_mode: 'Markdown' });
      
      // Показываем главное меню
      await ctx.reply(
        'Главное меню:',
        this.getMainKeyboard()
      );

      // Очищаем состояние пользователя
      this.clearUserState(userId);

    } catch (error) {
      this.logger.error(`Ошибка сохранения профиля: ${error instanceof Error ? error.message : String(error)}`);
      await ctx.reply('❌ Произошла ошибка при сохранении профиля. Попробуйте позже.');
    }
  }

  private getNtrpRating(level: string): number {
    const ratingMap = {
      'BEGINNER': 2.0,
      'AMATEUR': 3.0,
      'CONFIDENT': 4.0,
      'TOURNAMENT': 5.0,
      'SEMI_PRO': 5.5
    };
    return ratingMap[level as keyof typeof ratingMap] || 3.0;
  }

  private getFrequencyText(frequency: string): string {
    const freqMap = {
      'ONCE': '1 раз в неделю',
      'TWICE': '2 раза в неделю',
      'THREE_TIMES': '3 раза в неделю',
      'FOUR_PLUS': '4+ раз в неделю'
    };
    return freqMap[frequency as keyof typeof freqMap] || frequency;
  }

  private getLevelText(level: string): string {
    const levelMap = {
      'BEGINNER': 'Новичок (1.0-2.0)',
      'AMATEUR': 'Любитель (2.5-3.5)',
      'CONFIDENT': 'Уверенный игрок (4.0-4.5)',
      'TOURNAMENT': 'Турнирный уровень (5.0-6.0)',
      'SEMI_PRO': 'Полупрофи / тренер'
    };
    return levelMap[level as keyof typeof levelMap] || level;
  }
}