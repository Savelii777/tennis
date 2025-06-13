import { Markup } from 'telegraf';

export const mainKeyboard = Markup.keyboard([
  ['👤 Профиль', '🎾 Играть'],
  ['🏆 Турниры', '📝 Записать результат'],
  ['📱 Stories', '🤖 AI-Coach', '📦 Кейсы']
]).resize();  // Удалите вызов .extra()