"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementDefinitionsService = void 0;
const common_1 = require("@nestjs/common");
const achievement_interface_1 = require("../../domain/interfaces/achievement.interface");
const achievement_codes_enum_1 = require("../../domain/enums/achievement-codes.enum");
let AchievementDefinitionsService = class AchievementDefinitionsService {
    constructor() {
        this.definitions = new Map();
        this.initializeDefinitions();
    }
    initializeDefinitions() {
        const definitions = [
            // Активность
            {
                code: achievement_codes_enum_1.AchievementCode.FIRST_STEP,
                name: '👋 Первый шаг',
                description: 'Завершил регистрацию',
                icon: '👋',
                category: achievement_interface_1.AchievementCategory.ACTIVITY,
                condition: 'Завершить регистрацию',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.FIRST_COURT_APPEARANCE,
                name: '👟 Первое появление на корте',
                description: 'Сыграл 1 матч',
                icon: '👟',
                category: achievement_interface_1.AchievementCategory.ACTIVITY,
                condition: 'Сыграть 1 матч',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.RETURNED_TO_GAME,
                name: '🔄 Вернулся в игру',
                description: 'Вернулся после 30+ дней перерыва',
                icon: '🔄',
                category: achievement_interface_1.AchievementCategory.ACTIVITY,
                condition: 'Вернуться после 30+ дней',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.REGULAR_PLAYER,
                name: '🔟 Регулярный игрок',
                description: '10 матчей за месяц',
                icon: '🔟',
                category: achievement_interface_1.AchievementCategory.ACTIVITY,
                condition: '10 матчей за месяц',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.SEVEN_DAYS_STREAK,
                name: '📅 7 дней подряд',
                description: 'Заходил в приложение 7 дней подряд',
                icon: '📅',
                category: achievement_interface_1.AchievementCategory.ACTIVITY,
                condition: '7 дней подряд в приложении',
            },
            // Матчи
            {
                code: achievement_codes_enum_1.AchievementCode.FIRST_MATCH,
                name: '🧱 Первый матч',
                description: 'Сыграл 1 матч',
                icon: '🧱',
                category: achievement_interface_1.AchievementCategory.MATCHES,
                condition: 'Сыграть 1 матч',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.WARMUP,
                name: '🔥 Разогрев',
                description: '5 матчей',
                icon: '🔥',
                category: achievement_interface_1.AchievementCategory.MATCHES,
                condition: 'Сыграть 5 матчей',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.IN_RHYTHM,
                name: '🚀 В ритме',
                description: '10 матчей',
                icon: '🚀',
                category: achievement_interface_1.AchievementCategory.MATCHES,
                condition: 'Сыграть 10 матчей',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.REAL_PLAYER,
                name: '🧠 Настоящий игрок',
                description: '50 матчей',
                icon: '🧠',
                category: achievement_interface_1.AchievementCategory.MATCHES,
                condition: 'Сыграть 50 матчей',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.COURT_LEGEND,
                name: '🐐 Легенда корта',
                description: '100+ матчей',
                icon: '🐐',
                category: achievement_interface_1.AchievementCategory.MATCHES,
                condition: 'Сыграть 100 матчей',
            },
            // Победы
            {
                code: achievement_codes_enum_1.AchievementCode.FIRST_SUCCESS,
                name: '🎯 Первый успех',
                description: 'Победил в 1 матче',
                icon: '🎯',
                category: achievement_interface_1.AchievementCategory.VICTORIES,
                condition: 'Одержать первую победу',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.CONFIDENCE_GROWS,
                name: '🏃‍♂️ Уверенность растёт',
                description: 'Победил 5 раз',
                icon: '🏃‍♂️',
                category: achievement_interface_1.AchievementCategory.VICTORIES,
                condition: 'Одержать 5 побед',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.STABLE_WINNER,
                name: '💪 Стабильный победитель',
                description: 'Победил 15 матчей',
                icon: '💪',
                category: achievement_interface_1.AchievementCategory.VICTORIES,
                condition: 'Одержать 15 побед',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.DOMINATION,
                name: '🧨 Доминирование',
                description: 'Победил 3 раза подряд',
                icon: '🧨',
                category: achievement_interface_1.AchievementCategory.VICTORIES,
                condition: 'Выиграть 3 матча подряд',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.WINNING_STREAK,
                name: '🐉 Победная серия',
                description: 'Победил 5 раз подряд',
                icon: '🐉',
                category: achievement_interface_1.AchievementCategory.VICTORIES,
                condition: 'Выиграть 5 матчей подряд',
            },
            // Турниры
            {
                code: achievement_codes_enum_1.AchievementCode.FIRST_TOURNAMENT,
                name: '🥳 Первый турнир',
                description: 'Участвовал в турнире',
                icon: '🥳',
                category: achievement_interface_1.AchievementCategory.TOURNAMENTS,
                condition: 'Принять участие в турнире',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.ON_PODIUM,
                name: '🥉 На пьедестале',
                description: 'Занял 3-е место',
                icon: '🥉',
                category: achievement_interface_1.AchievementCategory.TOURNAMENTS,
                condition: 'Занять 3-е место в турнире',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.FINALIST,
                name: '🥈 Финалист',
                description: 'Занял 2-е место',
                icon: '🥈',
                category: achievement_interface_1.AchievementCategory.TOURNAMENTS,
                condition: 'Дойти до финала турнира',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.CHAMPION,
                name: '🥇 Чемпион',
                description: 'Победил в турнире',
                icon: '🥇',
                category: achievement_interface_1.AchievementCategory.TOURNAMENTS,
                condition: 'Выиграть турнир',
            },
            // Социальная активность
            {
                code: achievement_codes_enum_1.AchievementCode.INVITED_PLAYER,
                name: '🤝 Игрок по приглашению',
                description: 'Привёл друга по реф. ссылке',
                icon: '🤝',
                category: achievement_interface_1.AchievementCategory.SOCIAL,
                condition: 'Пригласить друга',
            },
            {
                code: achievement_codes_enum_1.AchievementCode.THREE_FRIENDS,
                name: '🔗 Пригласил 3 друзей',
                description: '3 игрока по рефералке',
                icon: '🔗',
                category: achievement_interface_1.AchievementCategory.SOCIAL,
                condition: 'Пригласить 3 друзей',
            },
            // Специальные
            {
                code: achievement_codes_enum_1.AchievementCode.DEFEATED_STRONG,
                name: '🔒 Победил сильного соперника',
                description: 'Победа над игроком с рейтингом выше на 25%',
                icon: '🔒',
                category: achievement_interface_1.AchievementCategory.SPECIAL,
                condition: 'Победить сильного соперника',
                isSecret: true,
            },
            {
                code: achievement_codes_enum_1.AchievementCode.UNSTOPPABLE,
                name: '🦾 Неудержимый',
                description: 'Победил в 10 матчах подряд',
                icon: '🦾',
                category: achievement_interface_1.AchievementCategory.SPECIAL,
                condition: 'Выиграть 10 матчей подряд',
                isSecret: true,
            },
        ];
        definitions.forEach(def => {
            this.definitions.set(def.code, def);
        });
    }
    getDefinition(code) {
        return this.definitions.get(code);
    }
    getAllDefinitions() {
        return Array.from(this.definitions.values());
    }
    getDefinitionsByCategory(category) {
        return Array.from(this.definitions.values())
            .filter(def => def.category === category);
    }
};
exports.AchievementDefinitionsService = AchievementDefinitionsService;
exports.AchievementDefinitionsService = AchievementDefinitionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AchievementDefinitionsService);
