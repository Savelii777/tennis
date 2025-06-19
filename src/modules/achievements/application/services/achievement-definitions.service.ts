import { Injectable } from '@nestjs/common';
import { AchievementDefinition, AchievementCategory } from '../../domain/interfaces/achievement.interface';
import { AchievementCode } from '../../domain/enums/achievement-codes.enum';

@Injectable()
export class AchievementDefinitionsService {
  private readonly definitions: Map<AchievementCode, AchievementDefinition>;

  constructor() {
    this.definitions = new Map();
    this.initializeDefinitions();
  }

  private initializeDefinitions() {
    const definitions: AchievementDefinition[] = [
      // Активность
      {
        code: AchievementCode.FIRST_STEP,
        name: '👋 Первый шаг',
        description: 'Завершил регистрацию',
        icon: '👋',
        category: AchievementCategory.ACTIVITY,
        condition: 'Завершить регистрацию',
      },
      {
        code: AchievementCode.FIRST_COURT_APPEARANCE,
        name: '👟 Первое появление на корте',
        description: 'Сыграл 1 матч',
        icon: '👟',
        category: AchievementCategory.ACTIVITY,
        condition: 'Сыграть 1 матч',
      },
      {
        code: AchievementCode.RETURNED_TO_GAME,
        name: '🔄 Вернулся в игру',
        description: 'Вернулся после 30+ дней перерыва',
        icon: '🔄',
        category: AchievementCategory.ACTIVITY,
        condition: 'Вернуться после 30+ дней',
      },
      {
        code: AchievementCode.REGULAR_PLAYER,
        name: '🔟 Регулярный игрок',
        description: '10 матчей за месяц',
        icon: '🔟',
        category: AchievementCategory.ACTIVITY,
        condition: '10 матчей за месяц',
      },
      {
        code: AchievementCode.SEVEN_DAYS_STREAK,
        name: '📅 7 дней подряд',
        description: 'Заходил в приложение 7 дней подряд',
        icon: '📅',
        category: AchievementCategory.ACTIVITY,
        condition: '7 дней подряд в приложении',
      },

      // Матчи
      {
        code: AchievementCode.FIRST_MATCH,
        name: '🧱 Первый матч',
        description: 'Сыграл 1 матч',
        icon: '🧱',
        category: AchievementCategory.MATCHES,
        condition: 'Сыграть 1 матч',
      },
      {
        code: AchievementCode.WARMUP,
        name: '🔥 Разогрев',
        description: '5 матчей',
        icon: '🔥',
        category: AchievementCategory.MATCHES,
        condition: 'Сыграть 5 матчей',
      },
      {
        code: AchievementCode.IN_RHYTHM,
        name: '🚀 В ритме',
        description: '10 матчей',
        icon: '🚀',
        category: AchievementCategory.MATCHES,
        condition: 'Сыграть 10 матчей',
      },
      {
        code: AchievementCode.REAL_PLAYER,
        name: '🧠 Настоящий игрок',
        description: '50 матчей',
        icon: '🧠',
        category: AchievementCategory.MATCHES,
        condition: 'Сыграть 50 матчей',
      },
      {
        code: AchievementCode.COURT_LEGEND,
        name: '🐐 Легенда корта',
        description: '100+ матчей',
        icon: '🐐',
        category: AchievementCategory.MATCHES,
        condition: 'Сыграть 100 матчей',
      },

      // Победы
      {
        code: AchievementCode.FIRST_SUCCESS,
        name: '🎯 Первый успех',
        description: 'Победил в 1 матче',
        icon: '🎯',
        category: AchievementCategory.VICTORIES,
        condition: 'Одержать первую победу',
      },
      {
        code: AchievementCode.CONFIDENCE_GROWS,
        name: '🏃‍♂️ Уверенность растёт',
        description: 'Победил 5 раз',
        icon: '🏃‍♂️',
        category: AchievementCategory.VICTORIES,
        condition: 'Одержать 5 побед',
      },
      {
        code: AchievementCode.STABLE_WINNER,
        name: '💪 Стабильный победитель',
        description: 'Победил 15 матчей',
        icon: '💪',
        category: AchievementCategory.VICTORIES,
        condition: 'Одержать 15 побед',
      },
      {
        code: AchievementCode.DOMINATION,
        name: '🧨 Доминирование',
        description: 'Победил 3 раза подряд',
        icon: '🧨',
        category: AchievementCategory.VICTORIES,
        condition: 'Выиграть 3 матча подряд',
      },
      {
        code: AchievementCode.WINNING_STREAK,
        name: '🐉 Победная серия',
        description: 'Победил 5 раз подряд',
        icon: '🐉',
        category: AchievementCategory.VICTORIES,
        condition: 'Выиграть 5 матчей подряд',
      },

      // Турниры
      {
        code: AchievementCode.FIRST_TOURNAMENT,
        name: '🥳 Первый турнир',
        description: 'Участвовал в турнире',
        icon: '🥳',
        category: AchievementCategory.TOURNAMENTS,
        condition: 'Принять участие в турнире',
      },
      {
        code: AchievementCode.ON_PODIUM,
        name: '🥉 На пьедестале',
        description: 'Занял 3-е место',
        icon: '🥉',
        category: AchievementCategory.TOURNAMENTS,
        condition: 'Занять 3-е место в турнире',
      },
      {
        code: AchievementCode.FINALIST,
        name: '🥈 Финалист',
        description: 'Занял 2-е место',
        icon: '🥈',
        category: AchievementCategory.TOURNAMENTS,
        condition: 'Дойти до финала турнира',
      },
      {
        code: AchievementCode.CHAMPION,
        name: '🥇 Чемпион',
        description: 'Победил в турнире',
        icon: '🥇',
        category: AchievementCategory.TOURNAMENTS,
        condition: 'Выиграть турнир',
      },

      // Социальная активность
      {
        code: AchievementCode.INVITED_PLAYER,
        name: '🤝 Игрок по приглашению',
        description: 'Привёл друга по реф. ссылке',
        icon: '🤝',
        category: AchievementCategory.SOCIAL,
        condition: 'Пригласить друга',
      },
      {
        code: AchievementCode.THREE_FRIENDS,
        name: '🔗 Пригласил 3 друзей',
        description: '3 игрока по рефералке',
        icon: '🔗',
        category: AchievementCategory.SOCIAL,
        condition: 'Пригласить 3 друзей',
      },

      // Специальные
      {
        code: AchievementCode.DEFEATED_STRONG,
        name: '🔒 Победил сильного соперника',
        description: 'Победа над игроком с рейтингом выше на 25%',
        icon: '🔒',
        category: AchievementCategory.SPECIAL,
        condition: 'Победить сильного соперника',
        isSecret: true,
      },
      {
        code: AchievementCode.UNSTOPPABLE,
        name: '🦾 Неудержимый',
        description: 'Победил в 10 матчах подряд',
        icon: '🦾',
        category: AchievementCategory.SPECIAL,
        condition: 'Выиграть 10 матчей подряд',
        isSecret: true,
      },
    ];

    definitions.forEach(def => {
      this.definitions.set(def.code, def);
    });
  }

  getDefinition(code: AchievementCode): AchievementDefinition | undefined {
    return this.definitions.get(code);
  }

  getAllDefinitions(): AchievementDefinition[] {
    return Array.from(this.definitions.values());
  }

  getDefinitionsByCategory(category: AchievementCategory): AchievementDefinition[] {
    return Array.from(this.definitions.values())
      .filter(def => def.category === category);
  }
}