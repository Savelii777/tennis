import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Context, Telegraf, Markup } from 'telegraf';
import { Action, Hears } from 'nestjs-telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
import { ProfileStep, UserState } from '../interfaces/profile-state.enum';
import { UsersService } from '../../users/application/services/users.service';
import { RatingsService } from '../../ratings/ratings.service';
import { BallsService } from '../../users/application/services/balls.service';
import { PrismaService } from '../../../prisma/prisma.service';

interface Achievement {
  id: number;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  totalRequired?: number;
}

@Injectable()
export class ProfileHandler {
  private readonly logger = new Logger(ProfileHandler.name);

  constructor(
    private readonly stateService: StateService,
    private readonly keyboardService: KeyboardService,
    private readonly usersService: UsersService,
    private readonly ratingsService: RatingsService,
    private readonly ballsService: BallsService,
    private readonly prisma: PrismaService
  ) {}

// Метод register - регистрация всех обработчиков
register(bot: Telegraf<Context>) {
  // Существующие обработчики
  bot.command('profile', this.handleProfileCommand.bind(this));
  bot.action('profile', this.handleProfile.bind(this));
  bot.action('detailed_stats', this.handleDetailedStats.bind(this));
  bot.action('user_achievements', this.handleUserAchievements.bind(this));
  bot.action('setup_profile', this.handleSetupProfileAction.bind(this));
  bot.action('match_history', this.handleMatchHistory.bind(this));
  bot.action('user_goals', this.handleUserGoals.bind(this));
  bot.action('back_to_profile', this.handleBackToProfile.bind(this));
  
  // Обработчики для выбора руки
  bot.action('hand_LEFT', async (ctx) => this.handleHandSelection('LEFT', ctx));
  bot.action('hand_RIGHT', async (ctx) => this.handleHandSelection('RIGHT', ctx));
  
  // Обработчики для частоты игр
  bot.action('frequency_1', async (ctx) => this.handleFrequencySelection('1_PER_WEEK', ctx));
  bot.action('frequency_2', async (ctx) => this.handleFrequencySelection('2_3_PER_WEEK', ctx));
  bot.action('frequency_3', async (ctx) => this.handleFrequencySelection('4_PLUS_PER_WEEK', ctx));
  
  // Обработчики для турниров
  bot.action('tournaments_YES', async (ctx) => this.handleTournamentsSelection(true, ctx));
  bot.action('tournaments_NO', async (ctx) => this.handleTournamentsSelection(false, ctx));
  
  // Обработчики для уровня игры
  bot.action('level_BEGINNER', async (ctx) => this.handleLevelSelection('BEGINNER', ctx));
  bot.action('level_AMATEUR', async (ctx) => this.handleLevelSelection('AMATEUR', ctx));
  bot.action('level_CONFIDENT', async (ctx) => this.handleLevelSelection('CONFIDENT', ctx));
  bot.action('level_ADVANCED', async (ctx) => this.handleLevelSelection('ADVANCED', ctx));
  bot.action('level_TOURNAMENT', async (ctx) => this.handleLevelSelection('TOURNAMENT', ctx));
  
  // ШАГ 1: Основные данные игрока
  // Выбор спорта
  bot.action('sport_TENNIS', async (ctx) => this.handleSportSelection('TENNIS', ctx));
  bot.action('sport_PADEL', async (ctx) => this.handleSportSelection('PADEL', ctx));
  
  // Выбор времени игры
  bot.action('time_MORNING', async (ctx) => this.handlePlayTimeSelection('MORNING', ctx));
  bot.action('time_DAY', async (ctx) => this.handlePlayTimeSelection('DAY', ctx));
  bot.action('time_EVENING', async (ctx) => this.handlePlayTimeSelection('EVENING', ctx));
  bot.action('time_NIGHT', async (ctx) => this.handlePlayTimeSelection('NIGHT', ctx));
  bot.action('continue_to_frequency', async (ctx) => this.handleContinueToFrequency(ctx));
  
  // Переход к Шагу 2
  bot.action('start_step_two', async (ctx) => this.handleStartStepTwo(ctx));
  
  // ШАГ 2: Стиль игры и уровень
  // Обработчики для уровня игры (с NTRP диапазонами)
  bot.action('level_BEGINNER_1_2', async (ctx) => this.handleLevelSelection('BEGINNER', ctx));
  bot.action('level_AMATEUR_2_3', async (ctx) => this.handleLevelSelection('AMATEUR', ctx));
  bot.action('level_CONFIDENT_4', async (ctx) => this.handleLevelSelection('CONFIDENT', ctx));
  bot.action('level_TOURNAMENT_5', async (ctx) => this.handleLevelSelection('TOURNAMENT', ctx));
  bot.action('level_SEMI_PRO', async (ctx) => this.handleLevelSelection('SEMI_PRO', ctx));
  
  // Бэкхенд
  bot.action('backhand_ONE', async (ctx) => this.handleBackhandSelection('ONE_HANDED', ctx));
  bot.action('backhand_TWO', async (ctx) => this.handleBackhandSelection('TWO_HANDED', ctx));
  
  // Покрытие
  bot.action('surface_HARD', async (ctx) => this.handleSurfaceSelection('HARD', ctx));
  bot.action('surface_CLAY', async (ctx) => this.handleSurfaceSelection('CLAY', ctx));
  bot.action('surface_GRASS', async (ctx) => this.handleSurfaceSelection('GRASS', ctx));
  bot.action('surface_CARPET', async (ctx) => this.handleSurfaceSelection('CARPET', ctx));
  
  // Стиль игры
  bot.action('style_UNIVERSAL', async (ctx) => this.handleStyleSelection('UNIVERSAL', ctx));
  bot.action('style_DEFENSIVE', async (ctx) => this.handleStyleSelection('DEFENSIVE', ctx));
  bot.action('style_AGGRESSIVE', async (ctx) => this.handleStyleSelection('AGGRESSIVE', ctx));
  bot.action('style_NET_PLAYER', async (ctx) => this.handleStyleSelection('NET_PLAYER', ctx));
  bot.action('style_BASIC', async (ctx) => this.handleStyleSelection('BASIC', ctx));
  
  // Любимый удар
  bot.action('shot_SERVE', async (ctx) => this.handleShotSelection('SERVE', ctx));
  bot.action('shot_FOREHAND', async (ctx) => this.handleShotSelection('FOREHAND', ctx));
  bot.action('shot_BACKHAND', async (ctx) => this.handleShotSelection('BACKHAND', ctx));
  bot.action('shot_VOLLEY', async (ctx) => this.handleShotSelection('VOLLEY', ctx));
  bot.action('shot_SMASH', async (ctx) => this.handleShotSelection('SMASH', ctx));
  
  // Предпочтения по сопернику
  bot.action('opponent_ANY', async (ctx) => this.handleOpponentSelection('ANY', ctx));
  bot.action('opponent_MEN', async (ctx) => this.handleOpponentSelection('MEN', ctx));
  bot.action('opponent_WOMEN', async (ctx) => this.handleOpponentSelection('WOMEN', ctx));
  bot.action('opponent_SAME_LEVEL', async (ctx) => this.handleOpponentSelection('SAME_LEVEL', ctx));
  bot.action('opponent_STRONGER', async (ctx) => this.handleOpponentSelection('STRONGER', ctx));
  bot.action('opponent_WEAKER', async (ctx) => this.handleOpponentSelection('WEAKER', ctx));
  
  // Обработка текстовых сообщений для всех этапов регистрации
  bot.on('text', this.handleTextMessage.bind(this));
}

