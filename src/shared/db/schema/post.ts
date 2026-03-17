import { sql } from 'drizzle-orm';
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { user_model } from './users';

export const post_model = pgTable(
  'post_model',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user_model.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    tags: text('tags')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('post_user_id_idx').on(table.userId),
    uniqueIndex('post_slug_uq')
      .on(table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
    index('post_created_at_idx').on(table.createdAt),
  ],
);

/** 자동 저장을 구현하고자 한다면 아래 코드를 사용
 * - 확장을 위해 미리 작성해둠
 */

// import { sql } from 'drizzle-orm';
// import {
//   check,
//   index,
//   pgEnum,
//   pgTable,
//   text,
//   timestamp,
//   uniqueIndex,
//   uuid,
// } from 'drizzle-orm/pg-core';

// import { user_model } from './users';

// export const postStatusEnum = pgEnum('post_status', ['draft', 'published']);

// export const post_model = pgTable(
//   'post_model',
//   {
//     id: uuid('id').defaultRandom().primaryKey(),
//     userId: uuid('user_id')
//       .notNull()
//       .references(() => user_model.id, { onDelete: 'cascade' }),
//     status: postStatusEnum('status').notNull().default('draft'),
//     slug: text('slug'),
//     title: text('title'),
//     content: text('content'),
//     tags: text('tags')
//       .array()
//       .notNull()
//       .default(sql`'{}'::text[]`),
//     createdAt: timestamp('created_at', { withTimezone: true })
//       .notNull()
//       .defaultNow(),
//     updatedAt: timestamp('updated_at', { withTimezone: true })
//       .notNull()
//       .defaultNow(),
//     deletedAt: timestamp('deleted_at', { withTimezone: true }),
//   },
//   (table) => [
//     index('post_user_id_idx').on(table.userId),
//     uniqueIndex('post_slug_published_uq')
//       .on(table.slug)
//       .where(sql`${table.status} = 'published' AND ${table.deletedAt} IS NULL`),
//     index('post_created_at_idx').on(table.createdAt),
//     check(
//       'post_published_required_fields_ck',
//       sql`${table.status} <> 'published'
//         OR (
//           ${table.title} IS NOT NULL
//           AND ${table.content} IS NOT NULL
//           AND ${table.slug} IS NOT NULL
//         )`,
//     ),
//   ],
// );
