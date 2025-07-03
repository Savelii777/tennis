import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf, Markup } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
import { UsersService } from '../../users/application/services/users.service';
import { TournamentsService } from '../../tournaments/application/services/tournaments.service';
import { ProfileStep } from '../interfaces/profile-state.enum';
import { TournamentType } from '../../tournaments/domain/enums/tournament.enum';

@Injectable()
export class TournamentsHandler {
  private readonly logger = new Logger(TournamentsHandler.name);

  constructor(
    private readonly stateService: StateService,
    private readonly keyboardService: KeyboardService,
    private readonly usersService: UsersService,
    private readonly tournamentsService: TournamentsService
  ) {}

  register(bot: Telegraf<Context>) {
    bot.action('create_tournament', this.handleCreateTournament.bind(this));
    bot.action('find_tournament', this.handleFindTournament.bind(this));
    bot.action('my_tournaments', this.handleMyTournaments.bind(this));
    bot.action('join_tournament', this.handleJoinTournament.bind(this));
    bot.action('leave_tournament', this.handleLeaveTournament.bind(this));
    bot.action(/^view_tournament_(\d+)$/, this.handleViewTournament.bind(this));
    bot.action(/^join_tournament_(\d+)$/, this.handleJoinSpecificTournament.bind(this));
    bot.action(/^leave_tournament_(\d+)$/, this.handleLeaveSpecificTournament.bind(this));
    bot.action('back_to_tournaments', this.handleBackToTournaments.bind(this));
  }

