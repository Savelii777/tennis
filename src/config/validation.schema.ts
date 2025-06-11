import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_API_URL: z.string().url(),
});

export type EnvSchema = z.infer<typeof envSchema>;