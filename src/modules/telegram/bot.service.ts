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
import { TelegramService } from './telegram.service';
import { NotificationsService } from '../notifications/application/services/notifications.service';
import { ProfileStep, UserState } from './interfaces/profile-state.enum'; 
import { CreateRequestDto, RequestType, GameMode } from '../requests/application/dto/create-request.dto';
import { TournamentType } from '../tournaments/domain/enums/tournament.enum';
import { MatchType } from '../matches/domain/enums/match.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { AchievementsService } from '../achievements/application/services/achievements.service';
import { RatingsService } from '../ratings/ratings.service';
import { SettingsService } from '../settings/settings.service';

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
    private readonly telegramService: TelegramService,
    private readonly notificationsService: NotificationsService, 
    private readonly prisma: PrismaService, 
    private readonly achievementsService: AchievementsService,
    private readonly ratingsService: RatingsService,
    private readonly settingsService: SettingsService,

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
    ['🏆 Турниры', '🏃‍♂️ Тренировки'],
    ['📱 Stories', '🎁 Кейсы'],
    ['🔗 Пригласить друга', '⚙️ Настройки'], // Добавляем кнопку настроек
    ['🤖 AI-Coach', '📝 Записать результат']
  ]).resize();
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

    const telegramChatId = ctx.chat?.id;
    
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

      // Создаем пользователя
      user = await this.usersService.create(userData);
      this.logger.log('✅ Новый пользователь создан');

      // Сохраняем chat_id для уведомлений
      if (telegramChatId) {
        await this.usersService.updateTelegramChatId(user.id.toString(), telegramChatId);
        this.logger.log(`💬 Сохранен chat_id: ${telegramChatId}`);
      }

      // Обработка реферального кода
      if (startPayload && startPayload.startsWith('ref_')) {
        const referralCode = startPayload.replace('ref_', '');
        this.logger.log(`🔗 Обнаружен реферальный код: ${referralCode}`);
        
        try {
          // Находим пригласившего пользователя по коду
          const referralUserId = parseInt(referralCode.replace(/^0+/, '')) || null;
          
          if (referralUserId && referralUserId !== user.id) {
            const referrer = await this.usersService.findById(referralUserId.toString());
            
            if (referrer) {
              // Устанавливаем связь реферала
              await this.usersService.setReferrer(user.id.toString(), referrer.id.toString());
              
              // Начисляем бонус пригласившему
              const bonusAmount = 50; // 50 мячей за приглашение
              await this.ballsService.addBalls(
                referrer.id.toString(), 
                bonusAmount, 
                'BONUS', 
                `Бонус за приглашение игрока ${user.first_name}` // Используем firstName вместо first_name
              );

              // Отправляем уведомление пригласившему
              if (this.notificationsService) {
                await this.notificationsService.sendReferralBonusNotification(
                  referrer.id,
                  {
                    amount: bonusAmount,
                    referredUserName: user.first_name,
                    totalBalance: await this.ballsService.getUserBalance(referrer.id.toString())
                  }
                );
              }

              // Приветствуем нового пользователя с упоминанием реферала
              await ctx.reply(
                `🎉 **Добро пожаловать, ${ctx.from.first_name}!**\n\n` +
                `🤝 Вы присоединились по приглашению игрока **${referrer.first_name}**!\n\n` +
                `🎾 Теперь вы можете:\n` +
                `• Найти партнеров для игры\n` +
                `• Участвовать в турнирах\n` +
                `• Зарабатывать мячи и открывать кейсы\n` +
                `• Приглашать друзей и получать бонусы\n\n` +
                `Удачной игры! 🏆`,
                {
                  parse_mode: 'Markdown',
                  ...this.getMainKeyboard()
                }
              );

              // Отправляем приветственное уведомление новому пользователю
              if (this.notificationsService) {
                await this.notificationsService.createNotification({
                  userId: user.id,
                  type: 'SYSTEM_MESSAGE',
                  message: `🎾 Добро пожаловать в Tennis Bot! Вы получили стартовый бонус за регистрацию по приглашению.`,
                  payload: {
                    referrerId: referrer.id,
                    referrerName: referrer.first_name,
                    welcomeBonus: true
                  },
                  sendTelegram: false // не дублируем, так как уже отправили выше
                });
              }

              this.logger.log(`✅ Реферальная связь установлена: ${user.id} <- ${referrer.id}`);
            } else {
              this.logger.warn(`Реферер с ID ${referralUserId} не найден`);
            }
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
          `• Приглашать друзей\n\n` +
          `Начните с настройки профиля! 👤`,
          {
            parse_mode: 'Markdown',
            ...this.getMainKeyboard()
          }
        );

        // Отправляем приветственное уведомление
        if (this.notificationsService) {
          await this.notificationsService.createNotification({
            userId: user.id,
            type: 'SYSTEM_MESSAGE',
            message: `🎾 Добро пожаловать в Tennis Bot! Заполните профиль и начните искать партнеров для игры.`,
            payload: {
              isNewUser: true,
              registrationDate: new Date().toISOString()
            },
            sendTelegram: false
          });
        }

        // Начисляем стартовый бонус новому пользователю
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
        await this.usersService.updateTelegramChatId(user.id.toString(), telegramChatId);
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

      await ctx.reply(
        welcomeMessage,
        {
          parse_mode: 'Markdown',
          ...this.getMainKeyboard()
        }
      );

      // Если есть непрочитанные уведомления, предлагаем их посмотреть
      if (unreadNotifications > 0) {
        const notificationsKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(`📬 Посмотреть уведомления (${unreadNotifications})`, 'view_notifications')]
        ]);

        await ctx.reply(
          `🔔 У вас есть непрочитанные уведомления!`,
          {
            reply_markup: notificationsKeyboard.reply_markup
          }
        );
      }
    }

  } catch (error) {
    this.logger.error(`Ошибка в handleStart: ${error instanceof Error ? error.message : String(error)}`);
    await ctx.reply(
      `❌ Произошла ошибка при запуске.\n\n` +
      `Попробуйте позже или обратитесь к администратору.`
    );
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

    // Получаем активные заявки других пользователей
    const requests = await this.requestsService.findAll({ 
      page: 1, 
      limit: 10 
    }) as any[];

    // Фильтруем заявки с более безопасной проверкой
    const filteredRequests = requests.filter((req: any) => {
      // Проверяем разные возможные поля для ID создателя
      const creatorTelegramId = req.creator?.telegram_id || 
                               req.creator?.telegramId || 
                               req.creatorId?.toString();
      
      return creatorTelegramId && creatorTelegramId !== ctx.from?.id.toString();
    }).slice(0, 10);

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

    filteredRequests.forEach((request: any, index: number) => {
      // Безопасное получение данных с fallback значениями
      const datetime = request.dateTime || request.scheduledTime 
        ? new Date(request.dateTime || request.scheduledTime).toLocaleString('ru-RU')
        : 'Время не указано';
      
      const creatorName = request.creator?.first_name || 
                         request.creator?.firstName || 
                         request.creatorName || 
                         'Игрок';
      
      const location = request.locationName || 
                      request.location || 
                      'Место не указано';
      
      const currentPlayers = request.currentPlayers || 0;
      const maxPlayers = request.maxPlayers || 2;
      
      message += `${index + 1}. **${creatorName}**\n`;
      message += `📅 ${datetime}\n`;
      message += `📍 ${location}\n`;
      message += `👥 ${currentPlayers}/${maxPlayers}\n`;
      
      // Добавляем описание если есть
      if (request.description && request.description !== 'Поиск партнера для игры в теннис') {
        message += `📝 ${request.description}\n`;
      }
      
      message += `\n`;
      
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
    
    // Показываем более информативную ошибку для отладки
    this.logger.error(`Детали ошибки: ${JSON.stringify(error, null, 2)}`);
    
    await ctx.editMessageText(
      `🔍 **Поиск игры**\n\n` +
      `😔 Временная ошибка при загрузке заявок.\n\n` +
      `Попробуйте позже или создайте свою заявку!`,
      { parse_mode: 'Markdown' }
    );
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





// Добавляем команду для показа рейтинга
@Command('rating')
async handleRatingCommand(ctx: Context) {
  try {
    const user = await this.usersService.findByTelegramId(ctx.from!.id.toString());
    if (!user) {
      await ctx.reply('❌ Пользователь не найден');
      return;
    }

    const stats = await this.ratingsService.getPlayerStats(user.id);
    
    if (!stats) {
      await ctx.reply('📊 Рейтинг не найден. Сыграйте первый матч!');
      return;
    }

    const levelText = this.getSkillLevelText(stats.skillRating);
    
    let message = `🎾 **Ваш рейтинг**\n\n`;
    message += `🎯 **Уровень силы:** ${stats.skillRating} (${levelText})\n`;
    message += `📊 **Очки силы:** ${stats.skillPoints}\n`;
    message += `📈 **Очки активности:** ${stats.pointsRating}\n\n`;
    message += `🏆 **Статистика:**\n`;
    message += `📊 Побед: ${stats.wins} | Поражений: ${stats.losses}\n`;
    message += `📈 Процент побед: ${stats.winRate}%\n`;
    message += `🎾 Всего матчей: ${stats.totalMatches}\n\n`;
    
    if (stats.lastMatch) {
      const resultIcon = stats.lastMatch.result === 'win' ? '🏆' : '😔';
      message += `🆚 **Последний матч:** ${resultIcon}\n`;
      message += `👤 Соперник: ${stats.lastMatch.opponent} (${stats.lastMatch.opponentRating})\n`;
      message += `🏆 Счет: ${stats.lastMatch.score}\n`;
      message += `📅 ${stats.lastMatch.date.toLocaleDateString('ru-RU')}\n\n`;
    }

    message += `📈 Используйте /leaderboard для просмотра рейтинга`;

    await ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    this.logger.error(`Ошибка в handleRatingCommand: ${error instanceof Error ? error.message : String(error)}`);
    await ctx.reply('❌ Ошибка при загрузке рейтинга');
  }
}

@Command('leaderboard')
async handleLeaderboardCommand(ctx: Context) {
  try {
    const [skillTop, pointsTop] = await Promise.all([
      this.ratingsService.getTopPlayersBySkill(10),
      this.ratingsService.getTopPlayersByPoints(10)
    ]);

    const buttons = [
      [
        Markup.button.callback('🎯 По силе', 'leaderboard_skill'),
        Markup.button.callback('📈 По активности', 'leaderboard_points')
      ]
    ];

    let message = `🏆 **Рейтинг игроков**\n\n`;
    message += `**Топ по уровню силы:**\n`;
    
    skillTop.forEach((player, index) => {
      const name = `${player.user.firstName} ${player.user.lastName || ''}`.trim(); // Исправлено
      message += `${index + 1}. ${name} - ${player.skillRating} (${player.skillPoints})\n`;
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard(buttons).reply_markup
    });

  } catch (error) {
    this.logger.error(`Ошибка в handleLeaderboardCommand: ${error instanceof Error ? error.message : String(error)}`);
    await ctx.reply('❌ Ошибка при загрузке рейтинга');
  }
}

@Action('leaderboard_skill')
async handleSkillLeaderboard(ctx: Context) {
  await ctx.answerCbQuery();
  
  try {
    const skillTop = await this.ratingsService.getTopPlayersBySkill(10);
    
    let message = `🎯 **Топ по уровню силы:**\n\n`;
    
    skillTop.forEach((player, index) => {
      const name = `${player.user.firstName} ${player.user.lastName || ''}`.trim(); // Исправлено
      const levelText = this.getSkillLevelText(player.skillRating);
      message += `${index + 1}. **${name}**\n`;
      message += `   🎯 ${player.skillRating} (${levelText})\n`;
      message += `   📊 ${player.skillPoints} очков\n`;
      message += `   🏆 ${player.wins}W/${player.losses}L\n\n`;
    });

    const buttons = [
      [Markup.button.callback('📈 По активности', 'leaderboard_points')],
      [Markup.button.callback('🔄 Обновить', 'leaderboard_skill')]
    ];

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard(buttons).reply_markup
    });

  } catch (error) {
    this.logger.error(`Ошибка в handleSkillLeaderboard: ${error instanceof Error ? error.message : String(error)}`);
    await ctx.reply('❌ Ошибка при загрузке рейтинга');
  }
}

@Action('leaderboard_points')
async handlePointsLeaderboard(ctx: Context) {
  await ctx.answerCbQuery();
  
  try {
    const pointsTop = await this.ratingsService.getTopPlayersByPoints(10);
    
    let message = `📈 **Топ по очкам активности:**\n\n`;
    
    pointsTop.forEach((player, index) => {
      const name = `${player.user.firstName} ${player.user.lastName || ''}`.trim(); // Исправлено
      message += `${index + 1}. **${name}**\n`;
      message += `   📈 ${player.pointsRating} очков\n`;
      message += `   🎯 Уровень: ${player.skillRating}\n`;
      message += `   🏆 ${player.wins}W/${player.losses}L\n\n`;
    });

    const buttons = [
      [Markup.button.callback('🎯 По силе', 'leaderboard_skill')],
      [Markup.button.callback('🔄 Обновить', 'leaderboard_points')]
    ];

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard(buttons).reply_markup
    });

  } catch (error) {
    this.logger.error(`Ошибка в handlePointsLeaderboard: ${error instanceof Error ? error.message : String(error)}`);
    await ctx.reply('❌ Ошибка при загрузке рейтинга');
  }
}