  async handleTournaments(ctx: Context) {
    try {
      if (!ctx.from) return;

      const userId = ctx.from.id.toString();
      const user = await this.usersService.findByTelegramId(userId);
      
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }

      // Получаем турниры пользователя
      const userTournaments = await this.tournamentsService.getUserTournaments(user.id.toString());
      
      let message = `🏆 **Турниры**\n\n`;
      
      if (userTournaments && userTournaments.length > 0) {
        message += `📋 **Ваши турниры (${userTournaments.length}):**\n\n`;
        
        userTournaments.slice(0, 5).forEach((tournament: any, index: number) => {
          const statusEmoji = tournament.status === 'ACTIVE' ? '🟢' : 
                            tournament.status === 'DRAFT' ? '🟡' : '🔴';
          message += `${statusEmoji} **${tournament.title}**\n`;
          message += `   📅 ${new Date(tournament.startDate).toLocaleDateString('ru-RU')}\n`;
          message += `   👥 ${tournament.participantsCount} участников\n`;
          message += `   🏟️ ${tournament.location || 'Не указано'}\n\n`;
        });
        
        if (userTournaments.length > 5) {
          message += `   ... и еще ${userTournaments.length - 5} турниров\n\n`;
        }
      } else {
        message += `Вы пока не участвуете в турнирах.\n\n`;
      }

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔍 Найти турнир', 'find_tournament')],
        [Markup.button.callback('🏆 Создать турнир', 'create_tournament')],
        [Markup.button.callback('📋 Мои турниры', 'my_tournaments')],
        [Markup.button.callback('⬅️ Назад', 'main_menu')]
      ]);
      
      await ctx.reply(message, { 
        parse_mode: 'Markdown', 
        reply_markup: keyboard.reply_markup 
      });
    } catch (error) {
      this.logger.error(`Ошибка в handleTournaments: ${error}`);
      await ctx.reply('❌ Произошла ошибка при загрузке турниров');
    }
  }

  async handleMyTournaments(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;

      const userId = ctx.from.id.toString();
      const user = await this.usersService.findByTelegramId(userId);
      
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }

      // Получаем все турниры пользователя
      const allTournaments = await this.tournamentsService.getUserTournaments(user.id.toString());
      
      // Группируем по статусу
      const activeTournaments = allTournaments.filter((t: any) => t.status === 'ACTIVE');
      const upcomingTournaments = allTournaments.filter((t: any) => t.status === 'DRAFT');
      const finishedTournaments = allTournaments.filter((t: any) => t.status === 'COMPLETED');
      
      let message = `📋 **Мои турниры**\n\n`;
      
      if (activeTournaments.length > 0) {
        message += `🟢 **Активные (${activeTournaments.length}):**\n`;
        activeTournaments.forEach((tournament: any) => {
          message += `• ${tournament.title}\n`;
        });
        message += '\n';
      }
      
      if (upcomingTournaments.length > 0) {
        message += `🟡 **Предстоящие (${upcomingTournaments.length}):**\n`;
        upcomingTournaments.forEach((tournament: any) => {
          message += `• ${tournament.title}\n`;
        });
        message += '\n';
      }
      
      if (finishedTournaments.length > 0) {
        message += `🔴 **Завершенные (${finishedTournaments.length}):**\n`;
        finishedTournaments.slice(0, 3).forEach((tournament: any) => {
          message += `• ${tournament.title}\n`;
        });
        if (finishedTournaments.length > 3) {
          message += `   ... и еще ${finishedTournaments.length - 3}\n`;
        }
        message += '\n';
      }
      
      if (allTournaments.length === 0) {
        message += `Вы пока не участвуете в турнирах.\n\n`;
        message += `Используйте кнопку "Найти турнир" для поиска доступных турниров.`;
      }

      await ctx.editMessageText(message, { 
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('⬅️ Назад к турнирам', 'back_to_tournaments')]
        ]).reply_markup
      });
    } catch (error) {
      this.logger.error(`Ошибка получения турниров пользователя: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке ваших турниров');
    }
  }

  async handleCreateTournament(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      
      const userId = ctx.from.id.toString();
      
      // Инициализируем состояние для создания турнира
      this.stateService.setUserState(userId, {
        step: ProfileStep.CREATING_TOURNAMENT,
        data: {}
      });
      
      await ctx.reply(
        '🏆 **Создание турнира**\n\n' +
        'Введите название турнира:',
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      this.logger.error(`Ошибка в handleCreateTournament: ${error}`);
      await ctx.reply('❌ Ошибка при создании турнира');
    }
  }

  async handleFindTournament(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;

      // Получаем доступные турниры
      const availableTournaments = await this.tournamentsService.findAll({
        status: 'DRAFT' // Только открытые для регистрации
      });
      
      let message = `🔍 **Доступные турниры**\n\n`;
      
      if (availableTournaments && availableTournaments.length > 0) {
        message += `Найдено ${availableTournaments.length} турниров:\n\n`;
        
        availableTournaments.slice(0, 5).forEach((tournament: any, index: number) => {
          message += `${index + 1}. **${tournament.title}**\n`;
          message += `   📅 ${new Date(tournament.startDate).toLocaleDateString('ru-RU')}\n`;
          message += `   👥 ${tournament.currentPlayers}/${tournament.maxPlayers}\n`;
          message += `   🏟️ ${tournament.locationName || 'Не указано'}\n`;
          message += `   💰 Бесплатно\n\n`; // Убираем entryFee
        });
        
        // Добавляем кнопки для вступления в турниры
        const buttons = [];
        availableTournaments.slice(0, 3).forEach((tournament: any) => {
          buttons.push([
            Markup.button.callback(
              `Присоединиться к "${tournament.title}"`, 
              `join_tournament_${tournament.id}`
            )
          ]);
        });
        
        buttons.push([Markup.button.callback('⬅️ Назад к турнирам', 'back_to_tournaments')]);
        
        await ctx.reply(message, { 
          parse_mode: 'Markdown',
          reply_markup: Markup.inlineKeyboard(buttons).reply_markup
        });
      } else {
        message += `В данный момент нет доступных турниров для регистрации.\n\n`;
        message += `Вы можете создать свой турнир с помощью кнопки "Создать турнир".`;
        
        await ctx.reply(message, { 
          parse_mode: 'Markdown',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('🏆 Создать турнир', 'create_tournament')],
            [Markup.button.callback('⬅️ Назад к турнирам', 'back_to_tournaments')]
          ]).reply_markup
        });
      }
    } catch (error) {
      this.logger.error(`Ошибка в handleFindTournament: ${error}`);
      await ctx.reply('❌ Ошибка при поиске турниров');
    }
  }

  async handleJoinTournament(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      await ctx.reply('🔍 Выберите турнир для участия из списка выше');
    } catch (error) {
      this.logger.error(`Ошибка в handleJoinTournament: ${error}`);
    }
  }

  async handleLeaveTournament(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      await ctx.reply('👋 Выход из турнира...');
    } catch (error) {
      this.logger.error(`Ошибка в handleLeaveTournament: ${error}`);
    }
  }

  async handleViewTournament(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      // Извлекаем ID турнира из callback_data
      const callbackQuery = ctx.callbackQuery as any;
      const match = callbackQuery?.data?.match(/^view_tournament_(\d+)$/);
      if (!match) return;
      
      const tournamentId = match[1];
      
      // Получаем детальную информацию о турнире
      const tournament = await this.tournamentsService.findById(tournamentId);
      
      if (!tournament) {
        await ctx.reply('❌ Турнир не найден');
        return;
      }
      
      const statusEmoji = tournament.status === 'ACTIVE' ? '🟢' : 
                        tournament.status === 'DRAFT' ? '🟡' : '🔴';
      
      let message = `${statusEmoji} **${tournament.title}**\n\n`;
      message += `📅 **Дата начала:** ${new Date(tournament.startDate).toLocaleDateString('ru-RU')}\n`;
      message += `👥 **Участники:** ${tournament.currentPlayers}/${tournament.maxPlayers}\n`;
      message += `🏟️ **Место:** ${tournament.locationName || 'Не указано'}\n`;
      message += `💰 **Взнос:** Бесплатно\n`; // Временно убираем entryFee
      message += `🏆 **Формат:** ${this.getTournamentTypeText(tournament.type)}\n\n`;
      
      if (tournament.description) {
        message += `📝 **Описание:**\n${tournament.description}\n\n`;
      }
      
      // Добавляем кнопки действий
      const buttons = [];
      if (tournament.status === 'DRAFT') {
        buttons.push([
          Markup.button.callback('✅ Присоединиться', `join_tournament_${tournament.id}`),
          Markup.button.callback('❌ Покинуть', `leave_tournament_${tournament.id}`)
        ]);
      }
      buttons.push([Markup.button.callback('⬅️ Назад', 'back_to_tournaments')]);
      
      await ctx.reply(message, { 
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard(buttons).reply_markup
      });
    } catch (error) {
      this.logger.error(`Ошибка в handleViewTournament: ${error}`);
      await ctx.reply('❌ Ошибка при загрузке информации о турнире');
    }
  }

  async handleJoinSpecificTournament(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      
      // Извлекаем ID турнира из callback_data
      const callbackQuery = ctx.callbackQuery as any;
      const match = callbackQuery?.data?.match(/^join_tournament_(\d+)$/);
      if (!match) return;
      
      const tournamentId = match[1];
      const userId = ctx.from.id.toString();
      const user = await this.usersService.findByTelegramId(userId);
      
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }
      
      try {
        await this.tournamentsService.joinTournament(tournamentId, user.id.toString());
        await ctx.reply('✅ Вы успешно присоединились к турниру!');
      } catch (error) {
        this.logger.error(`Ошибка при присоединении к турниру: ${error}`);
        await ctx.reply('❌ Не удалось присоединиться к турниру. Возможно, он уже заполнен или недоступен.');
      }
    } catch (error) {
      this.logger.error(`Ошибка в handleJoinSpecificTournament: ${error}`);
      await ctx.reply('❌ Ошибка при присоединении к турниру');
    }
  }

  async handleLeaveSpecificTournament(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      
      if (!ctx.from) return;
      
      // Извлекаем ID турнира из callback_data
      const callbackQuery = ctx.callbackQuery as any;
      const match = callbackQuery?.data?.match(/^leave_tournament_(\d+)$/);
      if (!match) return;
      
      const tournamentId = match[1];
      const userId = ctx.from.id.toString();
      const user = await this.usersService.findByTelegramId(userId);
      
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return;
      }
      
      try {
        await this.tournamentsService.leaveTournament(tournamentId, user.id.toString());
        await ctx.reply('👋 Вы покинули турнир');
      } catch (error) {
        this.logger.error(`Ошибка при выходе из турнира: ${error}`);
        await ctx.reply('❌ Не удалось покинуть турнир');
      }
    } catch (error) {
      this.logger.error(`Ошибка в handleLeaveSpecificTournament: ${error}`);
      await ctx.reply('❌ Ошибка при выходе из турнира');
    }
  }

  async handleBackToTournaments(ctx: Context) {
    try {
      await ctx.answerCbQuery();
      await this.handleTournaments(ctx);
    } catch (error) {
      this.logger.error(`Ошибка в handleBackToTournaments: ${error}`);
      await ctx.reply('❌ Ошибка при возврате к турнирам');
    }
  }

  async handleLocations(ctx: Context) {
    try {
      await ctx.reply('📍 Корты и локации');
    } catch (error) {
      this.logger.error(`Ошибка в handleLocations: ${error}`);
    }
  }

  async handleTournamentInput(ctx: Context, text: string, userId: string): Promise<boolean> {
    const userState = this.stateService.getUserState(userId);
    
    this.logger.log(`Обработка ввода для турнира: ${text}, текущий шаг: ${userState.step}`);
    
    switch (userState.step) {
      case ProfileStep.CREATING_TOURNAMENT:
        return await this.handleTournamentName(ctx, text, userId, userState);
      
      case ProfileStep.AWAITING_TOURNAMENT_NAME:
        return await this.handleTournamentName(ctx, text, userId, userState);
        
      case ProfileStep.AWAITING_TOURNAMENT_DESCRIPTION:
        return await this.handleTournamentDescription(ctx, text, userId, userState);
        
      case ProfileStep.AWAITING_TOURNAMENT_START_DATE:
        return await this.handleTournamentStartDate(ctx, text, userId, userState);
        
      case ProfileStep.AWAITING_TOURNAMENT_MAX_PARTICIPANTS:
        return await this.handleTournamentMaxParticipants(ctx, text, userId, userState);
    }
    
    return false;
  }

  private async handleTournamentName(ctx: Context, text: string, userId: string, userState: any): Promise<boolean> {
    // Сохраняем название турнира
    userState.data.tournamentName = text;
    userState.step = ProfileStep.AWAITING_TOURNAMENT_DESCRIPTION;
    this.stateService.setUserState(userId, userState);
    
    await ctx.reply('📝 Введите описание турнира (или отправьте "пропустить"):');
    return true;
  }

  private async handleTournamentDescription(ctx: Context, text: string, userId: string, userState: any): Promise<boolean> {
    // Сохраняем описание турнира
    if (text.toLowerCase() !== 'пропустить') {
      userState.data.tournamentDescription = text;
    }
    userState.step = ProfileStep.AWAITING_TOURNAMENT_START_DATE;
    this.stateService.setUserState(userId, userState);
    
    await ctx.reply('📅 Введите дату начала турнира (в формате ДД.ММ.ГГГГ):');
    return true;
  }

  private async handleTournamentStartDate(ctx: Context, text: string, userId: string, userState: any): Promise<boolean> {
    // Проверяем формат даты
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = text.match(dateRegex);
    
    if (!match) {
      await ctx.reply('❌ Неверный формат даты. Используйте формат ДД.ММ.ГГГГ (например, 15.12.2024)');
      return true;
    }
    
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    if (date < new Date()) {
      await ctx.reply('❌ Дата турнира не может быть в прошлом');
      return true;
    }
    
    userState.data.tournamentStartDate = date.toISOString();
    userState.step = ProfileStep.AWAITING_TOURNAMENT_MAX_PARTICIPANTS;
    this.stateService.setUserState(userId, userState);
    
    await ctx.reply('👥 Введите максимальное количество участников (от 4 до 32):');
    return true;
  }

  private async handleTournamentMaxParticipants(ctx: Context, text: string, userId: string, userState: any): Promise<boolean> {
    const maxParticipants = parseInt(text);
    
    if (isNaN(maxParticipants) || maxParticipants < 4 || maxParticipants > 32) {
      await ctx.reply('❌ Количество участников должно быть от 4 до 32');
      return true;
    }
    
    userState.data.tournamentMaxParticipants = maxParticipants;
    
    // Создаем турнир
    try {
      const user = await this.usersService.findByTelegramId(userId);
      if (!user) {
        await ctx.reply('❌ Пользователь не найден');
        return true;
      }
      
      const startDate = new Date(userState.data.tournamentStartDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1); // Турнир длится один день по умолчанию
      
      const tournamentDto = {
        title: userState.data.tournamentName,
        description: userState.data.tournamentDescription || '',
        startDate: startDate,
        endDate: endDate,
        registrationDeadline: startDate,
        maxPlayers: maxParticipants,
        minPlayers: Math.max(4, Math.floor(maxParticipants / 2)),
        type: TournamentType.SINGLE_ELIMINATION, // По умолчанию
        isRanked: true,
        locationName: 'Не указано' // Можно будет добавить позже
      };
      
      const tournament = await this.tournamentsService.create(user.id.toString(), tournamentDto);
      
      await ctx.reply(
        `✅ **Турнир "${tournament.title}" создан!**\n\n` +
        `📅 Дата: ${new Date(tournament.startDate).toLocaleDateString('ru-RU')}\n` +
        `👥 Максимум участников: ${tournament.maxPlayers}\n\n` +
        `Турнир будет доступен для регистрации других игроков.`,
        { parse_mode: 'Markdown' }
      );
      
      // Сбрасываем состояние
      this.stateService.setUserState(userId, { step: ProfileStep.IDLE, data: {} });
      
    } catch (error) {
      this.logger.error(`Ошибка при создании турнира: ${error}`);
      await ctx.reply('❌ Ошибка при создании турнира. Попробуйте еще раз.');
    }
    
    return true;
  }

  private getTournamentTypeText(type: string): string {
    const types = {
      'SINGLE_ELIMINATION': 'На выбывание',
      'GROUPS_PLAYOFF': 'Групповой этап + плей-офф',
      'LEAGUE': 'Лига (каждый с каждым)',
      'BLITZ': 'Блиц-турнир'
    };
    
    return types[type as keyof typeof types] || 'Неизвестно';
  }
}