  @Hears('👤 Профиль')
  async handleProfile(ctx: Context) {
    this.logger.log('👤 ПРОФИЛЬ кнопка нажата');
    
    try {
      if (!ctx.from) return;

      const userId = ctx.from.id.toString();
      const user = await this.usersService.findByTelegramId(userId);
      
      if (!user) {
        await ctx.reply('❌ Пользователь не найден. Отправьте /start');
        return;
      }

      // Получаем полный профиль пользователя с профилем
      const userWithProfile = await this.prisma.user.findUnique({
        where: { id: parseInt(user.id.toString()) },
        include: { profile: true }
      });

      // Получаем рейтинг пользователя
      let ratingInfo = '';
      try {
        const rating = await this.ratingsService.getRatingForUser(user.id);
        
        if (rating) {
          ratingInfo = `🎯 **NTRP рейтинг:** ${rating.skillRating?.toFixed(1) || '?'}\n` +
                      `⚡ **Очки силы:** ${rating.skillPoints || 0}\n` +
                      `⭐ **Очки активности:** ${rating.pointsRating || 0}\n`;
        } else {
          ratingInfo = `🏆 **Рейтинг:** Пройдите первый матч для расчета!\n`;
        }
      } catch (error) {
        this.logger.error(`Ошибка получения рейтинга: ${error}`);
        ratingInfo = `🏆 **Рейтинг:** Временно недоступен\n`;
      }

      // Получаем статистику профиля
      try {
        const stats = await this.usersService.getProfileStatistics(user.id.toString());
        const profileCompletion = await this.usersService.getProfileCompletionStatus(user.id.toString());
        const ballsBalance = await this.ballsService.getUserBalance(user.id.toString());
        const completionPercentage = Math.round(
  ((profileCompletion.stepOneCompleted ? 50 : 0) + 
   (profileCompletion.stepTwoCompleted ? 50 : 0))
);
`🧩 Заполненность профиля: ${completionPercentage}%`
        const message = `👤 **Профиль ${user.first_name} ${user.last_name || ''}**\n\n` +
                      `${ratingInfo}\n` +
                      `🏙️ **Город:** ${userWithProfile?.profile?.city || 'Не указан'}\n` +
                      `👋 **Рука:** ${this.getDominantHandText(userWithProfile?.profile?.dominantHand)}\n` +
                      `🏆 **Уровень:** ${this.getLevelText(userWithProfile?.profile?.selfAssessedLevel || '')}\n\n` +
                      `📊 **Статистика:**\n` +
                      `📈 Матчей сыграно: ${stats.matchesPlayed || 0}\n` +
                      `🥇 Побед: ${stats.matchWins || 0}\n` +
                      `🎾 Мячей: ${ballsBalance}\n` +
                      `🧩 Заполненность профиля: ${completionPercentage}%`;
        
        await ctx.reply(message, { 
          parse_mode: 'Markdown',
          reply_markup: this.keyboardService.getProfileKeyboard().reply_markup
        });
        
      } catch (error) {
        this.logger.error(`Ошибка получения статистики профиля: ${error}`);
        await ctx.reply('❌ Ошибка при загрузке профиля');
      }
      
    } catch (error) {
      this.logger.error(`Ошибка в handleProfile: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке профиля');
    }
  }

  async handleDetailedStats(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;

      const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      if (!user) return;

      // Получаем детальную статистику
      const [stats, rating] = await Promise.all([
        this.usersService.getProfileStatistics(user.id.toString()),
        this.ratingsService.getRatingForUser(user.id)
      ]);
      
      // Добавляем метод getUserMatches в UsersService
      const matches = await this.usersService.getUserMatches(user.id.toString());

      let message = `📊 **Детальная статистика**\n\n`;
      
      // Рейтинги
      if (rating) {
        message += `🏆 **Рейтинговая система:**\n`;
        message += `🎯 **NTRP уровень:** ${rating.skillRating?.toFixed(1) || 'N/A'}\n`;
        message += `⚡ **Очки силы:** ${rating.skillPoints || 0}\n`;
        message += `⭐ **Очки активности:** ${rating.pointsRating || 0}\n\n`;
      }

      // Статистика матчей
      message += `🎾 **Матчи:**\n`;
      message += `✅ Всего: ${stats.matchesPlayed || 0}\n`;
      message += `🏆 Побед: ${stats.matchWins || 0}\n`;
      message += `😔 Поражений: ${stats.matchLosses || 0}\n`;
      message += `📈 Процент побед: ${stats.winRate || 0}%\n\n`;

      // Турниры
      message += `🏆 **Турниры:**\n`;
      message += `🎯 Участие: ${stats.tournamentsPlayed || 0}\n`;
      message += `🥇 Победы: ${stats.tournamentsWon || 0}\n\n`;

      // Последние матчи
      message += `📋 **Последние матчи:**\n`;
      if (matches && matches.length > 0) {
        matches.slice(0, 3).forEach((match: any, index: number) => {
          const date = new Date(match.date || match.matchDate).toLocaleDateString('ru-RU');
          const opponent = match.opponent?.name || match.opponentName || 'Неизвестно';
          const result = match.result === 'WIN' ? '✅' : '❌';
          message += `${index + 1}. ${date} vs ${opponent} ${result} ${match.score || ''}\n`;
        });
      } else {
        message += `Пока нет записанных матчей\n`;
      }

      await ctx.editMessageText(message, { 
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('⬅️ Назад к профилю', 'back_to_profile')]
        ]).reply_markup
      });
    } catch (error) {
      this.logger.error(`Ошибка получения детальной статистики: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке статистики');
    }
  }

  async handleUserAchievements(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;

      const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      if (!user) return;

      // Заглушка для достижений, которую нужно заменить на реальный запрос
      const achievements: Achievement[] = [];
      
      let message = `🏆 **Достижения**\n\n`;
      
      if (achievements && achievements.length > 0) {
        achievements.forEach((achievement: Achievement, index: number) => {
          message += `${index + 1}. ${achievement.title} - ${achievement.description}\n`;
        });
      } else {
        message += `Пока нет достижений. Играйте матчи и участвуйте в турнирах, чтобы получить их!\n\n`;
        message += `🎯 Доступные достижения:\n`;
        message += `• Новичок - Сыграйте первый матч\n`;
        message += `• Победитель - Выиграйте 5 матчей\n`;
        message += `• Турнирный игрок - Участвуйте в турнире\n`;
      }

      await ctx.editMessageText(message, { 
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('⬅️ Назад к профилю', 'back_to_profile')]
        ]).reply_markup
      });
    } catch (error) {
      this.logger.error(`Ошибка получения достижений: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке достижений');
    }
  }
async handleSetupProfileAction(ctx: Context): Promise<void> {
  try {
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    
    // Инициализируем состояние для настройки профиля - начинаем с выбора спорта
    this.stateService.setUserState(userId, {
      step: ProfileStep.AWAITING_SPORT_TYPE,
      data: {}
    });
    
    // Запрашиваем выбор спорта
    await ctx.reply(
      '🎾 **ШАГ 1: Основные данные игрока**\n\nДавайте настроим ваш профиль! Сначала выберите спорт:',
      Markup.inlineKeyboard([
        [
          Markup.button.callback('🎾 Теннис', 'sport_TENNIS'),
          Markup.button.callback('🏓 Падел', 'sport_PADEL')
        ]
      ])
    );
    
  } catch (error) {
    this.logger.error(`Ошибка при настройке профиля: ${error}`);
    await ctx.reply('❌ Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
}
async handleTournamentsSelection(participates: boolean, ctx: Context): Promise<void> {
  try {
    await ctx.answerCbQuery(); // Подтверждаем нажатие
    
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    const userState = this.stateService.getUserState(userId);
    
    // Проверяем, что находимся в правильном состоянии
    if (userState.step !== ProfileStep.AWAITING_TOURNAMENTS) {
      return;
    }
    
    // Сохраняем информацию об участии в турнирах
    userState.data.playsInTournaments = participates;
    this.stateService.setUserState(userId, userState);
    
    this.logger.log(`Участие в турнирах: ${participates} для пользователя ${userId}`);
    
    // Завершаем Шаг 1 и показываем переход к Шагу 2
    await ctx.reply(
      `✅ Участие в турнирах: ${participates ? 'Да' : 'Нет'}\n\n🎉 **ШАГ 1 ЗАВЕРШЁН!**\n\nОсновные данные сохранены. Теперь перейдём к настройке стиля игры и определению вашего рейтинга NTRP.`,
      Markup.inlineKeyboard([
        [Markup.button.callback('➡️ Перейти к Шагу 2', 'start_step_two')]
      ])
    );
    
  } catch (error) {
    this.logger.error(`Ошибка при выборе участия в турнирах: ${error}`);
    await ctx.reply('❌ Произошла ошибка. Пожалуйста, попробуйте ещё раз.');
  }
}
async handleLevelSelection(level: string, ctx: Context): Promise<void> {
  try {
    await ctx.answerCbQuery(); // Подтверждаем нажатие
    
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    const userState = this.stateService.getUserState(userId);
    
    // Проверяем, что находимся в правильном состоянии
    if (userState.step !== ProfileStep.AWAITING_LEVEL) {
      return;
    }
    
    // Сохраняем выбор уровня в данных пользователя с правильным типом
    userState.data.selfAssessedLevel = level as "BEGINNER" | "AMATEUR" | "CONFIDENT" | "TOURNAMENT" | "SEMI_PRO";
    
    // Заполнение профиля завершено
    userState.step = ProfileStep.COMPLETE;
    this.stateService.setUserState(userId, userState);
    
    this.logger.log(`Установлен уровень ${level} для пользователя ${userId}`);
    
    // Сохраняем данные профиля в базе данных
    await this.completeProfileSetup(userId, userState.data);
    
    // Отображаем сообщение об успешном завершении
    await ctx.reply(
      '✅ Профиль успешно настроен!\n\nТеперь вы можете пользоваться всеми функциями приложения.',
      Markup.inlineKeyboard([
        [Markup.button.callback('Перейти в профиль', 'profile')],
        [Markup.button.callback('🎮 Главное меню', 'main_menu')]
      ])
    );
    
  } catch (error) {
    this.logger.error(`Ошибка при выборе уровня игры: ${error}`);
    await ctx.reply('❌ Произошла ошибка при сохранении профиля. Пожалуйста, попробуйте ещё раз.');
  }
}


/**
 * Метод для сохранения данных профиля
 */
async completeProfileSetup(telegramUserId: string, profileData: any): Promise<void> {
  try {
    this.logger.log(`Сохранение профиля для Telegram ID: ${telegramUserId}`);
    
    // Находим пользователя по telegramId, а не по id
    const user = await this.prisma.user.findUnique({
      where: { telegramId: telegramUserId }
    });
    
    if (!user) {
      throw new NotFoundException(`Пользователь с Telegram ID ${telegramUserId} не найден`);
    }
    
    const userId = user.id; // Получаем настоящий ID пользователя из базы данных
    this.logger.log(`Найден пользователь в БД с ID: ${userId}`);
    
    // Шаг 1: создаем объект для API
    const profileStepOneDto = {
      city: profileData.city,
      preferredCourt: profileData.preferredCourt,
      dominantHand: profileData.dominantHand,
      preferredPlayTime: ['EVENING'], // По умолчанию
      playsInTournaments: profileData.playsInTournaments || false,
      weeklyPlayFrequency: profileData.weeklyPlayFrequency || 'TWO_THREE',
      firstName: user.firstName, // Берем из существующей записи
      lastName: user.lastName || undefined,    // Конвертируем null в undefined
      sportType: profileData.sportType || 'TENNIS' // Добавляем обязательное поле
    };
    
    // Вызываем API для сохранения данных шага 1
    await this.usersService.completeProfileStepOne(userId.toString(), profileStepOneDto);
    
    // Шаг 2: создаем объект для следующего API
    const profileStepTwoDto = {
      selfAssessedLevel: profileData.selfAssessedLevel || 'BEGINNER',
      backhandType: 'TWO_HANDED', // По умолчанию
      preferredSurface: 'HARD', // По умолчанию
      playingStyle: 'UNIVERSAL', // По умолчанию
      favoriteShot: 'FOREHAND', // По умолчанию
      racket: 'Любая', // По умолчанию
      opponentPreference: 'ANY' // По умолчанию
    };
    
    // Вызываем API для сохранения данных шага 2
    await this.usersService.completeProfileStepTwo(userId.toString(), profileStepTwoDto);
    
    this.logger.log(`✅ Профиль успешно сохранен для пользователя ${userId}`);
    
  } catch (error) {
    this.logger.error(`Ошибка при сохранении профиля: ${error}`);
    throw error;
  }
}


  async handleMatchHistory(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;

      const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      if (!user) return;

      const matches = await this.usersService.getUserMatches(user.id.toString());
      
      let message = `📋 **История матчей**\n\n`;
      
      if (matches && matches.length > 0) {
        matches.slice(0, 10).forEach((match: any, index: number) => {
          const date = new Date(match.date || match.matchDate).toLocaleDateString('ru-RU');
          const opponent = match.opponent?.name || match.opponentName || 'Неизвестно';
          const result = match.result === 'WIN' ? '✅ Победа' : '❌ Поражение';
          message += `${index + 1}. ${date} vs ${opponent}\n`;
          message += `   ${result} ${match.score || ''}\n\n`;
        });
      } else {
        message += `У вас пока нет записанных матчей.\n\n`;
        message += `Используйте кнопку "📝 Записать результат" в главном меню, чтобы добавить свой первый матч!`;
      }

      await ctx.editMessageText(message, { 
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('⬅️ Назад к профилю', 'back_to_profile')]
        ]).reply_markup
      });
    } catch (error) {
      this.logger.error(`Ошибка получения истории матчей: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке истории матчей');
    }
  }

  async handleUserGoals(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      const message = `🎯 **Цели**\n\n` +
        `• Сыграть 10 матчей - Прогресс: 3/10\n` +
        `• Победить в турнире - Не выполнено\n` +
        `• Повысить NTRP на 0.5 пункта - В процессе\n\n` +
        `Добавление персональных целей будет доступно в следующих обновлениях!`;

      await ctx.editMessageText(message, { 
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('⬅️ Назад к профилю', 'back_to_profile')]
        ]).reply_markup
      });
    } catch (error) {
      this.logger.error(`Ошибка получения целей: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке целей');
    }
  }
  
  async handleBackToProfile(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      await this.handleProfile(ctx);
    } catch (error) {
      this.logger.error(`Ошибка в handleBackToProfile: ${error}`);
      await ctx.reply('❌ Ошибка при возврате к профилю');
    }
  }

  async handleSettings(ctx: Context) {
    try {
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const user = await this.usersService.findByTelegramId(userId);
      
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }

      // В реальном приложении здесь будет загрузка настроек из сервиса
      const settings = {
        notificationsEnabled: true,
        language: 'ru'
      };
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔔 Уведомления', 'toggle_notifications')],
        [
          Markup.button.callback('🇷🇺 Русский', 'lang_ru'),
          Markup.button.callback('🇬🇧 English', 'lang_en')
        ],
        [Markup.button.callback('⬅️ Назад в меню', 'back_to_menu')]
      ]);

      await ctx.reply(
        `⚙️ **Настройки**\n\n` +
        `🔔 Уведомления: ${settings.notificationsEnabled ? 'Включены' : 'Выключены'}\n` +
        `🌐 Язык: ${settings.language === 'ru' ? 'Русский' : 'English'}`,
        { 
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup 
        }
      );
    } catch (error) {
      this.logger.error(`Ошибка в handleSettings: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке настроек');
    }
  }

  // Вспомогательные методы
  private getLevelText(level: string): string {
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

  private getDominantHandText(hand: string | null | undefined): string {
    if (hand === 'LEFT') return 'Левая';
    if (hand === 'RIGHT') return 'Правая';
    return 'Не указана';
  }


  async handleFrequencySelection(frequency: string, ctx: Context): Promise<void> {
    try {
      await ctx.answerCbQuery(); // Подтверждаем нажатие
      
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      // Проверяем, что находимся в правильном состоянии
      if (userState.step !== ProfileStep.AWAITING_FREQUENCY) {
        return;
      }
      
      // Преобразуем строковое значение в соответствующий тип
      let typedFrequency: "ONE" | "TWO_THREE" | "FOUR_PLUS";
      switch (frequency) {
        case '1_PER_WEEK':
          typedFrequency = "ONE";
          break;
        case '2_3_PER_WEEK':
          typedFrequency = "TWO_THREE";
          break;
        case '4_PLUS_PER_WEEK':
          typedFrequency = "FOUR_PLUS";
          break;
        default:
          typedFrequency = "ONE";
      }
      
      // Сохраняем выбор частоты в данных пользователя
      userState.data.weeklyPlayFrequency = typedFrequency;
      
      // Переходим к следующему шагу
      userState.step = ProfileStep.AWAITING_TOURNAMENTS;
      this.stateService.setUserState(userId, userState);
    
    this.logger.log(`Установлена частота игр ${frequency} для пользователя ${userId}`);
    
    // Отображаем вопрос о турнирах
    await ctx.reply(
      'Вы участвуете в турнирах?',
      Markup.inlineKeyboard([
        [
          Markup.button.callback('Да', 'tournaments_YES'),
          Markup.button.callback('Нет', 'tournaments_NO')
        ]
      ])
    );
    
  } catch (error) {
    this.logger.error(`Ошибка при выборе частоты игр: ${error}`);
    await ctx.reply('❌ Произошла ошибка. Пожалуйста, попробуйте ещё раз.');
  }
}

async handleProfileInput(ctx: Context, text: string, userId: string): Promise<boolean> {
  const userState = this.stateService.getUserState(userId);
  
  this.logger.log(`Обработка ввода для профиля: ${text}, текущий шаг: ${userState.step}`);
  
  switch (userState.step) {
    case ProfileStep.AWAITING_CITY:
      return await this.handleCity(ctx, text, userId, userState);
      
    case ProfileStep.AWAITING_COURT:
      return await this.handleCourt(ctx, text, userId, userState);
      
    case ProfileStep.AWAITING_HAND:
      // Для шага выбора руки используем инлайн кнопки
      await ctx.reply(
        "Пожалуйста, выберите руку, используя кнопки выше", 
        Markup.inlineKeyboard([
          [
            Markup.button.callback('👈 Левая', 'hand_LEFT'),
            Markup.button.callback('👉 Правая', 'hand_RIGHT')
          ]
        ])
      );
      return true;
         case ProfileStep.AWAITING_FREQUENCY:
      // Обработка текста для частоты игр без дублирования инлайн-кнопок
      if (text.includes("1 раз")) {
        return await this.processFrequencySelection("1_PER_WEEK", ctx, userId, userState);
      } else if (text.includes("2-3")) {
        return await this.processFrequencySelection("2_3_PER_WEEK", ctx, userId, userState);
      } else if (text.includes("4+")) {
        return await this.processFrequencySelection("4_PLUS_PER_WEEK", ctx, userId, userState);
      } else {
        await ctx.reply("Пожалуйста, выберите частоту игр, используя кнопки ниже");
        return true;
      }
      
    case ProfileStep.AWAITING_TOURNAMENTS:
      // Для шага выбора участия в турнирах используем инлайн кнопки
      await ctx.reply(
        "Участвуете ли вы в турнирах? Выберите ответ ниже", 
        Markup.inlineKeyboard([
          [
            Markup.button.callback('Да', 'tournaments_YES'),
            Markup.button.callback('Нет', 'tournaments_NO')
          ]
        ])
      );
      return true;
      
    case ProfileStep.AWAITING_LEVEL:
      // Для шага выбора уровня используем инлайн кнопки
      await ctx.reply(
        "Как бы вы оценили свой уровень игры?", 
        Markup.inlineKeyboard([
          [Markup.button.callback('Начинающий', 'level_BEGINNER')],
          [Markup.button.callback('Любитель', 'level_AMATEUR')],
          [Markup.button.callback('Уверенный игрок', 'level_CONFIDENT')],
          [Markup.button.callback('Продвинутый', 'level_ADVANCED')],
          [Markup.button.callback('Турнирный игрок', 'level_TOURNAMENT')]
        ])
      );
      return true;
  }
  
  return false;
}


// Добавляем вспомогательный метод для обработки выбора частоты
async processFrequencySelection(frequency: string, ctx: Context, userId: string, userState: any): Promise<boolean> {
  // Сохраняем выбор частоты в данных пользователя
  userState.data.weeklyPlayFrequency = frequency;
  
  // Переходим к следующему шагу
  userState.step = ProfileStep.AWAITING_TOURNAMENTS;
  this.stateService.setUserState(userId, userState);
  
  this.logger.log(`Установлена частота игр ${frequency} для пользователя ${userId}`);
  
  // Отображаем вопрос о турнирах
  await ctx.reply(
    'Вы участвуете в турнирах?',
    Markup.inlineKeyboard([
      [
        Markup.button.callback('Да', 'tournaments_YES'),
        Markup.button.callback('Нет', 'tournaments_NO')
      ]
    ])
  );
  
  return true;
}

async handleCity(ctx: Context, text: string, userId: string, userState: any): Promise<boolean> {
  // Сохраняем город
  userState.data.city = text;
  userState.step = ProfileStep.AWAITING_COURT;
  this.stateService.setUserState(userId, userState);
  
  this.logger.log(`Сохранен город: ${text} для пользователя ${userId}`);
  
  // Запрашиваем корт
  await ctx.reply('На каком корте вы предпочитаете играть?');
  return true;
}

async handleCourt(ctx: Context, text: string, userId: string, userState: any): Promise<boolean> {
  // Сохраняем предпочитаемый корт
  userState.data.preferredCourt = text;
  userState.step = ProfileStep.AWAITING_HAND;
  this.stateService.setUserState(userId, userState);
  
  this.logger.log(`Сохранен корт: ${text} для пользователя ${userId}`);
  
  // Запрашиваем выбор руки через инлайн-кнопки
  await ctx.reply(
    'Какой рукой вы играете?',
    Markup.inlineKeyboard([
      [
        Markup.button.callback('👈 Левая', 'hand_LEFT'),
        Markup.button.callback('👉 Правая', 'hand_RIGHT')
      ]
    ])
  );
  return true;
}
async handleHandSelection(hand: 'LEFT' | 'RIGHT', ctx: Context): Promise<void> {
  try {
    await ctx.answerCbQuery(); // Подтверждаем нажатие
    
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    const userState = this.stateService.getUserState(userId);
    
    // Проверяем, что находимся в правильном состоянии
    if (userState.step !== ProfileStep.AWAITING_HAND) {
      return;
    }
    
    // Сохраняем выбор руки в данных пользователя
    userState.data.dominantHand = hand;
    
    // Переходим к выбору времени игры
    userState.step = ProfileStep.AWAITING_PLAY_TIME;
    this.stateService.setUserState(userId, userState);
    
    // Отображаем выбор времени игры
    await ctx.reply(
      `✅ Доминирующая рука: **${hand === 'LEFT' ? 'Левая' : 'Правая'}**\n\n🕐 Когда вы чаще всего играете? (можно выбрать несколько вариантов)`,
      { 
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.button.callback('🌅 Утром', 'time_MORNING'),
            Markup.button.callback('☀️ Днём', 'time_DAY')
          ],
          [
            Markup.button.callback('🌇 Вечером', 'time_EVENING'),
            Markup.button.callback('🌙 Ночью', 'time_NIGHT')
          ],
          [
            Markup.button.callback('➡️ Продолжить', 'continue_to_frequency')
          ]
        ]).reply_markup
      }
    );
    
    this.logger.log(`Установлена доминантная рука ${hand} для пользователя ${userId}`);
    
  } catch (error) {
    this.logger.error(`Ошибка при выборе руки: ${error}`);
    await ctx.reply('❌ Произошла ошибка при обработке вашего выбора. Пожалуйста, попробуйте ещё раз.');
  }
}
  private async handleFrequency(ctx: Context, text: string, userId: string, userState: UserState) {
    // Для обработки через кнопки
    return true;
  }

  private async handleTournaments(ctx: Context, text: string, userId: string, userState: UserState) {
    // Для обработки через кнопки
    return true;
  }

  private async handleLevel(ctx: Context, text: string, userId: string, userState: UserState) {
    // Для обработки через кнопки
    return true;
  }

 
  async formatProfileMessage(user: any): Promise<string> {
    // Форматируем сообщение профиля с правильными визуальными элементами
    
    // Получаем информацию о рейтинге с бейджем
    const ratingInfo = user.level?.ratingInfo || { value: 'Не указан', badge: 'basic', level: 'Неизвестный' };
    
    // Формируем значок спорта
    const sportEmoji = user.sport?.emoji || '🎾';
    const sportTitle = user.sport?.title || 'Не указан';
    
    // Формирование бейджа NTRP
    let levelBadge = '';
    switch(ratingInfo.badge) {
      case 'beginner':
        levelBadge = '🔰';
        break;
      case 'intermediate':
        levelBadge = '🔷';
        break;
      case 'advanced':
        levelBadge = '🔶';
        break;
      case 'expert': 
        levelBadge = '💎';
        break;
      case 'pro':
        levelBadge = '🏆';
        break;
      default:
        levelBadge = '⚪️';
    }
    
    // Форматируем сообщение с улучшенным отображением
    return `👤 Профиль ${user.firstName} ${user.lastName || ''}

${sportEmoji} Вид спорта: ${sportTitle}
${levelBadge} NTRP рейтинг: ${ratingInfo.value} (${ratingInfo.level})
⚡️ Очки силы: ${user.rating?.points || 0}
⭐️ Очки активности: ${user.rating?.ranking || 0}

🏙️ Город: ${user.city || 'Не указан'}
👋 Рука: ${user.playingStyle?.dominantHand === 'RIGHT' ? 'Правая' : 'Левая'}
🏆 Турниров выиграно: ${user.statistics?.tournamentsWon || 0}

📊 Статистика:
📈 Матчей сыграно: ${user.statistics?.matchesPlayed || 0}
🥇 Побед: ${user.statistics?.matchWins || 0}
🥈 Поражений: ${user.statistics?.matchLosses || 0}
📊 Процент побед: ${user.statistics?.winRate || 0}%
`;
}

