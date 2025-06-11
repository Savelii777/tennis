"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('config', () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USERNAME || 'user',
        password: process.env.DATABASE_PASSWORD || 'password',
        name: process.env.DATABASE_NAME || 'tennis_app',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'defaultSecret',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || 'your-telegram-bot-token',
    },
}));
