import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const imageStatusEnum = pgEnum('image_status', [
  'temp', // 발행 전
  'attached', // 게시글 발행됨
  'delete_pending', // 삭제 보류
  'deleted', // 삭제됨
]);

export const image_assets_model = pgTable(
  'image_assets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    imageId: varchar('image_id', { length: 128 }).notNull().unique(),
    ownerUserId: uuid('owner_user_id').notNull(),
    postId: uuid('post_id'), // 게시글 생성 전 임시 이미지는 null
    status: imageStatusEnum('status').notNull().default('temp'),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    deleteAfter: timestamp('delete_after', { withTimezone: true }), // delete_pending 시 설정
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_image_assets_owner_status').on(table.ownerUserId, table.status),
    index('idx_image_assets_owner_post').on(table.ownerUserId, table.postId),
    index('idx_image_assets_status_delete_after').on(
      table.status,
      table.deleteAfter,
    ),
  ],
);
