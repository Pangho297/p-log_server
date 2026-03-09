import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DRIZZLE_DB, PG_POOL } from './db.token';
import * as schema from './schema';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: () => {
        const url = process.env.DATABASE_URL;
        console.log('url: ', url);

        if (!url) {
          throw new Error('환경변수 DATABASE_URL이 설정되지 않았습니다.');
        }

        return new Pool({ connectionString: url });
      },
    },
    {
      provide: DRIZZLE_DB,
      inject: [PG_POOL],
      useFactory: (pool: Pool) => drizzle(pool, { schema }),
    },
  ],
  exports: [DRIZZLE_DB, PG_POOL],
})
export class DatabaseModule {}
