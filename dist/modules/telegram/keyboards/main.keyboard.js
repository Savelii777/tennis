"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainKeyboard = void 0;
const telegraf_1 = require("telegraf");
exports.mainKeyboard = telegraf_1.Markup.keyboard([
    ['👤 Профиль', '🎾 Играть'],
    ['🏆 Турниры', '📝 Записать результат'],
    ['📱 Stories', '🤖 AI-Coach', '📦 Кейсы']
]).resize();
