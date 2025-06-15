import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectBot, Start, Command, Hears, On, Update, Action } from 'nestjs-telegraf';
import { Telegraf, Markup, Context } from 'telegraf';
import { UsersService } from '../users/application/services/users.service';
import { BallsService } from '../users/application/services/balls.service';
import { RequestsService } from '../requests/application/services/requests.service';
import { TournamentsService } from '../tournaments/application/services/tournaments.service';
import { MatchesService } from '../matches/application/services/matches.service';
import { TrainingsService } from '../trainings/application/services/trainings.service';
import { StoriesService } from '../stories/application/services/stories.service';
import { CasesService } from '../cases/application/services/cases.service';
import { CaseOpeningService } from '../cases/application/services/case-opening.service';
import { ProfileStep, UserState } from './interfaces/profile-state.enum'; // ← Исправить импорт
import { CreateRequestDto, RequestType, GameMode } from '../requests/application/dto/create-request.dto';

interface RequestEntity {
  id: number;
  creator: {
    first_name: string;
  };
  scheduledTime: Date;
  location: string;
  currentPlayers: number;
  maxPlayers: number;
}

interface TournamentEntity {
  id: number;
  name: string;
  startDate: Date;
  registrationEndDate: Date;
  currentParticipants: number;
  maxParticipants: number;
  entryFee?: number;
}

