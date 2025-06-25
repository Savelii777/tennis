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
    private readonly stateService: StateService
  ) {}

  async onModuleInit() {
    this.logger.log('Инициализация Telegram бота...');

    // Регистрация обработчиков
    this.profileHandler.register(this.bot);
    this.matchesHandler.register(this.bot);
    this.requestsHandler.register(this.bot);
    this.tournamentsHandler.register(this.bot);
    this.trainingHandler.register(this.bot);
    this.storiesHandler.register(this.bot);
    this.casesHandler.register(this.bot);
    this.aiCoachHandler.register(this.bot);
    this.commonHandler.register(this.bot);

    this.logger.log('Бот успешно инициализирован');
  }

  // Основные точки входа
  @Start()
  async handleStart(ctx: Context) {
    return this.commonHandler.handleStart(ctx);
  }

  @Hears('👤 Профиль')
  async handleProfile(ctx: Context) {
    return this.profileHandler.handleProfile(ctx);
  }

  @Hears('🎾 Играть')
  async handlePlay(ctx: Context) {
    return this.requestsHandler.handlePlay(ctx);
  }

  @Hears('🏆 Турниры')
  async handleTournaments(ctx: Context) {
    return this.tournamentsHandler.handleTournaments(ctx);
  }

  @Hears('🏃‍♂️ Тренировки')
  async handleTrainings(ctx: Context) {
    return this.trainingHandler.handleTrainings(ctx);
  }

  @Hears('📱 Stories')
  async handleStories(ctx: Context) {
    return this.storiesHandler.handleStories(ctx);
  }

  @Hears('🎁 Кейсы')
  async handleCases(ctx: Context) {
    return this.casesHandler.handleCases(ctx);
  }

  @Hears('📝 Записать результат')
  async handleRecordMatch(ctx: Context) {
    return this.matchesHandler.handleRecordMatch(ctx);
  }

  @Hears('🔗 Пригласить друга')
  async handleInviteButton(ctx: Context) {
    return this.commonHandler.handleInviteButton(ctx);
  }

  @Hears('🤖 AI-Coach')
  async handleAICoach(ctx: Context) {
    return this.aiCoachHandler.handleAICoach(ctx);
  }

  @Hears('📍 Корты')
  async handleLocations(ctx: Context) {
    return this.tournamentsHandler.handleLocations(ctx);
  }

  @Hears('⚙️ Настройки')
  async handleSettings(ctx: Context) {
    return this.profileHandler.handleSettings(ctx);
  }

  // Обработка текстовых сообщений
  @On('text')
  async handleText(ctx: Context) {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;
    
    const userId = ctx.from.id.toString();
    const text = ctx.message.text;

    // Проверка состояния пользователя
    const userState = this.stateService.getUserState(userId);
    this.logger.log(`Получено сообщение: ${text}, состояние: ${userState.step}`);

    // Перенаправляем в соответствующий обработчик в зависимости от состояния
    try {
      // Профиль
      if (await this.profileHandler.handleProfileInput(ctx, text, userId)) {
        return;
      }

      // Матчи
      if (await this.matchesHandler.handleMatchInput(ctx, text, userId)) {
        return;
      }

      // Заявки
      if (await this.requestsHandler.handleRequestInput(ctx, text, userId)) {
        return;
      }

      // Турниры
      if (await this.tournamentsHandler.handleTournamentInput(ctx, text, userId)) {
        return;
      }

      // Тренировки
      if (await this.trainingHandler.handleTrainingInput(ctx, text, userId)) {
        return;
      }

      // Stories
      if (await this.storiesHandler.handleStoryInput(ctx, text, userId)) {
        return;
      }

      // AI Coach
      if (await this.aiCoachHandler.handleAIInput(ctx, text, userId)) {
        return;
      }

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
    } catch (error) {
      this.logger.error(`Ошибка при обработке текста: ${error}`);
      await ctx.reply('❌ Произошла ошибка при обработке вашего сообщения');
    }
  }

  // Обработка фото для Stories
  @On('photo')
  async handlePhoto(ctx: Context) {
    return this.storiesHandler.handlePhoto(ctx);
  }

  // Обработка видео для Stories
  @On('video')
  async handleVideo(ctx: Context) {
    return this.storiesHandler.handleVideo(ctx);
  }

  // Обработка команд для отладки
  @Command('debug')
  async handleDebug(ctx: Context) {
    if (!ctx.from) return;
    
    const userId = ctx.from.id.toString();
    const userState = this.stateService.getUserState(userId);

    await ctx.reply(
      `🔍 **Отладочная информация**\n\n` +
      `User ID: ${userId}\n` +
      `State: ${userState.step}\n` +
      `Data: ${JSON.stringify(userState.data, null, 2)}`,
      { parse_mode: 'Markdown' }
    );
  }
}