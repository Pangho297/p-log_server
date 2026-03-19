import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DRIZZLE_DB, PG_POOL } from './db.token';
import * as schema from './schema';
import { AppConfigService } from '../config/app-config.service';
import { AppConfigModule } from '../config/config.module';

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [
    {
      provide: PG_POOL,
      inject: [AppConfigService],
      useFactory: (appConfig: AppConfigService) => {
        return new Pool({
          connectionString: appConfig.dbUrl,
          // TODO: 필요 시 ssl, max 값 추가
        });
      },
    },
    {
      provide: DRIZZLE_DB,
      inject: [PG_POOL],
      useFactory: (pool: Pool): NodePgDatabase<typeof schema> =>
        drizzle(pool, { schema }),
    },
  ],
  exports: [DRIZZLE_DB, PG_POOL],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onModuleDestroy() {
    await this.pool.end();
  }
}