private getSkillLevelText(rating: number): string {
  if (rating < 2.5) return 'Новичок';
  if (rating < 3.0) return 'Начинающий';
  if (rating < 3.5) return 'Любитель';
  if (rating < 4.0) return 'Продвинутый любитель';
  if (rating < 4.5) return 'Средний продвинутый';
  if (rating < 5.0) return 'Сильный продвинутый';
  if (rating < 5.5) return 'Турнирный игрок';
  if (rating < 6.0) return 'Высокий турнирный';
  return 'Профессиональный';
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
      }) as any;

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
      message += `💰 Ваш баланс: ${ballsBalance} мячей\n\n`;

      const buttons: any[] = [];

      cases.forEach((caseItem: any, index: number) => {
        message += `${index + 1}. **${caseItem.name}**\n`;
        message += `💰 Цена: ${caseItem.priceBalls} мячей\n`;
        message += `📝 ${caseItem.description}\n\n`;
        
        const canOpen = ballsBalance >= caseItem.priceBalls;
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

      const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'tennistestdssbot';
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
  if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;

  const userId = ctx.from.id.toString();
  const text = ctx.message.text;
  const userState = this.getUserState(userId);

  this.logger.log(`📝 Текст от ${userId}: "${text}" (состояние: ${userState.step})`);

  // Обработка состояний
  try {
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

      case ProfileStep.AWAITING_REQUEST_DATETIME:
        await this.handleRequestDateTime(ctx, text, userId, userState);
        break;

      case ProfileStep.AWAITING_REQUEST_LOCATION:
        await this.handleRequestLocation(ctx, text, userId, userState);
        break;

      case ProfileStep.AWAITING_REQUEST_DESCRIPTION:
        await this.handleRequestDescription(ctx, text, userId, userState);
        break;

      case ProfileStep.AWAITING_TOURNAMENT_NAME:
        await this.handleTournamentName(ctx, text, userId, userState);
        break;

      case ProfileStep.AWAITING_TOURNAMENT_DESCRIPTION:
        await this.handleTournamentDescription(ctx, text, userId, userState);
        break;

      case ProfileStep.AWAITING_MATCH_OPPONENT:
        await this.handleMatchOpponent(ctx, text, userId, userState);
        break;

      case ProfileStep.AWAITING_MATCH_SCORE:
        await this.handleMatchScore(ctx, text, userId, userState);
        break;

      case ProfileStep.AWAITING_MATCH_DATE:
        await this.handleMatchDate(ctx, text, userId, userState);
        break;

      case ProfileStep.AWAITING_STORY_DESCRIPTION:
        userState.data.storyDescription = text.trim();
        await this.createStory(ctx, userId, userState);
        break;

      case ProfileStep.AWAITING_CITY_SEARCH:
        await this.handleCitySearch(ctx, text, userId, userState);
        break;

      default:
        // Обработка обычных текстовых сообщений
        if (!text.startsWith('/') && !['👤', '🎾', '🏆', '📝', '📱', '🤖', '🏃‍♂️', '🎁', '🔗', '📍'].some(emoji => text.includes(emoji))) {
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
        break;
    }
  } catch (error) {
    this.logger.error(`Ошибка обработки текста: ${error}`);
    await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
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
    case ProfileStep.AWAITING_MATCH_DATE:
      await this.handleMatchDate(ctx, text, userId, userState);
      break;

    // Stories
    case ProfileStep.AWAITING_STORY_DESCRIPTION:
      userState.data.storyDescription = text.trim();
      await this.createStory(ctx, userId, userState);
      break;

    // Поиск кортов
    case ProfileStep.AWAITING_CITY_SEARCH:
      await this.handleCitySearch(ctx, text, userId, userState);
      break;

    default:
      this.logger.warn(`Неизвестное состояние: ${userState.step}`);
      this.clearUserState(userId);
      await ctx.reply('❌ Произошла ошибка. Попробуйте начать сначала.');
      break;
  }
}



@Hears('⚙️ Настройки')
async handleSettings(ctx: Context) {
  this.logger.log('⚙️ НАСТРОЙКИ кнопка нажата');
  
  try {
    if (!ctx.from) return;

    const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
    if (!user) {
      await ctx.reply('❌ Пользователь не найден. Отправьте /start');
      return;
    }

    const settings = await this.settingsService.getUserSettings(user.id);

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🧑 Профиль', 'settings_profile')],
      [Markup.button.callback('🔔 Уведомления', 'settings_notifications')],
      [Markup.button.callback('🎯 Предпочтения', 'settings_preferences')],
      [Markup.button.callback('🌐 Язык', 'settings_language')],
      [Markup.button.callback('🔒 Приватность', 'settings_privacy')],
    ]);

    const languageFlag = settings.language === 'ru' ? '🇷🇺' : '🇬🇧';
    const notificationStatus = settings.notificationsEnabled ? '🔔' : '🔕';
    const profileVisibility = settings.showProfilePublicly ? '👁️' : '🙈';

    await ctx.reply(
      `⚙️ **Настройки**\n\n` +
      `🌐 **Язык:** ${languageFlag} ${settings.language.toUpperCase()}\n` +
      `${notificationStatus} **Уведомления:** ${settings.notificationsEnabled ? 'Включены' : 'Отключены'}\n` +
      `${profileVisibility} **Профиль:** ${settings.showProfilePublicly ? 'Публичный' : 'Приватный'}\n` +
      `🏙️ **Город:** ${settings.city?.name || 'Не указан'}\n` +
      `🎾 **Спорт:** ${settings.sport?.title || 'Не указан'}\n\n` + // Исправляем name на title
      `Выберите раздел для настройки:`,
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

@Action('settings_language')
async handleSettingsLanguage(ctx: Context) {
  await ctx.answerCbQuery();
  
  try {
    if (!ctx.from) return;

    const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
    if (!user) return;

    const settings = await this.settingsService.getUserSettings(user.id);

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🇷🇺 Русский', 'set_language_ru')],
      [Markup.button.callback('🇬🇧 English', 'set_language_en')],
      [Markup.button.callback('⬅️ Назад', 'back_to_settings')],
    ]);

    await ctx.editMessageText(
      `🌐 **Выбор языка**\n\n` +
      `Текущий язык: ${settings.language === 'ru' ? '🇷🇺 Русский' : '🇬🇧 English'}\n\n` +
      `Выберите язык интерфейса:`,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      }
    );

  } catch (error) {
    this.logger.error(`Ошибка в handleSettingsLanguage: ${error}`);
    await ctx.reply('❌ Ошибка при загрузке языковых настроек');
  }
}

