import { varchar, timestamp, pgTable, uuid } from 'drizzle-orm/pg-core';

/** 예시용 유저 모델 */
export const user_model = pgTable('user_model', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