async handleProfileCommand(ctx: Context): Promise<void> {
  try {
    if (!ctx.from) return;
    
    // Получаем userId из контекста
    const userId = ctx.from.id.toString();
    
    // Получаем данные пользователя
    const user = await this.usersService.getUserFullProfile(userId);
    
    // Используем обновленный метод форматирования 
    const message = await this.formatProfileMessage(user);
    
    // Кнопки
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('✏️ Редактировать профиль', 'edit_profile')],
      [Markup.button.callback('🥇 Достижения', 'achievements')],
      [Markup.button.callback('📊 Рейтинг', 'rating')],
      [Markup.button.callback('🔙 Назад', 'main_menu')]
    ]);
    
    // Отправляем сообщение с новым форматированием
    await ctx.reply(message, {
      ...keyboard,
      parse_mode: 'Markdown'
    });
    
  } catch (error) {
    if (error instanceof Error) {
      this.logger.error(`Ошибка при получении профиля: ${error.message}`, error.stack);
    } else {
      this.logger.error(`Ошибка при получении профиля: ${error}`);
    }
    await ctx.reply('Произошла ошибка при загрузке профиля. Попробуйте позже.');
  }
}

/**
   * НОВЫЕ ОБРАБОТЧИКИ ДЛЯ ДВУХШАГОВОЙ РЕГИСТРАЦИИ
   * Полное соответствие ТЗ
   */

  /**
   * Обработчик выбора спорта
   */
  async handleSportSelection(sportType: string, ctx: Context): Promise<void> {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      if (userState.step !== ProfileStep.AWAITING_SPORT_TYPE) {
        return;
      }
      
      // Сохраняем выбор спорта
      userState.data.sportType = sportType as 'TENNIS' | 'PADEL';
      userState.step = ProfileStep.AWAITING_CITY;
      this.stateService.setUserState(userId, userState);
      
      const sportName = sportType === 'TENNIS' ? 'теннис' : 'падел';
      this.logger.log(`Выбран спорт: ${sportName} для пользователя ${userId}`);
      
      await ctx.reply(`🎾 Отлично! Вы выбрали ${sportName}.\n\n📍 В каком городе вы играете?`);
      
    } catch (error) {
      this.logger.error(`Ошибка при выборе спорта: ${error}`);
      await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
    }
  }

  /**
   * Обработчик выбора времени игры
   */
  async handlePlayTimeSelection(timeSlot: string, ctx: Context): Promise<void> {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      if (userState.step !== ProfileStep.AWAITING_PLAY_TIME) {
        return;
      }
      
      // Инициализируем массив времен игры если его нет
      if (!userState.data.preferredPlayTime) {
        userState.data.preferredPlayTime = [];
      }
      
      // Добавляем или убираем время из предпочтений
      const timeIndex = userState.data.preferredPlayTime.indexOf(timeSlot);
      if (timeIndex === -1) {
        userState.data.preferredPlayTime.push(timeSlot);
      } else {
        userState.data.preferredPlayTime.splice(timeIndex, 1);
      }
      
      this.stateService.setUserState(userId, userState);
      
      const timeNames = {
        'MORNING': 'утром',
        'DAY': 'днём',
        'EVENING': 'вечером',
        'NIGHT': 'ночью'
      };
      
      // Показываем текущий выбор и кнопку продолжения
      const selectedTimes = userState.data.preferredPlayTime.map(t => timeNames[t as keyof typeof timeNames]).join(', ');
      
      await ctx.reply(
        `✅ Время игры: ${selectedTimes || 'не выбрано'}\n\n🕐 Выберите ещё время или продолжите:`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback('🌅 Утром', 'time_MORNING'),
            Markup.button.callback('☀️ Днём', 'time_DAY')
          ],
          [
            Markup.button.callback('🌇 Вечером', 'time_EVENING'),
            Markup.button.callback('🌙 Ночью', 'time_NIGHT')
          ],
          [
            Markup.button.callback('➡️ Продолжить', 'continue_to_frequency')
          ]
        ])
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при выборе времени игры: ${error}`);
      await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
    }
  }

  /**
   * Обработчик кнопки продолжения к частоте игр
   */
  async handleContinueToFrequency(ctx: Context): Promise<void> {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      if (userState.step !== ProfileStep.AWAITING_PLAY_TIME) {
        return;
      }
      
      // Если время не выбрано, установим по умолчанию
      if (!userState.data.preferredPlayTime || userState.data.preferredPlayTime.length === 0) {
        userState.data.preferredPlayTime = ['EVENING'];
      }
      
      // Переходим к частоте игр
      userState.step = ProfileStep.AWAITING_FREQUENCY;
      this.stateService.setUserState(userId, userState);
      
      await ctx.reply(
        '🏃‍♂️ Как часто вы играете?',
        Markup.inlineKeyboard([
          [Markup.button.callback('1 раз в неделю', 'frequency_1')],
          [Markup.button.callback('2-3 раза в неделю', 'frequency_2')],
          [Markup.button.callback('4+ раз в неделю', 'frequency_3')]
        ])
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при переходе к частоте игр: ${error}`);
      await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
    }
  }

  /**
   * Обработчик выбора бэкхенда
   */
  async handleBackhandSelection(backhandType: string, ctx: Context): Promise<void> {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      if (userState.step !== ProfileStep.AWAITING_BACKHAND) {
        return;
      }
      
      userState.data.backhandType = backhandType as 'ONE_HANDED' | 'TWO_HANDED';
      userState.step = ProfileStep.AWAITING_SURFACE;
      this.stateService.setUserState(userId, userState);
      
      const backhandName = backhandType === 'ONE_HANDED' ? 'одноручный' : 'двуручный';
      this.logger.log(`Выбран бэкхенд: ${backhandName} для пользователя ${userId}`);
      
      // Переходим к выбору покрытия
      await ctx.reply(
        `✅ Бэкхенд: ${backhandName}\n\n🏟️ Какое покрытие вы предпочитаете?`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback('🔴 Хард', 'surface_HARD'),
            Markup.button.callback('🟤 Грунт', 'surface_CLAY')
          ],
          [
            Markup.button.callback('🟢 Трава', 'surface_GRASS'),
            Markup.button.callback('🔵 Ковер', 'surface_CARPET')
          ]
        ])
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при выборе бэкхенда: ${error}`);
      await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
    }
  }

  /**
   * Обработчик выбора покрытия
   */
  async handleSurfaceSelection(surface: string, ctx: Context): Promise<void> {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      if (userState.step !== ProfileStep.AWAITING_SURFACE) {
        return;
      }
      
      userState.data.preferredSurface = surface as 'HARD' | 'CLAY' | 'GRASS' | 'CARPET';
      userState.step = ProfileStep.AWAITING_STYLE;
      this.stateService.setUserState(userId, userState);
      
      const surfaceNames = {
        'HARD': 'хард',
        'CLAY': 'грунт', 
        'GRASS': 'трава',
        'CARPET': 'ковер'
      };
      
      this.logger.log(`Выбрано покрытие: ${surfaceNames[surface as keyof typeof surfaceNames]} для пользователя ${userId}`);
      
      // Переходим к выбору стиля игры
      await ctx.reply(
        `✅ Покрытие: ${surfaceNames[surface as keyof typeof surfaceNames]}\n\n🎮 Какой у вас стиль игры?`,
        Markup.inlineKeyboard([
          [Markup.button.callback('🎯 Универсальный', 'style_UNIVERSAL')],
          [Markup.button.callback('🛡️ Защитный', 'style_DEFENSIVE')],
          [Markup.button.callback('⚡ Агрессивный с задней линии', 'style_AGGRESSIVE')],
          [Markup.button.callback('🏐 Сеточник', 'style_NET_PLAYER')],
          [Markup.button.callback('📚 Базовый', 'style_BASIC')]
        ])
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при выборе покрытия: ${error}`);
      await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
    }
  }

  /**
   * Обработчик выбора стиля игры
   */
  async handleStyleSelection(style: string, ctx: Context): Promise<void> {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      if (userState.step !== ProfileStep.AWAITING_STYLE) {
        return;
      }
      
      userState.data.playingStyle = style as 'UNIVERSAL' | 'DEFENSIVE' | 'AGGRESSIVE' | 'NET_PLAYER' | 'BASIC';
      userState.step = ProfileStep.AWAITING_SHOT;
      this.stateService.setUserState(userId, userState);
      
      const styleNames = {
        'UNIVERSAL': 'универсальный',
        'DEFENSIVE': 'защитный',
        'AGGRESSIVE': 'агрессивный с задней линии',
        'NET_PLAYER': 'сеточник',
        'BASIC': 'базовый'
      };
      
      this.logger.log(`Выбран стиль: ${styleNames[style as keyof typeof styleNames]} для пользователя ${userId}`);
      
      // Переходим к выбору любимого удара
      await ctx.reply(
        `✅ Стиль: ${styleNames[style as keyof typeof styleNames]}\n\n🎾 Какой ваш любимый удар?`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback('🚀 Подача', 'shot_SERVE'),
            Markup.button.callback('💪 Форхенд', 'shot_FOREHAND')
          ],
          [
            Markup.button.callback('🎯 Бэкхенд', 'shot_BACKHAND'),
            Markup.button.callback('🏐 Слёт', 'shot_VOLLEY')
          ],
          [Markup.button.callback('⚡ Смэш', 'shot_SMASH')]
        ])
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при выборе стиля игры: ${error}`);
      await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
    }
  }

  /**
   * Обработчик выбора любимого удара
   */
  async handleShotSelection(shot: string, ctx: Context): Promise<void> {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      if (userState.step !== ProfileStep.AWAITING_SHOT) {
        return;
      }
      
      userState.data.favoriteShot = shot as 'SERVE' | 'FOREHAND' | 'BACKHAND' | 'VOLLEY' | 'SMASH';
      userState.step = ProfileStep.AWAITING_RACKET;
      this.stateService.setUserState(userId, userState);
      
      const shotNames = {
        'SERVE': 'подача',
        'FOREHAND': 'форхенд',
        'BACKHAND': 'бэкхенд',
        'VOLLEY': 'слёт',
        'SMASH': 'смэш'
      };
      
      this.logger.log(`Выбран удар: ${shotNames[shot as keyof typeof shotNames]} для пользователя ${userId}`);
      
      // Переходим к вводу ракетки
      await ctx.reply(
        `✅ Любимый удар: ${shotNames[shot as keyof typeof shotNames]}\n\n🎾 Какой ракеткой вы играете? (напишите модель или "любая")`
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при выборе удара: ${error}`);
      await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
    }
  }

  /**
   * Обработчик выбора предпочтений по сопернику
   */
  async handleOpponentSelection(preference: string, ctx: Context): Promise<void> {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      if (userState.step !== ProfileStep.AWAITING_OPPONENT_PREF) {
        return;
      }
      
      userState.data.opponentPreference = preference as 'ANY' | 'MEN' | 'WOMEN' | 'SAME_LEVEL' | 'STRONGER' | 'WEAKER';
      userState.step = ProfileStep.COMPLETE;
      this.stateService.setUserState(userId, userState);
      
      this.logger.log(`Выбраны предпочтения по сопернику: ${preference} для пользователя ${userId}`);
      
      // Завершаем настройку профиля
      await this.completeProfileSetupNew(userId, userState.data);
      
      const preferenceNames = {
        'ANY': 'без разницы',
        'MEN': 'мужчины',
        'WOMEN': 'женщины',
        'SAME_LEVEL': 'похожий уровень',
        'STRONGER': 'сильнее меня',
        'WEAKER': 'слабее меня'
      };
      
      // Отображаем сообщение об успешном завершении
      await ctx.reply(
        `✅ Предпочтения по сопернику: ${preferenceNames[preference as keyof typeof preferenceNames]}\n\n🎉 **Профиль успешно настроен!**\n\nТеперь система может присвоить вам начальный рейтинг и подбирать подходящих соперников.\n\nВы можете пользоваться всеми функциями приложения!`,
        Markup.inlineKeyboard([
          [Markup.button.callback('👤 Перейти в профиль', 'profile')],
          [Markup.button.callback('🎮 Главное меню', 'main_menu')]
        ])
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при выборе предпочтений: ${error}`);
      await ctx.reply('❌ Произошла ошибка при сохранении профиля. Попробуйте еще раз.');
    }
  }

  /**
   * Обработчик текстовых сообщений для всех этапов регистрации
   */
  async handleTextMessage(ctx: Context): Promise<void> {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;
    
    const userId = ctx.from.id.toString();
    const text = ctx.message.text;
    const userState = this.stateService.getUserState(userId);
    
    if (!userState) return;
    
    try {
      switch (userState.step) {
        case ProfileStep.AWAITING_CITY:
          await this.handleCityInput(text, ctx);
          break;
        case ProfileStep.AWAITING_COURT:
          await this.handleCourtInput(text, ctx);
          break;
        case ProfileStep.AWAITING_RACKET:
          await this.handleRacketInput(text, ctx);
          break;
        default:
          // Игнорируем сообщения не в процессе регистрации
          break;
      }
    } catch (error) {
      this.logger.error(`Ошибка обработки текстового сообщения: ${error}`);
      await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
    }
  }

  /**
   * Обработчик ввода города
   */
  async handleCityInput(city: string, ctx: Context): Promise<void> {
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    const userState = this.stateService.getUserState(userId);
    
    if (userState.step !== ProfileStep.AWAITING_CITY) return;
    
    userState.data.city = city;
    userState.step = ProfileStep.AWAITING_COURT;
    this.stateService.setUserState(userId, userState);
    
    await ctx.reply(`✅ Город: ${city}\n\n🏟️ Какой корт вы обычно используете? (например, "Центральный спортивный комплекс" или "любой")`);
  }

  /**
   * Обработчик ввода корта
   */
  async handleCourtInput(court: string, ctx: Context): Promise<void> {
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    const userState = this.stateService.getUserState(userId);
    
    if (userState.step !== ProfileStep.AWAITING_COURT) return;
    
    userState.data.preferredCourt = court;
    userState.step = ProfileStep.AWAITING_HAND;
    this.stateService.setUserState(userId, userState);
    
    await ctx.reply(
      `✅ Предпочитаемый корт: ${court}\n\n🤚 Какой рукой вы играете?`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('👈 Левой', 'hand_LEFT'),
          Markup.button.callback('👉 Правой', 'hand_RIGHT')
        ]
      ])
    );
  }

  /**
   * Обработчик ввода ракетки
   */
  async handleRacketInput(racket: string, ctx: Context): Promise<void> {
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    const userState = this.stateService.getUserState(userId);
    
    if (userState.step !== ProfileStep.AWAITING_RACKET) return;
    
    userState.data.racket = racket;
    userState.step = ProfileStep.AWAITING_OPPONENT_PREF;
    this.stateService.setUserState(userId, userState);
    
    await ctx.reply(
      `✅ Ракетка: ${racket}\n\n👥 С кем вы предпочитаете играть?`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('🤷 Без разницы', 'opponent_ANY'),
          Markup.button.callback('👨 Только с мужчинами', 'opponent_MEN')
        ],
        [
          Markup.button.callback('👩 Только с женщинами', 'opponent_WOMEN'),
          Markup.button.callback('⚖️ Похожий уровень', 'opponent_SAME_LEVEL')
        ],
        [
          Markup.button.callback('💪 Сильнее меня', 'opponent_STRONGER'),
          Markup.button.callback('🎯 Слабее меня', 'opponent_WEAKER')
        ]
      ])
    );
  }

  /**
   * НОВЫЙ МЕТОД сохранения профиля с ПОЛНЫМИ данными согласно ТЗ
   */
  async completeProfileSetupNew(telegramUserId: string, profileData: any): Promise<void> {
    try {
      this.logger.log(`Сохранение полного профиля для Telegram ID: ${telegramUserId}`);
      
      // Находим пользователя по telegramId
      const user = await this.prisma.user.findUnique({
        where: { telegramId: telegramUserId }
      });
      
      if (!user) {
        throw new NotFoundException(`Пользователь с Telegram ID ${telegramUserId} не найден`);
      }
      
      const userId = user.id;
      this.logger.log(`Найден пользователь в БД с ID: ${userId}`);
      
      // ШАГ 1: Основные данные игрока с ВСЕМИ собранными полями
      const profileStepOneDto = {
        firstName: profileData.firstName || user.firstName,
        lastName: profileData.lastName || user.lastName || undefined,
        city: profileData.city,
        preferredCourt: profileData.preferredCourt,
        dominantHand: profileData.dominantHand,
        preferredPlayTime: profileData.preferredPlayTime || ['EVENING'],
        playsInTournaments: profileData.playsInTournaments || false,
        weeklyPlayFrequency: profileData.weeklyPlayFrequency || 'TWO_THREE',
        sportType: profileData.sportType || 'TENNIS' // Обязательное поле согласно ТЗ
      };
      
      this.logger.log(`Сохраняем Шаг 1:`, profileStepOneDto);
      await this.usersService.completeProfileStepOne(userId.toString(), profileStepOneDto);
      
      // ШАГ 2: Стиль игры и уровень с ВСЕМИ собранными полями 
      const profileStepTwoDto = {
        selfAssessedLevel: profileData.selfAssessedLevel || 'BEGINNER',
        backhandType: profileData.backhandType || 'TWO_HANDED',
        preferredSurface: profileData.preferredSurface || 'HARD',
        playingStyle: profileData.playingStyle || 'UNIVERSAL',
        favoriteShot: profileData.favoriteShot || 'FOREHAND',
        racket: profileData.racket || 'Любая',
        opponentPreference: profileData.opponentPreference || 'ANY'
      };
      
      this.logger.log(`Сохраняем Шаг 2:`, profileStepTwoDto);
      await this.usersService.completeProfileStepTwo(userId.toString(), profileStepTwoDto);
      
      this.logger.log(`✅ Полный профиль успешно сохранен для пользователя ${userId}`);
      
    } catch (error) {
      this.logger.error(`Ошибка при сохранении полного профиля: ${error}`);
      throw error;
    }
  }

  /**
   * Обновленный обработчик перехода к Шагу 2 после завершения турниров
   */
  async handleStartStepTwo(ctx: Context): Promise<void> {
    try {
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      // Переходим к Шагу 2: Стиль игры и уровень
      userState.step = ProfileStep.AWAITING_LEVEL;
      this.stateService.setUserState(userId, userState);
      
      await ctx.reply(
        '🥈 **ШАГ 2: Стиль игры и уровень**\n\nТеперь давайте определим ваш уровень игры для точного рейтинга NTRP.\n\nКакой у вас уровень игры?',
        Markup.inlineKeyboard([
          [Markup.button.callback('🔰 Новичок (1.0-2.0)', 'level_BEGINNER_1_2')],
          [Markup.button.callback('🎾 Любитель (2.5-3.5)', 'level_AMATEUR_2_3')],
          [Markup.button.callback('💪 Уверенный игрок (4.0-4.5)', 'level_CONFIDENT_4')],
          [Markup.button.callback('🏆 Турнирный уровень (5.0+)', 'level_TOURNAMENT_5')],
          [Markup.button.callback('👨‍🏫 Полупрофи/тренер', 'level_SEMI_PRO')]
        ])
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при переходе к Шагу 2: ${error}`);
      await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
    }
  }

  /**
   * Обновленный обработчик выбора уровня для Шага 2
   */
  async handleLevelSelectionStepTwo(level: string, ctx: Context): Promise<void> {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      if (userState.step !== ProfileStep.AWAITING_LEVEL) {
        return;
      }
      
      userState.data.selfAssessedLevel = level as "BEGINNER" | "AMATEUR" | "CONFIDENT" | "TOURNAMENT" | "SEMI_PRO";
      userState.step = ProfileStep.AWAITING_BACKHAND;
      this.stateService.setUserState(userId, userState);
      
      const levelNames = {
        'BEGINNER': 'Новичок (1.0-2.0)',
        'AMATEUR': 'Любитель (2.5-3.5)', 
        'CONFIDENT': 'Уверенный игрок (4.0-4.5)',
        'TOURNAMENT': 'Турнирный уровень (5.0+)',
        'SEMI_PRO': 'Полупрофи/тренер'
      };
      
      this.logger.log(`Выбран уровень: ${levelNames[level as keyof typeof levelNames]} для пользователя ${userId}`);
      
      // Переходим к выбору бэкхенда
      await ctx.reply(
        `✅ Уровень: ${levelNames[level as keyof typeof levelNames]}\n\n🎾 Какой у вас бэкхенд?`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback('🤚 Одноручный', 'backhand_ONE'),
            Markup.button.callback('🙌 Двуручный', 'backhand_TWO')
          ]
        ])
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при выборе уровня в Шаге 2: ${error}`);
      await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
    }
  }

  // =====================================
  // 🔍 ПУБЛИЧНЫЕ ПРОФИЛИ (ЧУЖИЕ ПРОФИЛИ)
  // =====================================

  /**
   * Просмотр чужого профиля (публичная версия)
   */
  async handlePublicProfile(ctx: Context, targetUserId: string): Promise<void> {
    try {
      if (!ctx.from) return;
      
      const viewerUserId = ctx.from.id;
      this.logger.log(`Пользователь ${viewerUserId} просматривает профиль ${targetUserId}`);
      
      // Получаем данные о пользователе
      const targetUser = await this.usersService.findById(targetUserId);
      if (!targetUser) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }

      // Получаем статистику из базы данных
      const stats = {
        matchesPlayed: 0,
        matchWins: 0,
        matchLosses: 0,
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        lastActivity: new Date()
      };
      
      // Формируем публичный профиль
      const profileMessage = await this.formatPublicProfileMessage(targetUser, stats);
      const keyboard = this.keyboardService.getPublicProfileKeyboard(targetUserId);
      
      // Отправляем сообщение (без аватара пока)
      await ctx.reply(profileMessage, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'HTML'
      });
      
    } catch (error) {
      this.logger.error(`Ошибка при просмотре публичного профиля: ${error}`);
      await ctx.reply('❌ Произошла ошибка при загрузке профиля');
    }
  }

  /**
   * Форматирование сообщения для публичного профиля
   */
  private async formatPublicProfileMessage(user: any, userStats: any): Promise<string> {
    const username = user.username ? `@${user.username}` : 'Не указан';
    const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
    const level = this.getLevelText(user.profile?.selfAssessedLevel);
    const sportEmoji = user.profile?.sportType === 'PADEL' ? '🏓' : '🎾';
    const sport = user.profile?.sportType === 'PADEL' ? 'Падел' : 'Теннис';
    const location = user.profile?.city ? `${user.profile.city}${user.profile.countryCode ? `, ${user.profile.countryCode}` : ''}` : 'Не указано';
    const rating = user.profile?.ntrpRating ? `${user.profile.ntrpRating}` : 'Не оценен';
    
    // Простые очки для примера
    const powerPoints = user.profile?.powerPoints || 0;
    const activityPoints = user.profile?.activityPoints || 0;
    
    return `👤 <b>${fullName}</b>
