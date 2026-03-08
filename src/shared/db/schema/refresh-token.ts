import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const refresh_token_model = pgTable(
  'refresh_token_model',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    jti: text('jti').notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index('refresh_token_user_id_idx').on(table.userId),
    jtiUnique: uniqueIndex('refresh_token_jti_uq').on(table.jti),
  }),
);
