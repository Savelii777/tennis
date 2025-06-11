"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000'),
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(10),
    TELEGRAM_BOT_TOKEN: zod_1.z.string(),
    TELEGRAM_API_URL: zod_1.z.string().url(),
});
