import { DRIZZLE_DB } from '@/shared/db/db.token';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/shared/db/schema';
import { RefreshTokenEntity } from "./token.entity";

@Injectable()
export class AuthRepository {
  constructor(
    @Inject(DRIZZLE_DB)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async save(body: RefreshTokenEntity) {}
}
