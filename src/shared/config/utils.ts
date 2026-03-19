import { z } from 'zod';

export const envSchema = z
  .object({
    // COMMON
    SERVER_ENV: z.enum(['development', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),

    // DB
    DATABASE_URL: z.string().min(1),

    // AUTH
    DEV_JWT_ACCESS_SECRET: z.string().optional(),
    JWT_ACCESS_SECRET: z.string().optional(),
    DEV_JWT_REFRESH_SECRET: z.string().optional(),
    JWT_REFRESH_SECRET: z.string().optional(),
  })
  .refine(
    (env) => env.SERVER_ENV === 'development' || !!env.DEV_JWT_ACCESS_SECRET,
    {
      path: ['DEV_JWT_ACCESS_SECRET'],
      error: 'development 환경에서는 DEV_JWT_ACCESS_SECRET이 필요합니다.',
    },
  )
  .refine((env) => env.SERVER_ENV === 'production' || !!env.JWT_ACCESS_SECRET, {
    path: ['JWT_ACCESS_SECRET'],
    error: 'production 환경에서는 JWT_ACCESS_SECRET이 필요합니다.',
  })
  .refine(
    (env) => env.SERVER_ENV === 'development' || !!env.DEV_JWT_REFRESH_SECRET,
    {
      path: ['DEV_JWT_REFRESH_SECRET'],
      error: 'development 환경에서는 DEV_JWT_REFRESH_SECRET이 필요합니다.',
    },
  )
  .refine(
    (env) => env.SERVER_ENV === 'production' || !!env.JWT_REFRESH_SECRET,
    {
      path: ['JWT_REFRESH_SECRET'],
      error: 'production 환경에서는 JWT_REFRESH_SECRET이 필요합니다.',
    },
  );