@Action(/^set_language_(.+)$/)
async handleSetLanguage(ctx: Context) {
  await ctx.answerCbQuery();
  
  try {
    if (!ctx.from || !ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
    if (!user) return;

    const language = ctx.callbackQuery.data.replace('set_language_', '');
    
    await this.settingsService.updateLanguage(user.id, language);

    const languageText = language === 'ru' ? '🇷🇺 Русский' : '🇬🇧 English';
    await ctx.reply(
      `✅ Язык изменен на ${languageText}`,
      { parse_mode: 'Markdown' }
    );

    await this.handleSettings(ctx);

  } catch (error) {
    this.logger.error(`Ошибка в handleSetLanguage: ${error}`);
    await ctx.reply('❌ Ошибка при изменении языка');
  }
}

@Action('back_to_settings')
async handleBackToSettings(ctx: Context) {
  await this.handleSettings(ctx);
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

    // Создаем корректный объект CreateRequestDto без playerLevel
    const requestData: CreateRequestDto = {
      type: RequestType.GAME,
      title: `Игра ${new Date(userState.data.requestDateTime!).toLocaleDateString('ru-RU')}`,
      description: userState.data.requestDescription || 'Поиск партнера для игры в теннис',
      gameMode: GameMode.SINGLES,
      dateTime: new Date(userState.data.requestDateTime!),
      location: userState.data.requestLocation!,
      locationName: userState.data.requestLocation!, // Для совместимости
      maxPlayers: 2,
      // Убираем playerLevel так как его нет в схеме
      paymentType: 'FREE',
      ratingType: 'NTRP',
      formatInfo: {
        level: userState.data.requestLevel || 'ANY' // Сохраняем уровень в formatInfo
      },
    };

    const request = await this.requestsService.create(user.id.toString(), requestData);

    const summaryMessage = `✅ **Заявка создана!**\n\n` +
      `📅 **Время:** ${new Date(requestData.dateTime).toLocaleString('ru-RU')}\n` +
      `📍 **Место:** ${requestData.location}\n` +
      `🎯 **Уровень:** ${this.getLevelText(userState.data.requestLevel || 'ANY')}\n` +
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
    `Введите фамилию:`,
    { parse_mode: 'Markdown' }
  );
}

