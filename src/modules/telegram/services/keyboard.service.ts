import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';

@Injectable()
export class KeyboardService {
  getMainKeyboard() {
    return Markup.keyboard([
      ['👤 Профиль', '🎾 Играть'],
      ['🏆 Турниры', '🏃‍♂️ Тренировки'],
      ['📱 Stories', '🎁 Кейсы'],
      ['📝 Записать результат', '🔗 Пригласить друга'],
      ['🤖 AI-Coach', '📍 Корты'],
      ['⚙️ Настройки']
    ]).resize();
  }
  
  getLevelButtons() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('🟢 Начинающий', 'req_level_BEGINNER'),
        Markup.button.callback('🔵 Любитель', 'req_level_AMATEUR')
      ],
      [
        Markup.button.callback('🟡 Уверенный', 'req_level_CONFIDENT'),
        Markup.button.callback('🟠 Турнирный', 'req_level_TOURNAMENT')
      ],
      [Markup.button.callback('🔴 Полупрофессионал', 'req_level_SEMI_PRO')],
      [Markup.button.callback('👥 Любой уровень', 'req_level_ANY')]
    ]);
  }
  
  getProfileKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('📊 Подробная статистика', 'detailed_stats')],
      [
        Markup.button.callback('🏆 Достижения', 'user_achievements'),
        Markup.button.callback('🔄 Обновить профиль', 'setup_profile')
      ],
      [
        Markup.button.callback('🎯 Цели', 'user_goals'),
        Markup.button.callback('📜 История', 'match_history')
      ],
    ]);
  }
  
  // Другие методы для создания клавиатур
}