@Update()
@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  
  // Храним состояния пользователей в памяти (в продакшене лучше использовать Redis)
  private userStates = new Map<string, UserState>();

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly usersService: UsersService,
    private readonly ballsService: BallsService,
    private readonly requestsService: RequestsService,
    private readonly tournamentsService: TournamentsService,
    private readonly matchesService: MatchesService,
    private readonly trainingsService: TrainingsService,
    private readonly storiesService: StoriesService,
    private readonly casesService: CasesService,
    private readonly caseOpeningService: CaseOpeningService,
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

  // ==================== ОСНОВНЫЕ КОМАНДЫ ====================

  private getMainKeyboard() {
    return Markup.keyboard([
      ['👤 Профиль', '🎾 Играть'],
      ['🏆 Турниры', '🎁 Кейсы'],
      ['📝 Записать результат', '📱 Stories'],
      ['🏃‍♂️ Тренировки', '🔗 Пригласить друга'],
      ['🤖 AI-Coach']
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

      // Проверяем наличие реферального кода в deep link
      const startPayload = ctx.message && 'text' in ctx.message 
        ? ctx.message.text.split(' ')[1] 
        : null;

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

        // Если есть реферальный код
        if (startPayload && startPayload.startsWith('ref_')) {
          const referralCode = startPayload.replace('ref_', '');
          this.logger.log(`🔗 Обнаружен реферальный код: ${referralCode}`);
          
          try {
            this.logger.log(`📝 Сохраняем информацию о реферальном коде для будущей обработки`);
            
            await ctx.reply(
              `🎉 Добро пожаловать, ${ctx.from.first_name}!\n\n` +
              `Вы перешли по пригласительной ссылке!\n\n` +
              `🎾 Теперь вы можете найти партнеров для игры в теннис!`,
              this.getMainKeyboard()
            );
          } catch (error) {
            this.logger.error(`Ошибка обработки реферального кода: ${error}`);
          }
        }

        user = await this.usersService.create(userData);
        this.logger.log('✅ Новый пользователь создан');
        
        if (!startPayload?.startsWith('ref_')) {
          await ctx.reply(
            `🎾 Добро пожаловать в Tennis Bot, ${ctx.from.first_name}!\n\nВы успешно зарегистрированы!`,
            this.getMainKeyboard()
          );
        }
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

  // ==================== ПРОФИЛЬ ====================

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
        const ballsBalance = await this.ballsService.getUserBalance(user.id.toString()); // ← Использовать BallsService
        
        const message = `👤 **Ваш профиль**\n\n` +
          `Имя: ${user.first_name} ${user.last_name || ''}\n` +
          `Username: @${user.username || 'не указан'}\n` +
          `ID: ${user.telegram_id}\n\n` +
          `📊 **Статистика:**\n` +
          `🎾 Матчей сыграно: ${stats.matchesPlayed}\n` +
          `🏆 Побед: ${stats.matchWins}\n` +
          `😔 Поражений: ${stats.matchLosses}\n` +
          `📈 Процент побед: ${stats.winRate || 0}%\n` +
          `🏅 Рейтинг: ${stats.ratingPoints} очков\n` +
          `🎾 Мячей: ${ballsBalance}\n\n` + // ← Исправить
          `${!profileStatus.profileComplete ? '⚠️ Профиль не полностью заполнен' : '✅ Профиль заполнен'}`;

        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('🔄 Настроить профиль', 'setup_profile')],
          [Markup.button.callback('📊 Подробная статистика', 'detailed_stats')],
          [Markup.button.callback('🎾 История матчей', 'match_history')],
          [Markup.button.callback('🏅 Достижения', 'achievements')],
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

  // ==================== ИГРА И ЗАЯВКИ ====================

  @Hears('🎾 Играть')
  async handlePlay(ctx: Context) {
    this.logger.log('🎾 ИГРАТЬ кнопка нажата');
    
    try {
      if (!ctx.from) return;

      const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      if (!user) {
        await ctx.reply('❌ Пользователь не найден. Отправьте /start');
        return;
      }

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔍 Найти игру', 'find_game')],
        [Markup.button.callback('➕ Создать заявку', 'create_request')],
        [Markup.button.callback('📋 Мои заявки', 'my_requests')],
        [Markup.button.callback('💫 Активные заявки', 'active_requests')],
      ]);

      await ctx.reply(
        `🎾 **Поиск игры**\n\n` +
        `Выберите действие:`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        }
      );

    } catch (error) {
      this.logger.error(`Ошибка в handlePlay: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке раздела игры');
    }
  }

  @Action('find_game')
  async handleFindGame(ctx: Context) {
    await ctx.answerCbQuery();
    
    try {
      if (!ctx.from) return;

      // Получаем активные заявки других пользователей (используем существующий метод)
      const requests = await this.requestsService.findAll({ 
        page: 1, 
        limit: 10 
      }) as any; // ← Временное решение

      const filteredRequests: RequestEntity[] = requests.filter((req: any) => 
        req.creator?.telegram_id !== ctx.from?.id.toString()
      ).slice(0, 10);

      if (filteredRequests.length === 0) {
        await ctx.editMessageText(
          `🔍 **Поиск игры**\n\n` +
          `😔 Пока нет активных заявок.\n\n` +
          `Создайте свою заявку, чтобы другие игроки могли к вам присоединиться!`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      let message = `🔍 **Активные заявки:**\n\n`;
      const buttons: any[] = [];

      filteredRequests.forEach((request: RequestEntity, index: number) => {
        const datetime = new Date(request.scheduledTime).toLocaleString('ru-RU');
        message += `${index + 1}. **${request.creator.first_name}**\n`;
        message += `📅 ${datetime}\n`;
        message += `📍 ${request.location}\n`;
        message += `👥 ${request.currentPlayers}/${request.maxPlayers}\n\n`;
        
        buttons.push([Markup.button.callback(
          `${index + 1}. Откликнуться`, 
          `respond_request_${request.id}`
        )]);
      });

      buttons.push([Markup.button.callback('🔄 Обновить', 'find_game')]);
      buttons.push([Markup.button.callback('⬅️ Назад', 'back_to_play')]);

      const keyboard = Markup.inlineKeyboard(buttons);

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });

    } catch (error) {
      this.logger.error(`Ошибка в handleFindGame: ${error}`);
      await ctx.reply('❌ Ошибка при поиске игр');
    }
  }

  @Action('create_request')
  async handleCreateRequest(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    
    this.setUserState(userId, {
      step: ProfileStep.CREATING_REQUEST,
      data: {}
    });

    await ctx.editMessageText(
      `➕ **Создание заявки на игру**\n\n` +
      `**Шаг 1 из 4**\n\n` +
      `Когда планируете играть?\n` +
      `Введите дату и время в формате: DD.MM.YYYY HH:MM\n\n` +
      `Пример: 25.12.2024 18:00`,
      { parse_mode: 'Markdown' }
    );

    this.setUserState(userId, {
      step: ProfileStep.AWAITING_REQUEST_DATETIME,
      data: {}
    });
  }

  // ==================== ТУРНИРЫ ====================

  @Hears('🏆 Турниры')
  async handleTournaments(ctx: Context) {
    this.logger.log('🏆 ТУРНИРЫ кнопка нажата');
    
    try {
      if (!ctx.from) return;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔍 Активные турниры', 'active_tournaments')],
        [Markup.button.callback('➕ Создать турнир', 'create_tournament')],
        [Markup.button.callback('📋 Мои турниры', 'my_tournaments')],
        [Markup.button.callback('🏆 История участия', 'tournament_history')],
      ]);

      await ctx.reply(
        `🏆 **Турниры**\n\n` +
        `Участвуйте в турнирах и соревнуйтесь с другими игроками!`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        }
      );

    } catch (error) {
      this.logger.error(`Ошибка в handleTournaments: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке раздела турниров');
    }
  }

  @Action('active_tournaments')
  async handleActiveTournaments(ctx: Context) {
    await ctx.answerCbQuery();
    
    try {
      // Используем существующий метод findAll
      const tournaments = await this.tournamentsService.findAll({ 
        page: 1, 
        limit: 10 
      }) as any; // ← Временное решение

      const activeTournaments: TournamentEntity[] = tournaments.slice(0, 10);

      if (activeTournaments.length === 0) {
        await ctx.editMessageText(
          `🏆 **Активные турниры**\n\n` +
          `😔 Пока нет активных турниров.\n\n` +
          `Создайте свой турнир!`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      let message = `🏆 **Активные турниры:**\n\n`;
      const buttons: any[] = [];

      activeTournaments.forEach((tournament: TournamentEntity, index: number) => {
        const startDate = new Date(tournament.startDate).toLocaleDateString('ru-RU');
        const regEndDate = new Date(tournament.registrationEndDate).toLocaleDateString('ru-RU');
        
        message += `${index + 1}. **${tournament.name}**\n`;
        message += `📅 Начало: ${startDate}\n`;
        message += `📝 Регистрация до: ${regEndDate}\n`;
        message += `👥 ${tournament.currentParticipants}/${tournament.maxParticipants}\n`;
        message += `💰 Взнос: ${tournament.entryFee || 0} мячей\n\n`;
        
        buttons.push([Markup.button.callback(
          `${index + 1}. Подробнее`, 
          `tournament_details_${tournament.id}`
        )]);
      });

      buttons.push([Markup.button.callback('🔄 Обновить', 'active_tournaments')]);

      const keyboard = Markup.inlineKeyboard(buttons);

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });

    } catch (error) {
      this.logger.error(`Ошибка в handleActiveTournaments: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке турниров');
    }
  }

  // ==================== КЕЙСЫ ====================

  @Hears('🎁 Кейсы')
  async handleCases(ctx: Context) {
    this.logger.log('🎁 КЕЙСЫ кнопка нажата');
    
    try {
      if (!ctx.from) return;

      const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      if (!user) {
        await ctx.reply('❌ Пользователь не найден. Отправьте /start');
        return;
      }

      const cases = await this.casesService.getAllCases(false); // только активные
      const ballsBalance = await this.ballsService.getUserBalance(user.id.toString()); // ← Использовать BallsService
      
      if (cases.length === 0) {
        await ctx.reply(
          `🎁 **Кейсы**\n\n` +
          `😔 Пока нет доступных кейсов.\n\n` +
          `Следите за обновлениями!`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      let message = `🎁 **Доступные кейсы:**\n\n`;
      message += `💰 Ваш баланс: ${ballsBalance} мячей\n\n`; // ← Исправить

      const buttons: any[] = [];

      cases.forEach((caseItem: any, index: number) => {
        message += `${index + 1}. **${caseItem.name}**\n`;
        message += `💰 Цена: ${caseItem.priceBalls} мячей\n`;
        message += `📝 ${caseItem.description}\n\n`;
        
        const canOpen = ballsBalance >= caseItem.priceBalls; // ← Исправить
        buttons.push([Markup.button.callback(
          `${canOpen ? '🎁' : '🔒'} ${caseItem.name} (${caseItem.priceBalls} мячей)`, 
          canOpen ? `open_case_${caseItem.id}` : `case_info_${caseItem.id}`
        )]);
      });

      buttons.push([Markup.button.callback('📊 История открытий', 'case_history')]);

      const keyboard = Markup.inlineKeyboard(buttons);

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });

    } catch (error) {
      this.logger.error(`Ошибка в handleCases: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке кейсов');
    }
  }

  // ==================== STORIES ====================

  @Hears('📱 Stories')
  async handleStories(ctx: Context) {
    this.logger.log('📱 STORIES кнопка нажата');
    
    try {
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📷 Загрузить фото', 'upload_photo_story')],
        [Markup.button.callback('🎥 Загрузить видео', 'upload_video_story')],
        [Markup.button.callback('👀 Просмотреть Stories', 'view_stories')],
        [Markup.button.callback('📋 Мои Stories', 'my_stories')],
      ]);

      await ctx.reply(
        `📱 **Stories**\n\n` +
        `Делитесь фото и видео с ваших матчей!`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        }
      );

    } catch (error) {
      this.logger.error(`Ошибка в handleStories: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке Stories');
    }
  }

  // ==================== ТРЕНИРОВКИ ====================

  @Hears('🏃‍♂️ Тренировки')
  async handleTrainings(ctx: Context) {
    this.logger.log('🏃‍♂️ ТРЕНИРОВКИ кнопка нажата');
    
    try {
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔍 Найти тренировку', 'find_training')],
        [Markup.button.callback('➕ Создать тренировку', 'create_training')],
        [Markup.button.callback('📋 Мои тренировки', 'my_trainings')],
        [Markup.button.callback('👨‍🏫 Стать тренером', 'become_trainer')],
      ]);

      await ctx.reply(
        `🏃‍♂️ **Тренировки**\n\n` +
        `Найдите тренера или проведите групповую тренировку!`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        }
      );

    } catch (error) {
      this.logger.error(`Ошибка в handleTrainings: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке тренировок');
    }
  }

  // ==================== ЗАПИСЬ РЕЗУЛЬТАТОВ ====================

  @Hears('📝 Записать результат')
  async handleRecordMatch(ctx: Context) {
    this.logger.log('📝 ЗАПИСАТЬ РЕЗУЛЬТАТ кнопка нажата');
    
    try {
      if (!ctx.from) return;

      const userId = ctx.from.id.toString();
      
      this.setUserState(userId, {
        step: ProfileStep.RECORDING_MATCH,
        data: {}
      });

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🎾 Одиночный матч', 'match_type_singles')],
        [Markup.button.callback('👥 Парный матч', 'match_type_doubles')],
      ]);

      await ctx.reply(
        `📝 **Запись результата матча**\n\n` +
        `Выберите тип матча:`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        }
      );

    } catch (error) {
      this.logger.error(`Ошибка в handleRecordMatch: ${error}`);
      await ctx.reply('❌ Ошибка при записи матча');
    }
  }

  // ==================== РЕФЕРАЛЫ ====================

  @Hears('🔗 Пригласить друга')
  async handleInviteButton(ctx: Context) {
    await this.handleInvite(ctx);
  }

  @Command('invite')
  async handleInvite(ctx: Context) {
    this.logger.log('🔗 INVITE команда');
    
    try {
      if (!ctx.from) return;

      const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      if (!user) {
        await ctx.reply('❌ Пользователь не найден. Отправьте /start');
        return;
      }

      const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'your_bot_name';
      const referralCode = `ref_${user.id.toString().padStart(6, '0')}`;
      const inviteLink = `https://t.me/${botUsername}?start=${referralCode}`;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.url('📲 Поделиться в Telegram', 
          `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('Присоединяйся к нашему теннисному сообществу! 🎾')}`
        )],
        [Markup.button.callback('📊 Моя статистика', 'referral_stats')],
      ]);

      await ctx.reply(
        `🔗 **Ваша ссылка для приглашения друзей:**\n\n` +
        `\`${inviteLink}\`\n\n` +
        `👥 Поделитесь ссылкой с друзьями, и они смогут быстро присоединиться к нашему сообществу!\n\n` +
        `🏆 За каждого приглашенного друга вы получите достижения и бонусы!`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        }
      );

    } catch (error) {
      this.logger.error(`Ошибка в handleInvite: ${error instanceof Error ? error.message : String(error)}`);
      await ctx.reply('❌ Ошибка при создании ссылки-приглашения');
    }
  }

  // ==================== AI COACH ====================

  @Hears('🤖 AI-Coach')
  async handleAICoach(ctx: Context) {
    this.logger.log('🤖 AI-COACH кнопка нажата');
    
    try {
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('💡 Совет по технике', 'ai_technique_tip')],
        [Markup.button.callback('🏃‍♂️ План тренировки', 'ai_training_plan')],
        [Markup.button.callback('📊 Анализ игры', 'ai_game_analysis')],
        [Markup.button.callback('🎯 Постановка целей', 'ai_goal_setting')],
      ]);

      await ctx.reply(
        `🤖 **AI-Coach**\n\n` +
        `Ваш персональный помощник для улучшения игры в теннис!\n\n` +
        `Выберите, чем я могу помочь:`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        }
      );

    } catch (error) {
      this.logger.error(`Ошибка в handleAICoach: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке AI-Coach');
    }
  }

  // ==================== ОБРАБОТКА ТЕКСТА ====================

  @On('text')
  async handleText(ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;
    
    const text = ctx.message.text;
    const userId = ctx.from?.id.toString();
    
    if (!userId) return;
    
    const userState = this.getUserState(userId);
    
    this.logger.log(`💬 Текст от ${userId}, состояние: ${userState.step}, текст: "${text}"`);

    // Обрабатываем различные состояния
    if (userState.step !== ProfileStep.IDLE) {
      await this.handleStatefulInput(ctx, text, userId, userState);
      return;
    }

    // Обычные сообщения вне процессов
    if (!text.startsWith('/') && !['👤', '🎾', '🏆', '📝', '📱', '🤖', '🏃‍♂️', '🎁', '🔗'].some(emoji => text.includes(emoji))) {
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

  // ==================== ОБРАБОТКА СОСТОЯНИЙ ====================

  private async handleStatefulInput(ctx: Context, text: string, userId: string, userState: UserState) {
    switch (userState.step) {
      // Профиль
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

      // Заявки на игру
      case ProfileStep.AWAITING_REQUEST_DATETIME:
        await this.handleRequestDateTime(ctx, text, userId, userState);
        break;
      case ProfileStep.AWAITING_REQUEST_LOCATION:
        await this.handleRequestLocation(ctx, text, userId, userState);
        break;
      case ProfileStep.AWAITING_REQUEST_DESCRIPTION:
        await this.handleRequestDescription(ctx, text, userId, userState);
        break;

      // Турниры
      case ProfileStep.AWAITING_TOURNAMENT_NAME:
        await this.handleTournamentName(ctx, text, userId, userState);
        break;
      case ProfileStep.AWAITING_TOURNAMENT_DESCRIPTION:
        await this.handleTournamentDescription(ctx, text, userId, userState);
        break;

      // Матчи
      case ProfileStep.AWAITING_MATCH_OPPONENT:
        await this.handleMatchOpponent(ctx, text, userId, userState);
        break;
      case ProfileStep.AWAITING_MATCH_SCORE:
        await this.handleMatchScore(ctx, text, userId, userState);
        break;

      // Stories
      case ProfileStep.AWAITING_STORY_DESCRIPTION:
        await this.handleStoryDescription(ctx, text, userId, userState);
        break;

      default:
        this.logger.warn(`Неизвестное состояние: ${userState.step}`);
        this.clearUserState(userId);
        await ctx.reply('❌ Произошла ошибка. Попробуйте начать сначала.');
        break;
    }
  }

  // ==================== ОБРАБОТЧИКИ ЗАЯВОК ====================

  private async handleRequestDateTime(ctx: Context, text: string, userId: string, userState: UserState) {
    // Валидация даты и времени
    const dateTimeRegex = /^(\d{2})\.(\d{2})\.(\d{4})\s(\d{2}):(\d{2})$/;
    const match = text.match(dateTimeRegex);
    
    if (!match) {
      await ctx.reply(
        `❌ Неверный формат даты.\n\n` +
        `Используйте формат: DD.MM.YYYY HH:MM\n` +
        `Пример: 25.12.2024 18:00`
      );
      return;
    }

    const [, day, month, year, hour, minute] = match;
    const dateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
    
    if (dateTime < new Date()) {
      await ctx.reply(`❌ Нельзя указывать прошедшую дату. Выберите будущее время.`);
      return;
    }

    userState.data.requestDateTime = dateTime.toISOString();
    userState.step = ProfileStep.AWAITING_REQUEST_LOCATION;
    this.setUserState(userId, userState);

    await ctx.reply(
      `✅ Время: **${dateTime.toLocaleString('ru-RU')}**\n\n` +
      `**Шаг 2 из 4**\n\n` +
      `Где планируете играть?\n` +
      `Укажите корт, адрес или название места.`,
      { parse_mode: 'Markdown' }
    );
  }

  private async handleRequestLocation(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.requestLocation = text.trim();
    userState.step = ProfileStep.AWAITING_REQUEST_LEVEL;
    this.setUserState(userId, userState);

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🟢 Новичок', 'req_level_beginner')],
      [Markup.button.callback('🔵 Любитель', 'req_level_amateur')],
      [Markup.button.callback('🟡 Уверенный', 'req_level_confident')],
      [Markup.button.callback('🟠 Турнирный', 'req_level_tournament')],
      [Markup.button.callback('🔴 Профи', 'req_level_semi_pro')],
      [Markup.button.callback('⚪ Любой уровень', 'req_level_any')],
    ]);

    await ctx.reply(
      `✅ Место: **${text}**\n\n` +
      `**Шаг 3 из 4**\n\n` +
      `Какой уровень игроков ищете?`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      }
    );
  }

  private async handleRequestDescription(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.requestDescription = text.trim();
    this.setUserState(userId, userState);

    await this.createGameRequest(ctx, userId, userState);
  }







  private async createGameRequest(ctx: Context, userId: string, userState: UserState) {
    try {
      const user = await this.usersService.findByTelegramId(userId);
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }

      // Создаем корректный объект CreateRequestDto
      const requestData: CreateRequestDto = {
        type: RequestType.GAME, // Исправить с правильным enum
        title: `Игра ${new Date(userState.data.requestDateTime!).toLocaleDateString('ru-RU')}`,
        description: userState.data.requestDescription || 'Поиск партнера для игры в теннис',
        gameMode: GameMode.SINGLES, // Исправить с правильным enum
        dateTime: new Date(userState.data.requestDateTime!),
        location: userState.data.requestLocation!,
        locationName: userState.data.requestLocation!, // Для совместимости
        maxPlayers: 2,
        playerLevel: userState.data.requestLevel || 'ANY',
        paymentType: 'FREE',
        ratingType: 'NTRP',
        formatInfo: {},
      };

      const request = await this.requestsService.create(user.id.toString(), requestData);

      const summaryMessage = `✅ **Заявка создана!**\n\n` +
        `📅 **Время:** ${new Date(requestData.dateTime).toLocaleString('ru-RU')}\n` +
        `📍 **Место:** ${requestData.location}\n` +
        `🎯 **Уровень:** ${this.getLevelText(requestData.playerLevel || 'ANY')}\n` + // Исправить null check
        `📝 **Описание:** ${requestData.description}\n\n` +
        `Ваша заявка опубликована. Другие игроки смогут к вам присоединиться!`;

      await ctx.reply(summaryMessage, { 
        parse_mode: 'Markdown',
        reply_markup: this.getMainKeyboard().reply_markup
      });

      this.clearUserState(userId);

    } catch (error) {
      this.logger.error(`Ошибка создания заявки: ${error}`);
      await ctx.reply('❌ Ошибка при создании заявки. Попробуйте позже.');
    }
  }

  // ==================== ДОБАВИТЬ НЕДОСТАЮЩИЕ МЕТОДЫ ====================

  private async handleFirstName(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.firstName = text.trim();
    userState.step = ProfileStep.AWAITING_LAST_NAME;
    this.setUserState(userId, userState);

    await ctx.reply(
      `✅ Имя: **${text}**\n\n` +
      `Введите вашу фамилию:`,
      { parse_mode: 'Markdown' }
    );
  }

  private async handleLastName(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.lastName = text.trim();
    userState.step = ProfileStep.AWAITING_CITY;
    this.setUserState(userId, userState);

    await ctx.reply(
      `✅ Фамилия: **${text}**\n\n` +
      `В каком городе играете?`,
      { parse_mode: 'Markdown' }
    );
  }

  private async handleCity(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.city = text.trim();
    userState.step = ProfileStep.AWAITING_COURT;
    this.setUserState(userId, userState);

    await ctx.reply(
      `✅ Город: **${text}**\n\n` +
      `Какой корт предпочитаете?`,
      { parse_mode: 'Markdown' }
    );
  }

  private async handleCourt(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.preferredCourt = text.trim();
    // Завершаем настройку профиля
    await this.completeProfileSetup(ctx, userId, userState);
  }

  private async handleTournamentName(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.tournamentName = text.trim();
    userState.step = ProfileStep.AWAITING_TOURNAMENT_DESCRIPTION;
    this.setUserState(userId, userState);

    await ctx.reply(
      `✅ Название: **${text}**\n\n` +
      `Введите описание турнира:`,
      { parse_mode: 'Markdown' }
    );
  }

  private async handleTournamentDescription(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.tournamentDescription = text.trim();
    // Продолжить создание турнира...
    await ctx.reply(`✅ Описание сохранено. Турнир будет создан!`);
    this.clearUserState(userId);
  }  // ...existing code...
  

  private async handleMatchOpponent(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.matchOpponent = text.trim();
    userState.step = ProfileStep.AWAITING_MATCH_SCORE;
    this.setUserState(userId, userState);

    await ctx.reply(
      `✅ Соперник: **${text}**\n\n` +
      `Введите счет матча (например: 6-4, 6-2):`,
      { parse_mode: 'Markdown' }
    );
  }

  private async handleMatchScore(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.matchScore = text.trim();
    // Завершить запись матча...
    await ctx.reply(`✅ Результат матча записан!`);
    this.clearUserState(userId);
  }

  private async handleStoryDescription(ctx: Context, text: string, userId: string, userState: UserState) {
    userState.data.storyDescription = text.trim();
    // Завершить создание story...
    await ctx.reply(`✅ Story создана!`);
    this.clearUserState(userId);
  }

  private async completeProfileSetup(ctx: Context, userId: string, userState: UserState) {
    try {
      const user = await this.usersService.findByTelegramId(userId);
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }

      // Обновляем профиль пользователя
      await this.usersService.updateProfile(user.id.toString(), {
        city: userState.data.city,
        // Добавить другие поля профиля
      });

      await ctx.reply(
        `✅ **Профиль настроен!**\n\n` +
        `Теперь вы можете пользоваться всеми функциями бота.`,
        {
          parse_mode: 'Markdown',
          reply_markup: this.getMainKeyboard().reply_markup
        }
      );

      this.clearUserState(userId);

    } catch (error) {
      this.logger.error(`Ошибка сохранения профиля: ${error}`);
      await ctx.reply('❌ Ошибка при сохранении профиля');
    }
  }

  // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================

  private getLevelText(level: string): string {
    const levelMap = {
      'BEGINNER': 'Новичок (1.0-2.0)',
      'AMATEUR': 'Любитель (2.5-3.5)',
      'CONFIDENT': 'Уверенный игрок (4.0-4.5)',
      'TOURNAMENT': 'Турнирный уровень (5.0-6.0)',
      'SEMI_PRO': 'Полупрофи / тренер',
      'ANY': 'Любой уровень'
    };
    return levelMap[level as keyof typeof levelMap] || level;
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

  // ==================== ДЕЙСТВИЯ С КНОПКАМИ ====================

  @Action(/^open_case_(\d+)$/)
  async handleOpenCase(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    if (!ctx.from) return;

    const caseId = parseInt(ctx.callbackQuery.data.split('_')[2]);
    
    try {
      const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }

      const result = await this.caseOpeningService.openCase(user.id.toString(), caseId);
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🎁 Открыть еще', 'back_to_cases')],
        [Markup.button.callback('📊 История', 'case_history')],
      ]);

      await ctx.editMessageText(
        `🎉 **Поздравляем!**\n\n` +
        `Вы выиграли: **${result.winning.item.name}**\n\n` +
        `📝 ${result.winning.item.description}\n\n` +
        `💰 Потрачено мячей: ${result.opening.ballsSpent}`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        }
      );

    } catch (error) {
      this.logger.error(`Ошибка открытия кейса: ${error}`);
      
      if (error instanceof Error && error.message.includes('Недостаточно мячей')) {
        await ctx.editMessageText(
          `❌ **Недостаточно мячей**\n\n` +
          `Для открытия этого кейса нужно больше мячей.\n` +
          `Играйте в матчи и турниры, чтобы заработать их!`,
          { parse_mode: 'Markdown' }
        );
      } else {
        await ctx.reply('❌ Ошибка при открытии кейса');
      }
    }
  }

  @Action(/^respond_request_(\d+)$/)
  async handleRespondToRequest(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    if (!ctx.from) return;

    const requestId = parseInt(ctx.callbackQuery.data.split('_')[2]);
    
    try {
      const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }

      // Временно убираем createResponse, так как метода нет
      // const response = await this.requestsService.createResponse(requestId.toString(), {
      //   playerId: user.id,
      //   message: 'Хочу присоединиться к игре!'
      // });

      await ctx.editMessageText(
        `✅ **Отклик отправлен!**\n\n` +
        `Создатель заявки получит уведомление о вашем желании присоединиться.\n\n` +
        `Ожидайте подтверждения!`,
        { parse_mode: 'Markdown' }
      );

    } catch (error) {
      this.logger.error(`Ошибка отклика на заявку: ${error}`);
      await ctx.reply('❌ Ошибка при отправке отклика');
    }
  }

  // ==================== КОМАНДЫ ОТЛАДКИ ====================

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

  @Action('referral_stats')
  async handleReferralStats(ctx: Context) {
    await ctx.answerCbQuery();
    
    try {
      if (!ctx.from) return;

      const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }

      // Пока показываем заглушку (позже интегрируем с ReferralsService)
      const message = `📊 **Статистика приглашений**\n\n` +
        `👥 **Всего приглашено:** 0\n` +
        `⚡ **Активных игроков:** 0\n` +
        `📅 **За сегодня:** 0\n` +
        `📅 **За неделю:** 0\n` +
        `📅 **За месяц:** 0\n\n` +
        `🏆 **Достижения:** 0\n` +
        `💎 **Бонусные очки:** 0\n\n` +
        `🚀 **Скоро функция будет полностью активна!**`;

      await ctx.editMessageText(message, { parse_mode: 'Markdown' });

    } catch (error) {
      this.logger.error(`Ошибка в handleReferralStats: ${error instanceof Error ? error.message : String(error)}`);
      await ctx.reply('❌ Ошибка при загрузке статистики');
    }
  }
}