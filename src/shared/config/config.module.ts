import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

@Global()
@Module({
  providers: [
    {
      // .env 파일 주입
      provide: 'ENV_LOADER',
      useFactory: () => {
        const nodeEnv = process.env.NODE_ENV ?? 'development';

        const envPaths = [`.env.${nodeEnv}`, `.env`];

        for (const p of envPaths) {
          dotenv.config({
            path: path.resolve(process.cwd(), p),
            override: false,
          });
        }

        return true;
      },
    },
    ConfigService,
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
