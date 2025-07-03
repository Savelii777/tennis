import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodString>;
    DATABASE_URL: z.ZodString;
    JWT_SECRET: z.ZodString;
    TELEGRAM_BOT_TOKEN: z.ZodString;
    TELEGRAM_API_URL: z.ZodString;
}, "strip", z.ZodTypeAny, {
    TELEGRAM_BOT_TOKEN: string;
    JWT_SECRET: string;
    PORT: string;
    DATABASE_URL: string;
    TELEGRAM_API_URL: string;
}, {
    TELEGRAM_BOT_TOKEN: string;
    JWT_SECRET: string;
    DATABASE_URL: string;
    TELEGRAM_API_URL: string;
    PORT?: string | undefined;
}>;
export type EnvSchema = z.infer<typeof envSchema>;
