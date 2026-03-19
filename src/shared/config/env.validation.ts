import { envSchema } from './utils';

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(`환경변수 검증 실패: ${parsed.error.message}`);
  }

  return parsed.data;
}