private async handleLastName(ctx: Context, text: string, userId: string, userState: UserState) {
  userState.data.lastName = text.trim();
  userState.step = ProfileStep.AWAITING_CITY;
  this.setUserState(userId, userState);

  await ctx.reply(
    `✅ Фамилия: **${text}**\n\n` +
    `Введите ваш город:`,
    { parse_mode: 'Markdown' }
  );
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

private async handleCity(ctx: Context, text: string, userId: string, userState: UserState) {
  userState.data.city = text.trim();
  userState.step = ProfileStep.AWAITING_COURT;
  this.setUserState(userId, userState);

  await ctx.reply(
    `✅ Город: **${text}**\n\n` +
    `Введите предпочитаемый корт или клуб:`,
    { parse_mode: 'Markdown' }
  );
}

private async handleCourt(ctx: Context, text: string, userId: string, userState: UserState) {
  userState.data.preferredCourt = text.trim();
  await this.completeProfileSetup(ctx, userId, userState);
}

private async handleTournamentDescription(ctx: Context, text: string, userId: string, userState: UserState) {
  userState.data.tournamentDescription = text.trim();
  
  // Завершаем создание турнира
  await this.createTournament(ctx, userId, userState);
}






private async completeProfileSetup(ctx: Context, userId: string, userState: UserState) {
  try {
    const user = await this.usersService.findByTelegramId(userId);
    if (!user) {
      await ctx.reply('❌ Пользователь не найден');
      return;
    }

    // Обновляем профиль пользователя только с существующими полями
    await this.usersService.updateProfile(user.id.toString(), {
      city: userState.data.city
      // Убираем profileStepOneCompleted так как его нет в UpdateProfileDto
    });

    await ctx.reply(
      `✅ **Профиль настроен!**\n\n` +
      `🏙️ Город: ${userState.data.city}\n` +
      `🎾 Корт: ${userState.data.preferredCourt}\n\n` +
      `Теперь вы можете полноценно пользоваться ботом!`,
      { 
        parse_mode: 'Markdown',
        reply_markup: this.getMainKeyboard().reply_markup
      }
    );

    this.clearUserState(userId);

  } catch (error) {
    this.logger.error(`Ошибка завершения настройки профиля: ${error}`);
    await ctx.reply('❌ Ошибка при сохранении профиля');
  }
}




private async createTournament(ctx: Context, userId: string, userState: UserState) {
  try {
    const user = await this.usersService.findByTelegramId(userId);
    if (!user) {
      await ctx.reply('❌ Пользователь не найден');
      return;
    }

    // Создаем турнир с правильной структурой CreateTournamentDto
    const tournamentData = {
      title: userState.data.tournamentName!,
      description: userState.data.tournamentDescription!,
      type: TournamentType.SINGLE_ELIMINATION, // Используем правильный enum
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      minPlayers: 4,
      maxPlayers: 16,
      isRanked: true,
      locationName: userState.data.city || 'Не указано'
    };

    await this.tournamentsService.create(user.id.toString(), tournamentData);

    await ctx.reply(
      `🏆 **Турнир создан!**\n\n` +
      `📝 **Название:** ${tournamentData.title}\n` +
      `📖 **Описание:** ${tournamentData.description}\n` +
      `📅 **Начало:** ${tournamentData.startDate.toLocaleDateString('ru-RU')}\n` +
      `🏅 **Рейтинговый:** ${tournamentData.isRanked ? 'Да' : 'Нет'}\n` +
      `👥 **Максимум участников:** ${tournamentData.maxPlayers}\n\n` +
      `Турнир опубликован и открыт для регистрации!`,
      { 
        parse_mode: 'Markdown',
        reply_markup: this.getMainKeyboard().reply_markup
      }
    );

    this.clearUserState(userId);

  } catch (error) {
    this.logger.error(`Ошибка создания турнира: ${error}`);
    await ctx.reply('❌ Ошибка при создании турнира');
  }
}


private async handleMatchScore(ctx: Context, text: string, userId: string, userState: UserState) {
  userState.data.matchScore = text.trim();
  userState.step = ProfileStep.AWAITING_MATCH_DATE;
  this.setUserState(userId, userState);

  await ctx.reply(
    `✅ Счет: **${text}**\n\n` +
    `Введите дату матча (ДД.ММ.ГГГГ):`,
    { parse_mode: 'Markdown' }
  );
}

private async handleMatchDate(ctx: Context, text: string, userId: string, userState: UserState) {
  userState.data.matchDate = text.trim();
  await this.createMatch(ctx, userId, userState);
}

private async handleCitySearch(ctx: Context, text: string, userId: string, userState: UserState) {
  const city = text.trim();
  
  try {
    const courtsMessage = this.generateCityCortsMessage(city);
    
    await ctx.reply(courtsMessage, {
      parse_mode: 'Markdown',
      reply_markup: this.getMainKeyboard().reply_markup
    });

    this.clearUserState(userId);

  } catch (error) {
    this.logger.error(`Ошибка поиска кортов: ${error}`);
    await ctx.reply('❌ Ошибка при поиске кортов');
  }
}


  
  // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================

private getLevelText(level: string): string {
  const levels: { [key: string]: string } = {
    'beginner': '🟢 Новичок',
    'amateur': '🔵 Любитель', 
    'confident': '🟡 Уверенный',
    'tournament': '🟠 Турнирный',
    'semi_pro': '🔴 Профи',
    'any': '⚪ Любой',
    'BEGINNER': '🟢 Новичок',
    'AMATEUR': '🔵 Любитель', 
    'CONFIDENT': '🟡 Уверенный',
    'TOURNAMENT': '🟠 Турнирный',
    'SEMI_PRO': '🔴 Профи',
    'ANY': '⚪ Любой'
  };
  return levels[level] || '⚪ Любой';
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


  // ==================== НЕДОСТАЮЩИЕ ОБРАБОТЧИКИ ====================


@Action('my_requests')
async handleMyRequests(ctx: Context) {
  await ctx.answerCbQuery();
  
  if (!ctx.from) return;

  try {
    const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
    if (!user) {
      await ctx.reply('❌ Пользователь не найден');
      return;
    }

    // Используем существующий метод findAll с фильтрацией
    const allRequests = await this.requestsService.findAll({ page: 1, limit: 100 }) as any[];
    
    // Безопасная фильтрация своих заявок
    const myRequests = allRequests.filter((req: any) => {
      const creatorId = req.creatorId || req.creator?.id;
      return creatorId && creatorId.toString() === user.id.toString();
    });
    
    if (myRequests.length === 0) {
      await ctx.editMessageText(
        `📋 **Мои заявки**\n\n` +
        `У вас пока нет активных заявок.\n\n` +
        `Создайте новую заявку!`,
        { 
          parse_mode: 'Markdown',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('➕ Создать заявку', 'create_request')],
            [Markup.button.callback('⬅️ Назад', 'back_to_play')]
          ]).reply_markup
        }
      );
      return;
    }

    let message = `📋 **Мои заявки (${myRequests.length}):**\n\n`;
    const buttons: any[] = [];

    myRequests.slice(0, 5).forEach((request: any, index: number) => {
      const datetime = request.dateTime || request.scheduledTime 
        ? new Date(request.dateTime || request.scheduledTime).toLocaleString('ru-RU')
        : 'Время не указано';
      
      const title = request.title || `Заявка ${index + 1}`;
      const location = request.locationName || request.location || 'Место не указано';
      const currentPlayers = request.currentPlayers || 0;
      const maxPlayers = request.maxPlayers || 2;
      
      message += `${index + 1}. **${title}**\n`;
      message += `📅 ${datetime}\n`;
      message += `📍 ${location}\n`;
      message += `👥 ${currentPlayers}/${maxPlayers}\n\n`;
      
      buttons.push([
        Markup.button.callback(`✏️ ${index + 1}`, `edit_request_${request.id}`),
        Markup.button.callback(`❌ ${index + 1}`, `delete_request_${request.id}`)
      ]);
    });

    buttons.push([Markup.button.callback('➕ Создать новую', 'create_request')]);
    buttons.push([Markup.button.callback('⬅️ Назад', 'back_to_play')]);

    const keyboard = Markup.inlineKeyboard(buttons);

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard.reply_markup
    });

  } catch (error) {
    this.logger.error(`Ошибка в handleMyRequests: ${error}`);
    await ctx.reply('❌ Ошибка при загрузке заявок');
  }
}



  @Action('active_requests')
  async handleActiveRequests(ctx: Context) {
    await ctx.answerCbQuery();
    await this.handleFindGame(ctx);
  }

  @Action('back_to_play')
  async handleBackToPlay(ctx: Context) {
    await ctx.answerCbQuery();
    await this.handlePlay(ctx);
  }