🏷️ Username: ${username}
${sportEmoji} ${sport}

🎯 NTRP рейтинг: ${rating}
⚡ Очки силы: ${powerPoints}
⭐ Очки активности: ${activityPoints}

📍 Местоположение: ${location}
🏆 Уровень: ${level}
👋 Рука: ${user.profile?.dominantHand === 'LEFT' ? 'Левая' : 'Правая'}

📊 <b>Статистика:</b>
📈 Матчей сыграно: ${userStats?.matchesPlayed || 0}
🏆 Побед: ${userStats?.matchWins || 0}
📉 Поражений: ${userStats?.matchLosses || 0}
🔁 Турниров сыграно: ${userStats?.tournamentsPlayed || 0}
📈 Побед в турнирах: ${userStats?.tournamentsWon || 0}
${userStats?.lastActivity ? `📅 Последняя активность: ${new Date(userStats.lastActivity).toLocaleDateString('ru-RU')}` : ''}

<i>Публичный профиль</i>`;
  }

  /**
   * Обработчик для кнопки "Сыграть с игроком"
   */
  async handlePlayWithPlayer(ctx: Context, targetUserId: string): Promise<void> {
    try {
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      this.logger.log(`Пользователь ${userId} хочет сыграть с ${targetUserId}`);
      
      // Получаем данные о цели
      const targetUser = await this.usersService.findById(targetUserId);
      if (!targetUser) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }
      
      const targetName = `${targetUser.first_name} ${targetUser.last_name || ''}`.trim();
      
      await ctx.reply(
        `🎾 <b>Приглашение в игру</b>\n\nВы хотите пригласить <b>${targetName}</b> сыграть в матч?\n\nВыберите действие:`,
        Markup.inlineKeyboard([
          [Markup.button.callback('✅ Отправить приглашение', `send_match_invite_${targetUserId}`)],
          [Markup.button.callback('📅 Запланировать матч', `schedule_match_${targetUserId}`)],
          [Markup.button.callback('🔙 Назад к профилю', `public_profile_${targetUserId}`)]
        ])
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при обработке "Сыграть с игроком": ${error}`);
      await ctx.reply('❌ Произошла ошибка');
    }
  }

  /**
   * Обработчик для кнопки "Написать"
   */
  async handleMessagePlayer(ctx: Context, targetUserId: string): Promise<void> {
    try {
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      this.logger.log(`Пользователь ${userId} хочет написать пользователю ${targetUserId}`);
      
      // Получаем данные о цели
      const targetUser = await this.usersService.findById(targetUserId);
      if (!targetUser) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }
      
      const targetName = `${targetUser.first_name} ${targetUser.last_name || ''}`.trim();
      
      // Устанавливаем состояние для отправки сообщения
      const userState = this.stateService.getUserState(userId);
      userState.waitingForMessage = targetUserId;
      this.stateService.setUserState(userId, userState);
      
      await ctx.reply(
        `✍️ <b>Написать сообщение</b>\n\nВы пишете пользователю <b>${targetName}</b>\n\nВведите ваше сообщение:`,
        Markup.inlineKeyboard([
          [Markup.button.callback('🔙 Отмена', `public_profile_${targetUserId}`)]
        ])
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при обработке "Написать": ${error}`);
      await ctx.reply('❌ Произошла ошибка');
    }
  }

  /**
   * Обработчик для кнопки "Пожаловаться"
   */
  async handleReportPlayer(ctx: Context, targetUserId: string): Promise<void> {
    try {
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      this.logger.log(`Пользователь ${userId} подает жалобу на ${targetUserId}`);
      
      // Получаем данные о цели
      const targetUser = await this.usersService.findById(targetUserId);
      if (!targetUser) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }
      
      const targetName = `${targetUser.first_name} ${targetUser.last_name || ''}`.trim();
      
      await ctx.reply(
        `⚠️ <b>Подать жалобу</b>\n\nВы хотите пожаловаться на <b>${targetName}</b>\n\nВыберите причину:`,
        Markup.inlineKeyboard([
          [Markup.button.callback('🤬 Неприемлемое поведение', `report_behavior_${targetUserId}`)],
          [Markup.button.callback('🚫 Спам', `report_spam_${targetUserId}`)],
          [Markup.button.callback('🔞 Неуместный контент', `report_content_${targetUserId}`)],
          [Markup.button.callback('🎭 Фейковый аккаунт', `report_fake_${targetUserId}`)],
          [Markup.button.callback('📝 Другая причина', `report_other_${targetUserId}`)],
          [Markup.button.callback('🔙 Отмена', `public_profile_${targetUserId}`)]
        ])
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при обработке жалобы: ${error}`);
      await ctx.reply('❌ Произошла ошибка');
    }
  }

  /**
   * Обработчик отправки сообщения другому пользователю
   */
  async handleSendDirectMessage(ctx: Context, messageText: string): Promise<void> {
    try {
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      const userState = this.stateService.getUserState(userId);
      
      if (!userState.waitingForMessage) {
        return;
      }
      
      const targetUserId = userState.waitingForMessage;
      const senderName = `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim();
      
      // Сохраняем сообщение в базу данных
      await this.prisma.directMessage.create({
        data: {
          senderId: parseInt(userId),
          recipientId: parseInt(targetUserId),
          message: messageText
        }
      });
      
      // Отправляем уведомление получателю
      try {
        await ctx.telegram.sendMessage(parseInt(targetUserId), 
          `📩 <b>Новое сообщение</b>\n\nОт: <b>${senderName}</b>\n\n${messageText}`,
          { parse_mode: 'HTML' }
        );
      } catch (error) {
        this.logger.warn(`Не удалось отправить уведомление пользователю ${targetUserId}: ${error}`);
      }
      
      // Очищаем состояние
      userState.waitingForMessage = undefined;
      this.stateService.setUserState(userId, userState);
      
      await ctx.reply(
        `✅ <b>Сообщение отправлено!</b>\n\nВаше сообщение было доставлено пользователю.`,
        Markup.inlineKeyboard([
          [Markup.button.callback('🔙 Назад к профилю', `public_profile_${targetUserId}`)]
        ])
      );
      
    } catch (error) {
      this.logger.error(`Ошибка при отправке сообщения: ${error}`);
      await ctx.reply('❌ Произошла ошибка при отправке сообщения');
    }
  }
}
