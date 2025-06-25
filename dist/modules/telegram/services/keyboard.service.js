"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardService = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
let KeyboardService = class KeyboardService {
    getMainKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['👤 Профиль', '🎾 Играть'],
            ['🏆 Турниры', '🏃‍♂️ Тренировки'],
            ['📱 Stories', '🎁 Кейсы'],
            ['📝 Записать результат', '🔗 Пригласить друга'],
            ['🤖 AI-Coach', '📍 Корты'],
            ['⚙️ Настройки']
        ]).resize();
    }
    getLevelButtons() {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('🟢 Начинающий', 'req_level_BEGINNER'),
                telegraf_1.Markup.button.callback('🔵 Любитель', 'req_level_AMATEUR')
            ],
            [
                telegraf_1.Markup.button.callback('🟡 Уверенный', 'req_level_CONFIDENT'),
                telegraf_1.Markup.button.callback('🟠 Турнирный', 'req_level_TOURNAMENT')
            ],
            [telegraf_1.Markup.button.callback('🔴 Полупрофессионал', 'req_level_SEMI_PRO')],
            [telegraf_1.Markup.button.callback('👥 Любой уровень', 'req_level_ANY')]
        ]);
    }
    getProfileKeyboard() {
        return telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('📊 Подробная статистика', 'detailed_stats')],
            [
                telegraf_1.Markup.button.callback('🏆 Достижения', 'user_achievements'),
                telegraf_1.Markup.button.callback('🔄 Обновить профиль', 'setup_profile')
            ],
            [
                telegraf_1.Markup.button.callback('🎯 Цели', 'user_goals'),
                telegraf_1.Markup.button.callback('📜 История', 'match_history')
            ],
        ]);
    }
};
KeyboardService = __decorate([
    (0, common_1.Injectable)()
], KeyboardService);
exports.KeyboardService = KeyboardService;