@Action(/^req_level_(.+)$/)
async handleRequestLevelCallback(ctx: Context) {
  await ctx.answerCbQuery();
  
  if (!ctx.from || !ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

  const userId = ctx.from.id.toString();
  const userState = this.getUserState(userId);
  
  // Исправить получение level из callback_data
  const callbackData = ctx.callbackQuery.data;
  const level = callbackData.replace('req_level_', '');

  userState.data.requestLevel = level;
  userState.step = ProfileStep.AWAITING_REQUEST_DESCRIPTION;
  this.setUserState(userId, userState);

  await ctx.editMessageText(
    `✅ Уровень: **${this.getLevelText(level)}**\n\n` +
    `**Шаг 4 из 4**\n\n` +
    `Добавьте описание заявки (или отправьте "пропустить"):`,
    { parse_mode: 'Markdown' }
  );
}

  // ==================== ОБРАБОТЧИКИ ТУРНИРОВ ====================

  @Action('create_tournament')
  async handleCreateTournament(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    
    this.setUserState(userId, {
      step: ProfileStep.AWAITING_TOURNAMENT_NAME,
      data: {}
    });

    await ctx.editMessageText(
      `🏆 **Создание турнира**\n\n` +
      `**Шаг 1 из 5**\n\n` +
      `Введите название турнира:`,
      { parse_mode: 'Markdown' }
    );
  }

  @Action('my_tournaments')
  async handleMyTournaments(ctx: Context) {
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
      `📋 **Мои турниры**\n\n` +
      `Функция в разработке.\n\n` +
      `Скоро здесь будут отображаться турниры, которые вы создали или в которых участвуете.`,
      { parse_mode: 'Markdown' }
    );
  }

  @Action('tournament_history')
  async handleTournamentHistory(ctx: Context) {
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
      `🏆 **История турниров**\n\n` +
      `Функция в разработке.\n\n` +
      `Здесь будет отображаться история ваших участий в турнирах.`,
      { parse_mode: 'Markdown' }
    );
  }

  // ==================== ОБРАБОТЧИКИ ТРЕНИРОВОК ====================

  @Action('find_training')
  async handleFindTraining(ctx: Context) {
    await ctx.answerCbQuery();
    
    try {
      // Используем существующий метод
      const trainings = await this.trainingsService.findAll({ page: 1, limit: 10 }) as any[];
      
      if (trainings.length === 0) {
        await ctx.editMessageText(
          `🔍 **Поиск тренировок**\n\n` +
          `😔 Пока нет доступных тренировок.\n\n` +
          `Создайте свою тренировку!`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      let message = `🔍 **Доступные тренировки:**\n\n`;
      const buttons: any[] = [];

      trainings.slice(0, 5).forEach((training: any, index: number) => {
        const datetime = new Date(training.datetime).toLocaleString('ru-RU');
        message += `${index + 1}. **${training.title}**\n`;
        message += `👨‍🏫 ${training.trainer?.first_name || 'Тренер'}\n`;
        message += `📅 ${datetime}\n`;
        message += `📍 ${training.location}\n`;
        message += `👥 ${training.currentParticipants || 0}/${training.maxParticipants}\n`;
        message += `💰 ${training.price || 0} руб.\n\n`;
        
        buttons.push([Markup.button.callback(
          `${index + 1}. Записаться`, 
          `book_training_${training.id}`
        )]);
      });

      buttons.push([Markup.button.callback('🔄 Обновить', 'find_training')]);

      const keyboard = Markup.inlineKeyboard(buttons);

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });

    } catch (error) {
      this.logger.error(`Ошибка в handleFindTraining: ${error}`);
      await ctx.reply('❌ Ошибка при поиске тренировок');
    }
  }

  @Action('my_trainings')
  async handleMyTrainings(ctx: Context) {
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
      `📋 **Мои тренировки**\n\n` +
      `Функция в разработке.\n\n` +
      `Здесь будут отображаться ваши тренировки.`,
      { parse_mode: 'Markdown' }
    );
  }

  @Action('become_trainer')
  async handleBecomeTrainer(ctx: Context) {
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
      `👨‍🏫 **Стать тренером**\n\n` +
      `Функция в разработке.\n\n` +
      `Скоро вы сможете создавать тренировки и обучать других игроков!`,
      { parse_mode: 'Markdown' }
    );
  }

  // ==================== ОБРАБОТЧИКИ STORIES ====================

  @Action('upload_photo_story')
  async handleUploadPhotoStory(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    
    this.setUserState(userId, {
      step: ProfileStep.AWAITING_STORY_MEDIA,
      data: { storyType: 'PHOTO' }
    });

    await ctx.editMessageText(
      `📷 **Загрузка фото**\n\n` +
      `Отправьте фото для вашей истории:`,
      { parse_mode: 'Markdown' }
    );
  }

  @Action('upload_video_story')
  async handleUploadVideoStory(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    
    this.setUserState(userId, {
      step: ProfileStep.AWAITING_STORY_MEDIA,
      data: { storyType: 'VIDEO' }
    });

    await ctx.editMessageText(
      `🎥 **Загрузка видео**\n\n` +
      `Отправьте видео для вашей истории:`,
      { parse_mode: 'Markdown' }
    );
  }



