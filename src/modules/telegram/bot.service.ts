import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import { InjectBot, Start, On, Hears, Command, Update, Action } from 'nestjs-telegraf';

import { ProfileHandler } from './handlers/profile.handler';
import { MatchesHandler } from './handlers/matches.handler';
import { RequestsHandler } from './handlers/requests.handler';
import { TournamentsHandler } from './handlers/tournaments.handler';
import { TrainingsHandler } from './handlers/trainings.handler'
import { StoriesHandler } from './handlers/stories.handler';
import { CasesHandler } from './handlers/cases.handler';
import { AiCoachHandler } from './handlers/ai-coach.handler';
import { CommonHandler } from './handlers/common.handler';
import { MessagingHandler } from './handlers/messaging.handler';
import { StateService } from './services/state.service';

@Update()
@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly profileHandler: ProfileHandler,
    private readonly matchesHandler: MatchesHandler,
    private readonly requestsHandler: RequestsHandler,
    private readonly tournamentsHandler: TournamentsHandler,
    private readonly trainingHandler: TrainingsHandler,
    private readonly storiesHandler: StoriesHandler,
    private readonly casesHandler: CasesHandler,
    private readonly aiCoachHandler: AiCoachHandler,
    private readonly commonHandler: CommonHandler,
    private readonly messagingHandler: MessagingHandler,
    private readonly stateService: StateService
  ) {}

  async onModuleInit() {
    this.logger.debug('🔧 BotService.onModuleInit() запущен');
    this.logger.log('Инициализация Telegram бота...');

    try {
      // Проверяем информацию о боте
      this.logger.debug('🔍 Получение информации о боте...');
      const botInfo = await this.bot.telegram.getMe();
      this.logger.log(`🤖 Бот подключен: @${botInfo.username} (${botInfo.first_name})`);
      this.logger.debug(`📊 Полная информация о боте: ${JSON.stringify(botInfo)}`);
      
      // Удаляем webhook если он есть, чтобы включить polling
      this.logger.debug('🔄 Удаление webhook...');
      await this.bot.telegram.deleteWebhook();
      this.logger.log('🔄 Webhook удален для активации polling');
      
      // НЕ РЕГИСТРИРУЕМ ОБРАБОТЧИКИ ВРУЧНУЮ! Используем только декораторы
      this.logger.debug('🔧 Обработчики будут управляться через декораторы nestjs-telegraf');
      
      // Добавляем обработчик ошибок
      this.logger.debug('🔧 Установка обработчика ошибок...');
      this.bot.catch((err, ctx) => {
        this.logger.error('❌ Ошибка в боте:', err);
        this.logger.error('📊 Контекст ошибки:', JSON.stringify(ctx.update));
        console.error('Полная ошибка:', err);
        console.error('Полный контекст:', ctx);
      });

      this.logger.log('Бот успешно инициализирован');
      this.logger.debug('✅ BotService.onModuleInit() завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при инициализации бота:', error);
      this.logger.error('📊 Детали ошибки:', JSON.stringify(error));
    }
  }

  // Общий обработчик для всех обновлений - ОТКЛЮЧЕН для тестирования декораторов
  // @On('message')
  async onMessage_DISABLED(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @On("message") вызван');
    this.logger.log(`📨 Получено сообщение: ${JSON.stringify(ctx.message)}`);
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username}, ID: ${ctx.from?.id})`);
    this.logger.debug(`💬 В чате: ${ctx.chat?.id} (тип: ${ctx.chat?.type})`);
    
    // Добавляем проверку на текстовое сообщение
    if (ctx.message && 'text' in ctx.message) {
      const text = ctx.message.text;
      this.logger.log(`📝 Текст сообщения: "${text}"`);
      this.logger.debug(`📝 Длина текста: ${text.length} символов`);
      
      // Проверяем, не является ли это командой
      if (text.startsWith('/')) {
        this.logger.log(`🔧 Обнаружена команда: ${text}`);
        this.logger.debug('🔄 Передача команды специальным декораторам...');
        return; // Команды обрабатываются отдельными декораторами
      }
      
      // Обрабатываем как текст
      this.logger.debug('📝 Обработка как обычный текст...');
      await this.handleText(ctx);
    } else {
      this.logger.debug('📨 Сообщение не содержит текста');
      if (ctx.message && 'photo' in ctx.message) {
        this.logger.debug('📷 Получено фото');
      }
      if (ctx.message && 'document' in ctx.message) {
        this.logger.debug('📄 Получен документ');
      }
      if (ctx.message && 'voice' in ctx.message) {
        this.logger.debug('🎤 Получено голосовое сообщение');
      }
    }
    this.logger.debug('✅ onMessage завершен');
  }

  // Обработка callback_query через Action декораторы
  // @On('callback_query') - ОТКЛЮЧЕН, чтобы Action декораторы могли работать
  async onCallbackQuery_DISABLED(ctx: Context) {
    this.logger.debug('� DECORATOR @On("callback_query") вызван - ОТКЛЮЧЕН');
    // Этот обработчик отключен, чтобы @Action декораторы могли работать
  }

  // Основные точки входа
  @Start()
  async handleStart(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Start() вызван');
    this.logger.log('📨 Получена команда /start');
    this.logger.log(`👤 Пользователь: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    this.logger.log(`💬 Chat ID: ${ctx.chat?.id}`);
    this.logger.debug(`📊 Полная информация о пользователе: ${JSON.stringify(ctx.from)}`);
    this.logger.debug(`📊 Полная информация о чате: ${JSON.stringify(ctx.chat)}`);
    
    try {
      this.logger.debug('🔄 Вызов commonHandler.handleStart...');
      await this.commonHandler.handleStart(ctx);
      this.logger.log('✅ Команда /start обработана успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке /start:', error);
      this.logger.error('📊 Детали ошибки:', JSON.stringify(error));
      await ctx.reply('❌ Произошла ошибка при обработке команды');
    }
  }

  @Command('help')
  async handleHelp(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Command("help") вызван');
    this.logger.log('📨 Получена команда /help');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      await ctx.reply('📖 Справка по командам:\n\n/start - Начать работу с ботом\n/help - Показать эту справку\n/profile - Мой профиль');
      this.logger.log('✅ Команда /help обработана успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке /help:', error);
    }
  }

  @Hears('👤 Профиль')
  async handleProfile(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Hears("👤 Профиль") вызван');
    this.logger.log('📨 Нажата кнопка: Профиль');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      const result = await this.profileHandler.handleProfile(ctx);
      this.logger.debug('✅ handleProfile завершен успешно');
      return result;
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке кнопки Профиль:', error);
      throw error;
    }
  }

  @Hears('🎾 Играть')
  async handlePlay(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Hears("🎾 Играть") вызван');
    this.logger.log('📨 Нажата кнопка: Играть');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      const result = await this.requestsHandler.handlePlay(ctx);
      this.logger.debug('✅ handlePlay завершен успешно');
      return result;
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке кнопки Играть:', error);
      throw error;
    }
  }

  @Hears('🏆 Турниры')
  async handleTournaments(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Hears("🏆 Турниры") вызван');
    this.logger.log('📨 Нажата кнопка: Турниры');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      const result = await this.tournamentsHandler.handleTournaments(ctx);
      this.logger.debug('✅ handleTournaments завершен успешно');
      return result;
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке кнопки Турниры:', error);
      throw error;
    }
  }

  @Hears('🏃‍♂️ Тренировки')
  async handleTrainings(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Hears("🏃‍♂️ Тренировки") вызван');
    this.logger.log('📨 Нажата кнопка: Тренировки');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      const result = await this.trainingHandler.handleTrainings(ctx);
      this.logger.debug('✅ handleTrainings завершен успешно');
      return result;
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке кнопки Тренировки:', error);
      throw error;
    }
  }

  // Дополнительные обработчики кнопок меню
  @Hears('📱 Stories')
  async handleStories(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Hears("📱 Stories") вызван');
    this.logger.log('📱 Нажата кнопка: Stories');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      await this.storiesHandler.handleStories(ctx);
      this.logger.debug('✅ handleStories завершен успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке Stories:', error);
      throw error;
    }
  }

  @Hears('🎁 Кейсы')
  async handleCases(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Hears("🎁 Кейсы") вызван');
    this.logger.log('🎁 Нажата кнопка: Кейсы');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      await this.casesHandler.handleCases(ctx);
      this.logger.debug('✅ handleCases завершен успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке Кейсов:', error);
      throw error;
    }
  }

  @Hears('📝 Записать результат')
  async handleRecordResult(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Hears("📝 Записать результат") вызван');
    this.logger.log('📝 Нажата кнопка: Записать результат');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      await this.matchesHandler.handleRecordMatch(ctx);
      this.logger.debug('✅ handleRecordMatch завершен успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при записи результата:', error);
      throw error;
    }
  }

  @Hears('🔗 Пригласить друга')
  async handleInviteFriend(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Hears("🔗 Пригласить друга") вызван');
    this.logger.log('🔗 Нажата кнопка: Пригласить друга');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      await this.commonHandler.handleInviteButton(ctx);
      this.logger.debug('✅ handleInviteButton завершен успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при приглашении друга:', error);
      throw error;
    }
  }

  @Hears('🤖 AI-Coach')
  async handleAiCoach(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Hears("🤖 AI-Coach") вызван');
    this.logger.log('🤖 Нажата кнопка: AI-Coach');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      await this.aiCoachHandler.handleAICoach(ctx);
      this.logger.debug('✅ handleAICoach завершен успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке AI-Coach:', error);
      throw error;
    }
  }

  @Hears('📍 Корты')
  async handleCourts(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Hears("📍 Корты") вызван');
    this.logger.log('📍 Нажата кнопка: Корты');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      await ctx.reply('📍 Раздел "Корты" пока в разработке...');
      this.logger.debug('✅ handleCourts завершен успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке Кортов:', error);
      throw error;
    }
  }

  @Hears('⚙️ Настройки')
  async handleSettings(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Hears("⚙️ Настройки") вызван');
    this.logger.log('⚙️ Нажата кнопка: Настройки');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      await ctx.reply('⚙️ Раздел "Настройки" пока в разработке...');
      this.logger.debug('✅ handleSettings завершен успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке Настроек:', error);
      throw error;
    }
  }

  // Обработка текстовых сообщений
  @On('text')
  async handleText(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @On("text") вызван');
    
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) {
      this.logger.debug('❌ Невалидные данные для обработки текста');
      return;
    }
    
    const userId = ctx.from.id.toString();
    const text = ctx.message.text;
    this.logger.debug(`👤 Пользователь ID: ${userId}`);
    this.logger.debug(`📝 Текст для обработки: "${text}"`);

    // Проверка состояния пользователя
    const userState = this.stateService.getUserState(userId);
    this.logger.log(`📝 Получено сообщение: ${text}, состояние: ${userState.step}`);
    this.logger.debug(`🔍 Полное состояние пользователя: ${JSON.stringify(userState)}`);

    // Перенаправляем в соответствующий обработчик в зависимости от состояния
    try {
      this.logger.debug('🔄 Попытка обработки через ProfileHandler...');
      // Профиль
      if (await this.profileHandler.handleProfileInput(ctx, text, userId)) {
        this.logger.debug('✅ Обработано ProfileHandler');
        return;
      }

      this.logger.debug('🔄 Попытка обработки через MatchesHandler...');
      // Матчи
      if (await this.matchesHandler.handleMatchInput(ctx, text, userId)) {
        this.logger.debug('✅ Обработано MatchesHandler');
        return;
      }

      this.logger.debug('🔄 Попытка обработки через RequestsHandler...');
      // Заявки
      if (await this.requestsHandler.handleRequestInput(ctx, text, userId)) {
        this.logger.debug('✅ Обработано RequestsHandler');
        return;
      }

      this.logger.debug('🔄 Попытка обработки через TournamentsHandler...');
      // Турниры
      if (await this.tournamentsHandler.handleTournamentInput(ctx, text, userId)) {
        this.logger.debug('✅ Обработано TournamentsHandler');
        return;
      }

      this.logger.debug('🔄 Попытка обработки через TrainingsHandler...');
      // Тренировки
      if (await this.trainingHandler.handleTrainingInput(ctx, text, userId)) {
        this.logger.debug('✅ Обработано TrainingsHandler');
        return;
      }

      this.logger.debug('🔄 Попытка обработки через StoriesHandler...');
      // Stories
      if (await this.storiesHandler.handleStoryInput(ctx, text, userId)) {
        this.logger.debug('✅ Обработано StoriesHandler');
        return;
      }

      this.logger.debug('🔄 Попытка обработки через AiCoachHandler...');
      // AI Coach
      if (await this.aiCoachHandler.handleAIInput(ctx, text, userId)) {
        this.logger.debug('✅ Обработано AiCoachHandler');
        return;
      }

      this.logger.debug('❓ Текст не обработан ни одним обработчиком');
      // Если сообщение не обработано, показываем подсказку
      await ctx.reply(
        `🤔 Я не понимаю эту команду.\n\n` +
        `Используйте кнопки меню для навигации:`,
        { 
          reply_markup: { 
            keyboard: [
              ['👤 Профиль', '🎾 Играть'],
              ['🏆 Турниры', '🏃‍♂️ Тренировки'],
              ['📍 Корты', '🤖 AI-Coach'],
              ['⚙️ Настройки']
            ], 
            resize_keyboard: true 
          }
        }
      );
      this.logger.debug('✅ Отправлено сообщение с подсказкой');
    } catch (error) {
      this.logger.error(`❌ Ошибка при обработке текста: ${error}`);
      this.logger.error(`📊 Детали ошибки: ${JSON.stringify(error)}`);
      await ctx.reply('❌ Произошла ошибка при обработке вашего сообщения');
    }
    this.logger.debug('✅ handleText завершен');
  }

  // Обработка фото для Stories
  @On('photo')
  async handlePhoto(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @On("photo") вызван');
    this.logger.log('📸 Получено фото');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      const result = await this.storiesHandler.handlePhoto(ctx);
      this.logger.debug('✅ handlePhoto завершен успешно');
      return result;
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке фото:', error);
      throw error;
    }
  }

  // Обработка видео для Stories
  @On('video')
  async handleVideo(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @On("video") вызван');
    this.logger.log('🎥 Получено видео');
    this.logger.debug(`👤 От пользователя: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    
    try {
      const result = await this.storiesHandler.handleVideo(ctx);
      this.logger.debug('✅ handleVideo завершен успешно');
      return result;
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке видео:', error);
      throw error;
    }
  }

  // Обработка команд для отладки
  @Command('debug')
  async handleDebug(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Command("debug") вызван');
    this.logger.log('📨 Получена команда /debug');
    
    if (!ctx.from) {
      this.logger.debug('❌ Нет информации о пользователе');
      return;
    }
    
    const userId = ctx.from.id.toString();
    const userState = this.stateService.getUserState(userId);
    this.logger.debug(`👤 Запрос отладочной информации от пользователя: ${userId}`);

    await ctx.reply(
      `🔍 **Отладочная информация**\n\n` +
      `User ID: ${userId}\n` +
      `State: ${userState.step}\n` +
      `Data: ${JSON.stringify(userState.data, null, 2)}`,
      { parse_mode: 'Markdown' }
    );
    this.logger.debug('✅ Отладочная информация отправлена');
  }

  // Методы для внешнего использования
  async processUpdate(update: any) {
    this.logger.debug('🔍 processUpdate вызван');
    this.logger.log('📥 Обработка входящего обновления');
    this.logger.debug(`📊 Данные обновления: ${JSON.stringify(update)}`);
    
    try {
      await this.bot.handleUpdate(update);
      this.logger.debug('✅ processUpdate завершен успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при обработке обновления:', error);
      this.logger.error(`📊 Детали ошибки: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async getBotInfo() {
    return this.bot.telegram.getMe();
  }

  // Action декораторы для callback кнопок
  @Action('main_menu')
  async handleMainMenuAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("main_menu") вызван');
    this.logger.log('🏠 Возврат в главное меню');
    
    try {
      await ctx.answerCbQuery();
      await this.commonHandler.handleStart(ctx);
      this.logger.debug('✅ Возврат в главное меню завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при возврате в главное меню:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('my_tournaments')
  async handleMyTournamentsAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("my_tournaments") вызван');
    this.logger.log('📋 Показ моих турниров');
    
    try {
      await ctx.answerCbQuery();
      await this.tournamentsHandler.handleMyTournaments(ctx);
      this.logger.debug('✅ Показ моих турниров завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при показе моих турниров:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('find_tournament')
  async handleFindTournamentAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("find_tournament") вызван');
    this.logger.log('🔍 Поиск турниров');
    
    try {
      await ctx.answerCbQuery();
      await this.tournamentsHandler.handleFindTournament(ctx);
      this.logger.debug('✅ Поиск турниров завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при поиске турниров:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('create_tournament')
  async handleCreateTournamentAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("create_tournament") вызван');
    this.logger.log('🏆 Создание турнира');
    
    try {
      await ctx.answerCbQuery();
      await this.tournamentsHandler.handleCreateTournament(ctx);
      this.logger.debug('✅ Создание турнира завершено');
    } catch (error) {
      this.logger.error('❌ Ошибка при создании турнира:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Action декораторы для callback кнопок профиля
  @Action('detailed_stats')
  async handleDetailedStatsAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("detailed_stats") вызван');
    this.logger.log('📊 Показ подробной статистики');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleDetailedStats(ctx);
      this.logger.debug('✅ Подробная статистика показана');
    } catch (error) {
      this.logger.error('❌ Ошибка при показе подробной статистики:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('user_achievements')
  async handleUserAchievementsAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("user_achievements") вызван');
    this.logger.log('🏆 Показ достижений пользователя');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleUserAchievements(ctx);
      this.logger.debug('✅ Достижения показаны');
    } catch (error) {
      this.logger.error('❌ Ошибка при показе достижений:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('setup_profile')
  async handleSetupProfileAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("setup_profile") вызван');
    this.logger.log('🔄 Обновление профиля');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleSetupProfileAction(ctx);
      this.logger.debug('✅ Обновление профиля завершено');
    } catch (error) {
      this.logger.error('❌ Ошибка при обновлении профиля:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('user_goals')
  async handleUserGoalsAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("user_goals") вызван');
    this.logger.log('🎯 Показ целей пользователя');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleUserGoals(ctx);
      this.logger.debug('✅ Цели показаны');
    } catch (error) {
      this.logger.error('❌ Ошибка при показе целей:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('match_history')
  async handleMatchHistoryAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("match_history") вызван');
    this.logger.log('📜 Показ истории матчей');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleMatchHistory(ctx);
      this.logger.debug('✅ История матчей показана');
    } catch (error) {
      this.logger.error('❌ Ошибка при показе истории:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Action декораторы для callback кнопок игры
  @Action('find_game')
  async handleFindGameAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("find_game") вызван');
    this.logger.log('🔍 Поиск игры');
    
    try {
      await ctx.answerCbQuery();
      await this.requestsHandler.handleFindGame(ctx);
      this.logger.debug('✅ Поиск игры завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при поиске игры:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('create_request')
  async handleCreateRequestAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("create_request") вызван');
    this.logger.log('➕ Создание заявки');
    
    try {
      await ctx.answerCbQuery();
      await this.requestsHandler.handleCreateRequest(ctx);
      this.logger.debug('✅ Создание заявки завершено');
    } catch (error) {
      this.logger.error('❌ Ошибка при создании заявки:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Дополнительные Action декораторы для полной поддержки всех кнопок
  @Action('back_to_profile')
  async handleBackToProfileAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("back_to_profile") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleBackToProfile(ctx);
      this.logger.debug('✅ Возврат к профилю завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при возврате к профилю:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('back_to_tournaments')
  async handleBackToTournamentsAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("back_to_tournaments") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.tournamentsHandler.handleBackToTournaments(ctx);
      this.logger.debug('✅ Возврат к турнирам завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при возврате к турнирам:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Обработчики для выбора уровня игры
  @Action('req_level_BEGINNER')
  async handleLevelBeginner(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("req_level_BEGINNER") вызван');
    
    try {
      await ctx.answerCbQuery();
      // Уровень игры - пока просто показываем сообщение
      await ctx.editMessageText('🟢 Вы выбрали уровень: Начинающий');
      this.logger.debug('✅ Выбор уровня BEGINNER завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('req_level_AMATEUR')
  async handleLevelAmateur(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("req_level_AMATEUR") вызван');
    
    try {
      await ctx.answerCbQuery();
      await ctx.editMessageText('🔵 Вы выбрали уровень: Любитель');
      this.logger.debug('✅ Выбор уровня AMATEUR завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('req_level_CONFIDENT')
  async handleLevelConfident(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("req_level_CONFIDENT") вызван');
    
    try {
      await ctx.answerCbQuery();
      await ctx.editMessageText('🟡 Вы выбрали уровень: Уверенный');
      this.logger.debug('✅ Выбор уровня CONFIDENT завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('req_level_TOURNAMENT')
  async handleLevelTournament(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("req_level_TOURNAMENT") вызван');
    
    try {
      await ctx.answerCbQuery();
      await ctx.editMessageText('🟠 Вы выбрали уровень: Турнирный');
      this.logger.debug('✅ Выбор уровня TOURNAMENT завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('req_level_SEMI_PRO')
  async handleLevelSemiPro(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("req_level_SEMI_PRO") вызван');
    
    try {
      await ctx.answerCbQuery();
      await ctx.editMessageText('🔴 Вы выбрали уровень: Полупрофессионал');
      this.logger.debug('✅ Выбор уровня SEMI_PRO завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('req_level_ANY')
  async handleLevelAny(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("req_level_ANY") вызван');
    
    try {
      await ctx.answerCbQuery();
      await ctx.editMessageText('👥 Вы выбрали уровень: Любой уровень');
      this.logger.debug('✅ Выбор уровня ANY завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Обработчики для выбора руки в профиле
  @Action('hand_LEFT')
  async handleHandLeft(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("hand_LEFT") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleHandSelection('LEFT', ctx);
      this.logger.debug('✅ Выбор руки LEFT завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе руки:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('hand_RIGHT')
  async handleHandRight(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("hand_RIGHT") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleHandSelection('RIGHT', ctx);
      this.logger.debug('✅ Выбор руки RIGHT завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе руки:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Обработчики для сообщений (messaging)
  @Action('cancel_message')
  async handleCancelMessage(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("cancel_message") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.messagingHandler.handleCancelMessage(ctx);
      this.logger.debug('✅ Отмена сообщения завершена');
    } catch (error) {
      this.logger.error('❌ Ошибка при отмене сообщения:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Обработчики для динамических callback_data (с ID)
  @Action(/^join_tournament_(.+)$/)
  async handleJoinTournament(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action(join_tournament_) вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.tournamentsHandler.handleJoinTournament(ctx);
      this.logger.debug('✅ Присоединение к турниру завершено');
    } catch (error) {
      this.logger.error('❌ Ошибка при присоединении к турниру:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action(/^leave_tournament_(.+)$/)
  async handleLeaveTournament(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action(leave_tournament_) вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.tournamentsHandler.handleLeaveTournament(ctx);
      this.logger.debug('✅ Покидание турнира завершено');
    } catch (error) {
      this.logger.error('❌ Ошибка при покидании турнира:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action(/^view_profile_(.+)$/)
  async handleViewProfile(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action(view_profile_) вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.messagingHandler.handleViewProfile(ctx);
      this.logger.debug('✅ Просмотр профиля завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при просмотре профиля:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action(/^reply_message_(.+)$/)
  async handleReplyMessage(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action(reply_message_) вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.messagingHandler.handleReplyMessage(ctx);
      this.logger.debug('✅ Ответ на сообщение завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при ответе на сообщение:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Полные Action декораторы для профиля и анкеты
  @Action('profile')
  async handleProfileAction(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("profile") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleProfile(ctx);
      this.logger.debug('✅ Профиль отображен');
    } catch (error) {
      this.logger.error('❌ Ошибка при отображении профиля:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Выбор спорта
  @Action('sport_TENNIS')
  async handleSportTennis(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("sport_TENNIS") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleSportSelection('TENNIS', ctx);
      this.logger.debug('✅ Выбор спорта TENNIS завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе спорта TENNIS:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('sport_PADEL')
  async handleSportPadel(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("sport_PADEL") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleSportSelection('PADEL', ctx);
      this.logger.debug('✅ Выбор спорта PADEL завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе спорта PADEL:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Переход к шагу 2
  @Action('start_step_two')
  async handleStartStepTwo(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("start_step_two") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleStartStepTwo(ctx);
      this.logger.debug('✅ Переход к шагу 2 завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при переходе к шагу 2:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Участие в турнирах
  @Action('tournaments_YES')
  async handleTournamentsYes(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("tournaments_YES") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleTournamentsSelection(true, ctx);
      this.logger.debug('✅ Выбор турниров YES завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе турниров YES:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('tournaments_NO')
  async handleTournamentsNo(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("tournaments_NO") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleTournamentsSelection(false, ctx);
      this.logger.debug('✅ Выбор турниров NO завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе турниров NO:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Уровень игры
  @Action('level_BEGINNER')
  async handleLevelBeginnerProfile(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("level_BEGINNER") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleLevelSelection('BEGINNER', ctx);
      this.logger.debug('✅ Выбор уровня BEGINNER завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня BEGINNER:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('level_AMATEUR')
  async handleLevelAmateurProfile(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("level_AMATEUR") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleLevelSelection('AMATEUR', ctx);
      this.logger.debug('✅ Выбор уровня AMATEUR завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня AMATEUR:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('level_CONFIDENT')
  async handleLevelConfidentProfile(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("level_CONFIDENT") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleLevelSelection('CONFIDENT', ctx);
      this.logger.debug('✅ Выбор уровня CONFIDENT завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня CONFIDENT:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('level_ADVANCED')
  async handleLevelAdvancedProfile(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("level_ADVANCED") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleLevelSelection('ADVANCED', ctx);
      this.logger.debug('✅ Выбор уровня ADVANCED завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня ADVANCED:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('level_TOURNAMENT')
  async handleLevelTournamentProfile(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("level_TOURNAMENT") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleLevelSelection('TOURNAMENT', ctx);
      this.logger.debug('✅ Выбор уровня TOURNAMENT завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня TOURNAMENT:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('level_SEMI_PRO')
  async handleLevelSemiProProfile(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("level_SEMI_PRO") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleLevelSelection('SEMI_PRO', ctx);
      this.logger.debug('✅ Выбор уровня SEMI_PRO завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня SEMI_PRO:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Дополнительные уровни с NTRP
  @Action('level_BEGINNER_1_2')
  async handleLevelBeginnerNtrp(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("level_BEGINNER_1_2") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleLevelSelection('BEGINNER', ctx);
      this.logger.debug('✅ Выбор уровня BEGINNER_1_2 завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня BEGINNER_1_2:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('level_AMATEUR_2_3')
  async handleLevelAmateurNtrp(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("level_AMATEUR_2_3") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleLevelSelection('AMATEUR', ctx);
      this.logger.debug('✅ Выбор уровня AMATEUR_2_3 завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня AMATEUR_2_3:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('level_CONFIDENT_4')
  async handleLevelConfidentNtrp(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("level_CONFIDENT_4") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleLevelSelection('CONFIDENT', ctx);
      this.logger.debug('✅ Выбор уровня CONFIDENT_4 завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня CONFIDENT_4:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('level_TOURNAMENT_5')
  async handleLevelTournamentNtrp(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("level_TOURNAMENT_5") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleLevelSelection('TOURNAMENT', ctx);
      this.logger.debug('✅ Выбор уровня TOURNAMENT_5 завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе уровня TOURNAMENT_5:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Частота игр
  @Action('frequency_1')
  async handleFrequency1(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("frequency_1") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleFrequencySelection('1_PER_WEEK', ctx);
      this.logger.debug('✅ Выбор частоты 1 раз в неделю завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе частоты 1 раз в неделю:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('frequency_2')
  async handleFrequency2(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("frequency_2") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleFrequencySelection('2_3_PER_WEEK', ctx);
      this.logger.debug('✅ Выбор частоты 2-3 раза в неделю завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе частоты 2-3 раза в неделю:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('frequency_3')
  async handleFrequency3(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("frequency_3") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleFrequencySelection('4_PLUS_PER_WEEK', ctx);
      this.logger.debug('✅ Выбор частоты 4+ раза в неделю завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе частоты 4+ раза в неделю:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Время игры
  @Action('time_MORNING')
  async handleTimeMorning(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("time_MORNING") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handlePlayTimeSelection('MORNING', ctx);
      this.logger.debug('✅ Выбор времени MORNING завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе времени MORNING:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('time_DAY')
  async handleTimeDay(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("time_DAY") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handlePlayTimeSelection('DAY', ctx);
      this.logger.debug('✅ Выбор времени DAY завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе времени DAY:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('time_EVENING')
  async handleTimeEvening(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("time_EVENING") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handlePlayTimeSelection('EVENING', ctx);
      this.logger.debug('✅ Выбор времени EVENING завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе времени EVENING:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('time_NIGHT')
  async handleTimeNight(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("time_NIGHT") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handlePlayTimeSelection('NIGHT', ctx);
      this.logger.debug('✅ Выбор времени NIGHT завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе времени NIGHT:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('continue_to_frequency')
  async handleContinueToFrequency(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("continue_to_frequency") вызван');
    
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleContinueToFrequency(ctx);
      this.logger.debug('✅ Переход к частоте завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при переходе к частоте:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Выбор бэкхенда
  @Action('backhand_ONE')
  async handleBackhandOne(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("backhand_ONE") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleBackhandSelection('ONE_HANDED', ctx);
      this.logger.debug('✅ Выбор одноручного бэкхенда завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе одноручного бэкхенда:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('backhand_TWO')
  async handleBackhandTwo(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("backhand_TWO") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleBackhandSelection('TWO_HANDED', ctx);
      this.logger.debug('✅ Выбор двуручного бэкхенда завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе двуручного бэкхенда:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Выбор покрытия
  @Action('surface_HARD')
  async handleSurfaceHard(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("surface_HARD") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleSurfaceSelection('HARD', ctx);
      this.logger.debug('✅ Выбор покрытия HARD завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе покрытия HARD:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('surface_CLAY')
  async handleSurfaceClay(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("surface_CLAY") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleSurfaceSelection('CLAY', ctx);
      this.logger.debug('✅ Выбор покрытия CLAY завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе покрытия CLAY:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('surface_GRASS')
  async handleSurfaceGrass(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("surface_GRASS") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleSurfaceSelection('GRASS', ctx);
      this.logger.debug('✅ Выбор покрытия GRASS завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе покрытия GRASS:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('surface_CARPET')
  async handleSurfaceCarpet(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("surface_CARPET") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleSurfaceSelection('CARPET', ctx);
      this.logger.debug('✅ Выбор покрытия CARPET завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе покрытия CARPET:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Выбор стиля игры
  @Action('style_UNIVERSAL')
  async handleStyleUniversal(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("style_UNIVERSAL") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleStyleSelection('UNIVERSAL', ctx);
      this.logger.debug('✅ Выбор стиля UNIVERSAL завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе стиля UNIVERSAL:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('style_DEFENSIVE')
  async handleStyleDefensive(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("style_DEFENSIVE") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleStyleSelection('DEFENSIVE', ctx);
      this.logger.debug('✅ Выбор стиля DEFENSIVE завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе стиля DEFENSIVE:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('style_AGGRESSIVE')
  async handleStyleAggressive(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("style_AGGRESSIVE") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleStyleSelection('AGGRESSIVE', ctx);
      this.logger.debug('✅ Выбор стиля AGGRESSIVE завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе стиля AGGRESSIVE:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('style_NET_PLAYER')
  async handleStyleNetPlayer(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("style_NET_PLAYER") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleStyleSelection('NET_PLAYER', ctx);
      this.logger.debug('✅ Выбор стиля NET_PLAYER завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе стиля NET_PLAYER:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('style_BASIC')
  async handleStyleBasic(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("style_BASIC") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleStyleSelection('BASIC', ctx);
      this.logger.debug('✅ Выбор стиля BASIC завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе стиля BASIC:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Выбор любимого удара
  @Action('shot_SERVE')
  async handleShotServe(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("shot_SERVE") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleShotSelection('SERVE', ctx);
      this.logger.debug('✅ Выбор удара SERVE завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе удара SERVE:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('shot_FOREHAND')
  async handleShotForehand(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("shot_FOREHAND") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleShotSelection('FOREHAND', ctx);
      this.logger.debug('✅ Выбор удара FOREHAND завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе удара FOREHAND:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('shot_BACKHAND')
  async handleShotBackhand(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("shot_BACKHAND") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleShotSelection('BACKHAND', ctx);
      this.logger.debug('✅ Выбор удара BACKHAND завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе удара BACKHAND:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('shot_VOLLEY')
  async handleShotVolley(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("shot_VOLLEY") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleShotSelection('VOLLEY', ctx);
      this.logger.debug('✅ Выбор удара VOLLEY завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе удара VOLLEY:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('shot_SMASH')
  async handleShotSmash(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("shot_SMASH") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleShotSelection('SMASH', ctx);
      this.logger.debug('✅ Выбор удара SMASH завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе удара SMASH:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  // Выбор предпочтений по сопернику
  @Action('opponent_ANY')
  async handleOpponentAny(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("opponent_ANY") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleOpponentSelection('ANY', ctx);
      this.logger.debug('✅ Выбор соперника ANY завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе соперника ANY:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('opponent_MEN')
  async handleOpponentMen(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("opponent_MEN") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleOpponentSelection('MEN', ctx);
      this.logger.debug('✅ Выбор соперника MEN завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе соперника MEN:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('opponent_WOMEN')
  async handleOpponentWomen(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("opponent_WOMEN") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleOpponentSelection('WOMEN', ctx);
      this.logger.debug('✅ Выбор соперника WOMEN завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе соперника WOMEN:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('opponent_SAME_LEVEL')
  async handleOpponentSameLevel(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("opponent_SAME_LEVEL") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleOpponentSelection('SAME_LEVEL', ctx);
      this.logger.debug('✅ Выбор соперника SAME_LEVEL завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе соперника SAME_LEVEL:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('opponent_STRONGER')
  async handleOpponentStronger(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("opponent_STRONGER") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleOpponentSelection('STRONGER', ctx);
      this.logger.debug('✅ Выбор соперника STRONGER завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе соперника STRONGER:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

  @Action('opponent_WEAKER')
  async handleOpponentWeaker(ctx: Context) {
    this.logger.debug('🔍 DECORATOR @Action("opponent_WEAKER") вызван');
    try {
      await ctx.answerCbQuery();
      await this.profileHandler.handleOpponentSelection('WEAKER', ctx);
      this.logger.debug('✅ Выбор соперника WEAKER завершен');
    } catch (error) {
      this.logger.error('❌ Ошибка при выборе соперника WEAKER:', error);
      await ctx.answerCbQuery('❌ Произошла ошибка');
    }
  }

}
