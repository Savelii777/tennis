// src/modules/telegram/bot.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { BotContext } from './interfaces/context.interface';
import { AuthService } from '../auth/application/services/auth.service';
import { UsersService } from '../users/application/services/users.service';
import { RequestsService } from '../requests/application/services/requests.service';
import { TournamentsService } from '../tournaments/application/services/tournaments.service';
import { TrainingsService } from '../trainings/application/services/trainings.service';
import { Markup } from 'telegraf';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);
  private mainKeyboard: any;

  constructor(
    @InjectBot() private readonly bot: Telegraf<BotContext>,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly requestsService: RequestsService,
    private readonly tournamentsService: TournamentsService,
    private readonly trainingsService: TrainingsService,
  ) {
    this.mainKeyboard = Markup.keyboard([
      ['👤 Профиль', '🎾 Играть'],
      ['🏆 Турниры', '📝 Записать результат'],
      ['📱 Stories', '🤖 AI-Coach', '📦 Кейсы']
    ]).resize();
    
    this.setupBot();
  }

  private setupBot() {
    // Регистрируем обработчики команд
    this.bot.command('start', this.handleStart.bind(this));
    this.bot.command('profile', this.handleProfile.bind(this));
    this.bot.command('games', this.handleGames.bind(this));
    this.bot.command('results', this.handleResults.bind(this));
    this.bot.command('tournaments', this.handleTournaments.bind(this));
    this.bot.command('training', this.handleTraining.bind(this));
    this.bot.command('stories', this.handleStories.bind(this));
    this.bot.command('aicoach', this.handleAiCoach.bind(this));
    this.bot.command('cases', this.handleCases.bind(this));

    // Обработчики текстовых сообщений по кнопкам
    this.bot.hears('👤 Профиль', this.handleProfile.bind(this));
    this.bot.hears('🎾 Играть', this.handlePlay.bind(this));
    this.bot.hears('🏆 Турниры', this.handleTournaments.bind(this));
    this.bot.hears('📝 Записать результат', this.handleResults.bind(this));
    this.bot.hears('📱 Stories', this.handleStories.bind(this));
    this.bot.hears('🤖 AI-Coach', this.handleAiCoach.bind(this));
    this.bot.hears('📦 Кейсы', this.handleCases.bind(this));

    this.logger.log('Telegram bot setup completed');
  }

  // Обработчик для команды start
  async handleStart(ctx: BotContext) {
    try {
      if (!ctx.message || !('from' in ctx.message)) return;
      const from = ctx.message.from;
      if (!from) return;
      
      // Безопасно доступаемся к данным пользователя
      try {
        // Пытаемся найти пользователя
        const user = await this.usersService.findByTelegramId(from.id.toString());
        
        if (!user) {
          // Регистрируем нового пользователя
          const userData = {
            telegram_id: from.id.toString(),
            username: from.username || `user_${from.id}`,
            first_name: from.first_name,
            last_name: from.last_name || undefined,
            photo_url: ''
          };
          
          await this.usersService.create(userData);
          
          await ctx.reply(
            `Добро пожаловать, ${from.first_name}! Вы успешно зарегистрированы.
Теперь заполним ваш профиль, чтобы подбирать вам подходящие матчи.`,
            { reply_markup: this.mainKeyboard }
          );
          
          // Запускаем сцену заполнения профиля
          if (ctx.scene) {
            await ctx.scene.enter('profile-setup');
          }
        } else {
          // Если пользователь уже зарегистрирован
          await ctx.reply(
            `С возвращением, ${user.first_name || from.first_name}!
Что хотите сделать сегодня?`,
            { reply_markup: this.mainKeyboard }
          );
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error in handleStart: ${errorMsg}`);
        await ctx.reply('Произошла ошибка при запуске бота. Пожалуйста, попробуйте позже.');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`General error in handleStart: ${errorMsg}`);
      await ctx.reply('Произошла ошибка.');
    }
  }

  // Обработчик для профиля
  async handleProfile(ctx: BotContext) {
    try {
      if (!ctx.message || !('from' in ctx.message)) return;
      const from = ctx.message.from;
      if (!from) return;
      
      const user = await this.usersService.findByTelegramId(from.id.toString());
      
      if (!user) {
        return ctx.reply('Пожалуйста, сначала зарегистрируйтесь с помощью команды /start');
      }
      
      // Получаем статистику профиля
      const stats = await this.usersService.getProfileStatistics(user.id.toString());
      const profileStatus = await this.usersService.getProfileCompletionStatus(user.id.toString());
      
      // Формируем сообщение с информацией о профиле
      const message = `
👤 *Ваш профиль*
Имя: ${user.first_name} ${user.last_name || ''}
Рейтинг: ${stats.ratingPoints} очков (NTRP: ${user.profile?.ntrp_rating || 'Не определен'})

📊 *Статистика*
Матчей сыграно: ${stats.matchesPlayed}
Побед: ${stats.matchWins}
Поражений: ${stats.matchLosses}
Процент побед: ${stats.winRate || 0}%

🏆 *Турниры*
Участие: ${stats.tournamentsPlayed}
Побед: ${stats.tournamentsWon}

${!profileStatus.profileComplete ? '⚠️ Ваш профиль не полностью заполнен. Нажмите кнопку "Заполнить профиль"' : ''}`;
      
      // Создаем клавиатуру для профиля
      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Заполнить профиль", callback_data: "profile_setup" }],
          [{ text: "📈 История рейтинга", callback_data: "rating_history" }],
          [{ text: "📱 Мои Stories", callback_data: "my_stories" }],
          [{ text: "🎾 Мои матчи", callback_data: "my_matches" }],
        ]
      };
      
      await ctx.reply(message, { 
        parse_mode: 'Markdown', 
        reply_markup: keyboard 
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in handleProfile: ${errorMsg}`);
      await ctx.reply('Произошла ошибка при загрузке профиля. Пожалуйста, попробуйте позже.');
    }
  }

  // Обработчик для игр
  async handleGames(ctx: BotContext) {
    try {
      await ctx.reply('Поиск активных игр...');
      // Реализация будет добавлена позже
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in handleGames: ${errorMsg}`);
      await ctx.reply('Произошла ошибка при поиске игр.');
    }
  }

  // Обработчик для кнопки "Играть"
  async handlePlay(ctx: BotContext) {
    try {
      const keyboard = {
        inline_keyboard: [
          [{ text: "🎾 Создать матч", callback_data: "create_match" }],
          [{ text: "📅 Создать тренировку", callback_data: "create_training" }],
          [{ text: "🏆 Организовать турнир", callback_data: "create_tournament" }]
        ]
      };
      
      await ctx.reply('Выберите тип активности:', { reply_markup: keyboard });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in handlePlay: ${errorMsg}`);
      await ctx.reply('Произошла ошибка.');
    }
  }

  // Обработчик для результатов
  async handleResults(ctx: BotContext) {
    try {
      await ctx.reply('Запись результатов матча...');
      // Реализация будет добавлена позже
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in handleResults: ${errorMsg}`);
      await ctx.reply('Произошла ошибка при записи результатов.');
    }
  }
  
  // Обработчик для турниров
  async handleTournaments(ctx: BotContext) {
    try {
      await ctx.reply('Поиск активных турниров...');
      // Реализация будет добавлена позже
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in handleTournaments: ${errorMsg}`);
      await ctx.reply('Произошла ошибка при поиске турниров.');
    }
  }
  
  // Обработчик для тренировок
  async handleTraining(ctx: BotContext) {
    try {
      await ctx.reply('Поиск тренировок...');
      // Реализация будет добавлена позже
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in handleTraining: ${errorMsg}`);
      await ctx.reply('Произошла ошибка при поиске тренировок.');
    }
  }
  
  // Обработчик для stories
  async handleStories(ctx: BotContext) {
    try {
      await ctx.reply('Просмотр stories...');
      // Реализация будет добавлена позже
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in handleStories: ${errorMsg}`);
      await ctx.reply('Произошла ошибка при загрузке stories.');
    }
  }
  
  // Обработчик для AI-Coach
  async handleAiCoach(ctx: BotContext) {
    try {
      await ctx.reply('AI-Coach готов помочь вам! Расскажите, что вас интересует?');
      // Реализация будет добавлена позже
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in handleAiCoach: ${errorMsg}`);
      await ctx.reply('Произошла ошибка при запуске AI-Coach.');
    }
  }
  
  // Обработчик для кейсов
  async handleCases(ctx: BotContext) {
    try {
      await ctx.reply('Доступные кейсы...');
      // Реализация будет добавлена позже
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in handleCases: ${errorMsg}`);
      await ctx.reply('Произошла ошибка при загрузке кейсов.');
    }
  }
}