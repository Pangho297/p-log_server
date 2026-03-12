import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as path from 'path';

// drizzle-kit은 Nest의 ConfigModule을 거치지 않고 별도로 실행되므로,
// NODE_ENV에 맞는 .env 파일을 여기서 직접 로드한다.
// 우선순위: .env < .env.{NODE_ENV} (파일 값이 셸 환경변수보다 우선)
const nodeEnv = process.env.NODE_ENV ?? 'development';
const envPaths = [`.env`, `.env.${nodeEnv}`];
for (const p of envPaths) {
  dotenv.config({
    path: path.resolve(process.cwd(), p),
    override: true,
  });
}

export default defineConfig({
  out: './drizzle',
  schema: './src/shared/db/schema/*.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