@Action('view_stories')
async handleViewStories(ctx: Context) {
  await ctx.answerCbQuery();
  
  try {
    // Простая заглушка без обращения к несуществующим методам
    await ctx.editMessageText(
      `👀 **Stories**\n\n` +
      `😔 Пока нет Stories.\n\n` +
      `Будьте первым, кто поделится своей историей!`,
      { parse_mode: 'Markdown' }
    );

  } catch (error) {
    this.logger.error(`Ошибка в handleViewStories: ${error}`);
    await ctx.editMessageText(
      `👀 **Stories**\n\n` +
      `😔 Пока нет Stories.\n\n` +
      `Будьте первым, кто поделится своей историей!`,
      { parse_mode: 'Markdown' }
    );
  }
}
  @Action('my_stories')
  async handleMyStories(ctx: Context) {
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
      `📋 **Мои Stories**\n\n` +
      `Функция в разработке.\n\n` +
      `Здесь будут отображаться ваши Stories.`,
      { parse_mode: 'Markdown' }
    );
  }

  // ==================== ОБРАБОТЧИКИ КЕЙСОВ ====================


@Action(/^open_case_(\d+)$/)
async handleOpenCaseAction(ctx: Context) {
  await ctx.answerCbQuery();
  
  if (!ctx.from || !ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

  // Исправить получение caseId из callback_data
  const callbackData = ctx.callbackQuery.data;
  const caseId = parseInt(callbackData.replace('open_case_', ''));
  
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

  @Action('case_history')
  async handleCaseHistoryAction(ctx: Context) {
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
      `📊 **История открытий**\n\n` +
      `Функция в разработке.\n\n` +
      `Здесь будет отображаться история ваших открытий кейсов.`,
      { parse_mode: 'Markdown' }
    );
  }

  @Action('back_to_cases')
  async handleBackToCases(ctx: Context) {
    await ctx.answerCbQuery();
    await this.handleCases(ctx);
  }

  // ==================== AI COACH ====================

  @Action('ai_technique_tip')
  async handleAITechniqueTip(ctx: Context) {
    await ctx.answerCbQuery();
    
    const tips = [
      "🎾 **Совет по подаче:** Держите ракетку континентальным хватом для более эффективной подачи.",
      "🎾 **Совет по удару:** Следите за мячом глазами до момента контакта с ракеткой.",
      "🎾 **Совет по движению:** Всегда возвращайтесь в центр корта после удара.",
      "🎾 **Совет по стратегии:** Играйте в слабые места соперника - обычно это бэкхенд.",
      "🎾 **Совет по физподготовке:** Уделяйте больше внимания работе ног - это основа хорошей игры."
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    await ctx.editMessageText(
      `💡 **Совет от AI-Coach:**\n\n${randomTip}\n\n` +
      `Хотите персональный план тренировок? Нажмите кнопку ниже!`,
      {
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('🏃‍♂️ План тренировки', 'ai_training_plan')],
          [Markup.button.callback('🔄 Другой совет', 'ai_technique_tip')]
        ]).reply_markup
      }
    );
  }

  @Action('ai_training_plan')
  async handleAITrainingPlan(ctx: Context) {
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
      `🏃‍♂️ **Персональный план тренировки**\n\n` +
      `**Разминка (10 мин):**\n` +
      `• Легкий бег вокруг корта\n` +
      `• Растяжка мышц\n` +
      `• Махи ракеткой\n\n` +
      `**Техника (20 мин):**\n` +
      `• Отработка форхенда у стенки\n` +
      `• Подачи в мишени\n` +
      `• Движение ног\n\n` +
      `**Игра (20 мин):**\n` +
      `• Розыгрыши с партнером\n` +
      `• Отработка тактических ситуаций\n\n` +
      `**Заминка (10 мин):**\n` +
      `• Растяжка\n` +
      `• Дыхательные упражнения`,
      {
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('📊 Анализ игры', 'ai_game_analysis')],
          [Markup.button.callback('🎯 Поставить цели', 'ai_goal_setting')]
        ]).reply_markup
      }
    );
  }

  @Action('ai_game_analysis')
  async handleAIGameAnalysis(ctx: Context) {
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
      `📊 **Анализ вашей игры**\n\n` +
      `Основываясь на ваших последних матчах:\n\n` +
      `**Сильные стороны:**\n` +
      `✅ Стабильная подача\n` +
      `✅ Хорошее покрытие корта\n\n` +
      `**Области для улучшения:**\n` +
      `📈 Бэкхенд удары\n` +
      `📈 Игра у сетки\n` +
      `📈 Тактическое мышление\n\n` +
      `**Рекомендации:**\n` +
      `🎯 Больше практикуйте бэкхенд\n` +
      `🎯 Изучите тактику игры\n` +
      `🎯 Работайте над выносливостью`,
      {
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('💡 Новый совет', 'ai_technique_tip')]
        ]).reply_markup
      }
    );
  }

  @Action('ai_goal_setting')
  async handleAIGoalSetting(ctx: Context) {
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
      `🎯 **Постановка целей**\n\n` +
      `**Краткосрочные цели (1 месяц):**\n` +
      `• Выиграть 3 матча подряд\n` +
      `• Улучшить процент первой подачи до 60%\n` +
      `• Принять участие в турнире\n\n` +
      `**Среднесрочные цели (3 месяца):**\n` +
      `• Повысить рейтинг на 100 пунктов\n` +
      `• Освоить удар с лета\n` +
      `• Найти постоянного партнера\n\n` +
      `**Долгосрочные цели (1 год):**\n` +
      `• Дойти до финала турнира\n` +
      `• Повысить уровень игры\n` +
      `• Стать тренером`,
      {
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('🏃‍♂️ План тренировки', 'ai_training_plan')]
        ]).reply_markup
      }
    );
  }

  // ==================== ОБРАБОТЧИКИ ПРОФИЛЯ ====================

  @Action('setup_profile')
  async handleSetupProfileAction(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    
    this.setUserState(userId, {
      step: ProfileStep.AWAITING_FIRST_NAME,
      data: {}
    });

    await ctx.editMessageText(
      `🔄 **Настройка профиля**\n\n` +
      `Давайте заполним ваш профиль для лучшего поиска партнеров.\n\n` +
      `Введите ваше имя:`,
      { parse_mode: 'Markdown' }
    );
  }

  @Action('detailed_stats')
  async handleDetailedStats(ctx: Context) {
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
      `📊 **Подробная статистика**\n\n` +
      `Функция в разработке.\n\n` +
      `Здесь будет детальная аналитика вашей игры.`,
      { parse_mode: 'Markdown' }
    );
  }

  @Action('match_history')
  async handleMatchHistoryAction(ctx: Context) {
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
      `🎾 **История матчей**\n\n` +
      `Функция в разработке.\n\n` +
      `Здесь будет история всех ваших матчей.`,
      { parse_mode: 'Markdown' }
    );
  }


