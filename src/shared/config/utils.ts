import { z } from 'zod';

export const envSchema = z.object({
  // COMMON
  SERVER_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  // DB
  DATABASE_URL: z.string().min(1),

  // AUTH
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),

  // CLOUDFLARE
  CF_ACCOUNT_ID: z.string().min(1),
  CF_IMAGES_TOKEN: z.string().min(1),
  CF_ACCOUNT_HASH: z.string().min(1),
});
