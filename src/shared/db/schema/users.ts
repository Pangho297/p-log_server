import { varchar, timestamp, serial, pgTable } from 'drizzle-orm/pg-core';

/** 예시용 유저 모델 */
export const user_model = pgTable('user_model', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