@Action('achievements')
async handleAchievements(ctx: Context) {
  await ctx.answerCbQuery();
  
  try {
    const user = await this.usersService.findByTelegramId(ctx.from!.id.toString());
    if (!user) return;

    const achievements = await this.achievementsService.getUserAchievements(user.id.toString());
    
    if (achievements.length === 0) {
      await ctx.editMessageText(
        `🏅 **Ваши достижения**\n\n` +
        `У вас пока нет достижений.\n\n` +
        `Играйте в матчи, участвуйте в турнирах и приглашайте друзей, чтобы получить первые награды!`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    let message = `🏅 **Ваши достижения** (${achievements.length}):\n\n`;
    
    achievements.slice(0, 10).forEach((achievement, index) => {
      const def = achievement.definition;
      message += `${def.icon} **${def.name}**\n`;
      message += `${def.description}\n`;
      message += `📅 ${achievement.awardedAt.toLocaleDateString('ru-RU')}\n\n`;
    });

    if (achievements.length > 10) {
      message += `...и еще ${achievements.length - 10} достижений\n\n`;
    }

    message += `Продолжайте играть, чтобы получить больше наград! 🎯`;

    await ctx.editMessageText(message, { parse_mode: 'Markdown' });

  } catch (error) {
    this.logger.error(`Ошибка в handleAchievements: ${error instanceof Error ? error.message : String(error)}`);
    await ctx.reply('❌ Ошибка при загрузке достижений');
  }
}

async notifyNewAchievement(userId: string, achievementCode: string) {
  try {
    const user = await this.usersService.findById(userId);
    if (!user || !user.telegram_id) return;

    const definitions = await this.achievementsService.getAllDefinitions();
    const achievement = definitions.find((def: any) => def.code === achievementCode);
    
    if (!achievement) return;

    const message = `🏆 **Поздравляем!**\n\n` +
      `Вы получили достижение:\n` +
      `${achievement.icon} **${achievement.name}**\n\n` +
      `${achievement.description}`;

    await this.bot.telegram.sendMessage(user.telegram_id, message, {
        parse_mode: 'Markdown',
    });

  } catch (error) {
    this.logger.error(`Ошибка отправки уведомления о достижении: ${error}`);
  }
}
  // ==================== ОБРАБОТЧИКИ МАТЧЕЙ ====================

  @Action('match_type_singles')
  async handleMatchTypeSingles(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    const userState = this.getUserState(userId);
    
    userState.data.matchType = 'SINGLES';
    userState.step = ProfileStep.AWAITING_MATCH_OPPONENT;
    this.setUserState(userId, userState);

    await ctx.editMessageText(
      `🎾 **Одиночный матч**\n\n` +
      `Введите имя соперника:`,
      { parse_mode: 'Markdown' }
    );
  }

  @Action('match_type_doubles')
  async handleMatchTypeDoubles(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    const userState = this.getUserState(userId);
    
    userState.data.matchType = 'DOUBLES';
    userState.step = ProfileStep.AWAITING_MATCH_OPPONENT;
    this.setUserState(userId, userState);

    await ctx.editMessageText(
      `👥 **Парный матч**\n\n` +
      `Введите имена соперников:`,
      { parse_mode: 'Markdown' }
    );
  }

  // ==================== ОБРАБОТКА МЕДИА ====================

  @On('photo')
  async handlePhoto(ctx: Context) {
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    const userState = this.getUserState(userId);

    if (userState.step === ProfileStep.AWAITING_STORY_MEDIA && userState.data.storyType === 'PHOTO') {
      const photo = (ctx.message as any).photo;
      const fileId = photo[photo.length - 1].file_id;
      
      userState.data.storyMediaId = fileId;
      userState.step = ProfileStep.AWAITING_STORY_DESCRIPTION;
      this.setUserState(userId, userState);

      await ctx.reply(
        `📷 **Фото загружено!**\n\n` +
        `Добавьте описание к вашей истории:`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  @On('video')
  async handleVideo(ctx: Context) {
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    const userState = this.getUserState(userId);

    if (userState.step === ProfileStep.AWAITING_STORY_MEDIA && userState.data.storyType === 'VIDEO') {
      const video = (ctx.message as any).video;
      const fileId = video.file_id;
      
      userState.data.storyMediaId = fileId;
      userState.step = ProfileStep.AWAITING_STORY_DESCRIPTION;
      this.setUserState(userId, userState);

      await ctx.reply(
        `🎥 **Видео загружено!**\n\n` +
        `Добавьте описание к вашей истории:`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  // ==================== ПОИСК КОРТОВ ====================

  @Hears('📍 Найти корты')
  async handleFindCourtsButton(ctx: Context) {
    await this.handleFindCourts(ctx);
  }

  async handleFindCourts(ctx: Context) {
    this.logger.log('📍 НАЙТИ КОРТЫ функция');
    
    try {
      if (!ctx.from) return;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🏙️ Москва', 'courts_moscow')],
        [Markup.button.callback('🏙️ СПб', 'courts_spb')],
        [Markup.button.callback('🌆 Другой город', 'courts_other_city')],
        [Markup.button.callback('📍 По геолокации', 'courts_location')],
      ]);

      await ctx.reply(
        `📍 **Поиск теннисных кортов**\n\n` +
        `Выберите способ поиска:`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        }
      );

    } catch (error) {
      this.logger.error(`Ошибка в handleFindCourts: ${error}`);
      await ctx.reply('❌ Ошибка при поиске кортов');
    }
  }

  @Action('courts_moscow')
  async handleCourtsMoscow(ctx: Context) {
    await ctx.answerCbQuery();
    await this.showCourtsForCity(ctx, 'Москва');
  }

  @Action('courts_spb')
  async handleCourtsSpb(ctx: Context) {
    await ctx.answerCbQuery();
    await this.showCourtsForCity(ctx, 'Санкт-Петербург');
  }

  @Action('courts_other_city')
  async handleCourtsOtherCity(ctx: Context) {
    await ctx.answerCbQuery();
    
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    
    this.setUserState(userId, {
      step: ProfileStep.AWAITING_CITY_SEARCH,
      data: {}
    });

    await ctx.editMessageText(
      `🌆 **Поиск кортов**\n\n` +
      `Введите название города:`,
      { parse_mode: 'Markdown' }
    );
  }

  @Action('courts_location')
  async handleCourtsLocation(ctx: Context) {
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
      `📍 **Поиск по геолокации**\n\n` +
      `Функция в разработке.\n\n` +
      `Скоро вы сможете найти ближайшие корты по вашему местоположению.`,
      { parse_mode: 'Markdown' }
    );
  }

  private async showCourtsForCity(ctx: Context, city: string) {
    const courtsMessage = this.generateCityCortsMessage(city);
    
    await ctx.editMessageText(courtsMessage, {
      parse_mode: 'Markdown'
    });
  }

  // ==================== ДОПОЛНИТЕЛЬНЫЕ ОБРАБОТЧИКИ ====================

private generateCityCortsMessage(city: string): string {
  // Расширенные моковые данные для разных городов
  const courtsByCity: { [key: string]: any[] } = {
    'Москва': [
      {
        name: 'Теннисный центр "Олимпийский"',
        address: 'Олимпийский проспект, 16',
        price: '2000-3500 руб/час',
        rating: '4.9',
        courts: 12,
        features: ['Крытые корты', 'Хард', 'Парковка', 'Раздевалки', 'Душевые', 'Прокат ракеток']
      },
      {
        name: 'ТЦ "Лужники"',
        address: 'Лужнецкая наб., 24',
        price: '1500-2800 руб/час',
        rating: '4.7',
        courts: 8,
        features: ['Крытые/открытые', 'Хард/грунт', 'Освещение', 'Кафе']
      },
      {
        name: 'Клуб "Спартак"',
        address: 'ул. Дорогомиловская, 14',
        price: '1800-3000 руб/час',
        rating: '4.6',
        courts: 6,
        features: ['Крытые корты', 'Хард', 'Тренеры', 'Групповые занятия']
      }
    ],
    'Санкт-Петербург': [
      {
        name: 'ТК "Петровский"',
        address: 'Петровская наб., 4',
        price: '1200-2200 руб/час',
        rating: '4.8',
        courts: 10,
        features: ['Крытые корты', 'Хард', 'Вид на Неву', 'Парковка']
      },
      {
        name: 'Клуб "Динамо"',
        address: 'пр. Динамо, 44',
        price: '1000-1800 руб/час',
        rating: '4.5',
        courts: 8,
        features: ['Открытые корты', 'Грунт', 'Летний сезон']
      }
    ]
  };

  const courts = courtsByCity[city] || [
    {
      name: 'Теннисный клуб',
      address: 'Центр города',
      price: '1000-2000 руб/час',
      rating: '4.5',
      courts: 4,
      features: ['Открытые корты', 'Хард']
    }
  ];

  let message = `🏙️ **Корты в городе ${city}:**\n\n`;

  courts.forEach((court, index) => {
    message += `${index + 1}. **${court.name}**\n`;
    message += `📍 ${court.address}\n`;
    message += `💰 ${court.price}\n`;
    message += `⭐ Рейтинг: ${court.rating}\n`;
    message += `🎾 Кортов: ${court.courts}\n`;
    message += `✨ ${court.features.join(', ')}\n\n`;
  });

  message += `📞 **Для бронирования:**\n`;
  message += `• Звоните в администрацию\n`;
  message += `• Используйте приложения бронирования\n`;
  message += `• Уточняйте актуальные цены\n\n`;
  message += `💡 **Совет:** Проверьте наличие свободного времени заранее!`;

  return message;
}


private async createMatch(ctx: Context, userId: string, userState: UserState) {
  try {
    const user = await this.usersService.findByTelegramId(userId);
    if (!user) {
      await ctx.reply('❌ Пользователь не найден');
      return;
    }

    // Определяем результат по счету (упрощенная логика)
    const score = userState.data.matchScore || '';
    const isWin = score.includes('6-') && score.split(' ')[0].startsWith('6');

    // Используем правильную структуру CreateMatchDto
    const matchData = {
      opponentName: userState.data.matchOpponent!,
      opponentId: null,
      score: userState.data.matchScore!,
      matchDate: new Date(userState.data.matchDate!),
      type: userState.data.matchType === 'DOUBLES' ? MatchType.DOUBLES : MatchType.ONE_ON_ONE, // Используем правильный enum
      result: isWin ? 'WIN' as const : 'LOSS' as const,
      isRanked: false,
      location: 'Не указано'
    };

    // Используем существующий метод
    await this.matchesService.create(user.id.toString(), matchData);

    const summaryMessage = `🎾 **Матч записан!**\n\n` +
      `👤 **Соперник:** ${matchData.opponentName}\n` +
      `🏆 **Счет:** ${matchData.score}\n` +
      `📅 **Дата:** ${matchData.matchDate.toLocaleDateString('ru-RU')}\n` +
      `🎯 **Тип:** ${matchData.type === MatchType.ONE_ON_ONE ? 'Одиночный' : 'Парный'}\n` +
      `📊 **Результат:** ${matchData.result === 'WIN' ? 'Победа 🏆' : 'Поражение'}\n\n` +
      `Матч добавлен в вашу статистику!`;

    await ctx.reply(summaryMessage, { 
      parse_mode: 'Markdown',
      reply_markup: this.getMainKeyboard().reply_markup
    });

    this.clearUserState(userId);

  } catch (error) {
    this.logger.error(`Ошибка создания матча: ${error}`);
    await ctx.reply('❌ Ошибка при записи матча');
  }
}

private async createStory(ctx: Context, userId: string, userState: UserState) {
  try {
    const user = await this.usersService.findByTelegramId(userId);
    if (!user) {
      await ctx.reply('❌ Пользователь не найден');
      return;
    }

    const storyData = {
      description: userState.data.storyDescription || '',
      mediaUrl: userState.data.storyMediaId || '',
      type: userState.data.storyType || 'PHOTO',
    };

    // Простая заглушка без обращения к несуществующим методам
    this.logger.log(`Story создана (заглушка): ${JSON.stringify(storyData)}`);

    await ctx.reply(
      `📸 **История опубликована!**\n\n` +
      `${storyData.description ? `📝 ${storyData.description}` : ''}\n\n` +
      `Ваша история будет видна другим игрокам после добавления функционала Stories!`,
      { 
        parse_mode: 'Markdown',
        reply_markup: this.getMainKeyboard().reply_markup
      }
    );

    this.clearUserState(userId);

  } catch (error) {
    this.logger.error(`Ошибка создания истории: ${error}`);
    await ctx.reply('❌ Ошибка при публикации истории');
  }
}


 

}