import { DRIZZLE_DB } from '@/shared/db/db.token';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/shared/db/schema';
import { CreateImagesInputDto } from './dto/create-images-input.dto';
import { MarkImageStatusInputDto } from './dto/mark-image-status-input.dto';
import { and, eq, inArray, lte, notInArray, sql } from 'drizzle-orm';

@Injectable()
export class ImagesRepository {
  private readonly GRACE_HOURS = 6;
  private readonly imageAssetsModel = schema.image_assets_model;

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create({ imageId, ownerUserId, postId }: CreateImagesInputDto) {
    await this.db.insert(this.imageAssetsModel).values({
      imageId,
      ownerUserId,
      postId,
      status: 'temp',
    });
  }

  async markImageStatusByPublish({
    ownerUserId,
    postId,
    usedIds,
  }: MarkImageStatusInputDto) {
    await this.db.transaction(async (tx) => {
      if (usedIds.length > 0) {
        await tx
          .update(this.imageAssetsModel)
          .set({
            status: 'attached',
            lastSeenAt: new Date(),
            deleteAfter: null,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(this.imageAssetsModel.ownerUserId, ownerUserId),
              eq(this.imageAssetsModel.postId, postId),
              inArray(this.imageAssetsModel.status, [
                'temp',
                'delete_pending',
                'attached',
              ]),
              inArray(this.imageAssetsModel.imageId, usedIds),
            ),
          );
      }

      await tx
        .update(this.imageAssetsModel)
        .set({
          status: 'delete_pending',
          deleteAfter: sql`now() + interval ${sql.raw(String(this.GRACE_HOURS))} hours`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(this.imageAssetsModel.ownerUserId, ownerUserId),
            eq(this.imageAssetsModel.postId, postId),
            inArray(this.imageAssetsModel.status, ['temp', 'attached']),
            usedIds.length > 0
              ? notInArray(this.imageAssetsModel.imageId, usedIds)
              : sql`true`,
          ),
        );
    });
  }

  async markImageStatusByDeleted(id: string) {
    await this.db
      .update(this.imageAssetsModel)
      .set({
        status: 'deleted',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(this.imageAssetsModel.id, id),
          eq(this.imageAssetsModel.status, 'delete_pending'),
        ),
      );
  }

  async getDeletePendingImages() {
    return await this.db
      .select()
      .from(this.imageAssetsModel)
      .where(
        and(
          eq(this.imageAssetsModel.status, 'delete_pending'),
          lte(this.imageAssetsModel.deleteAfter, new Date()),
        ),
      )
      .limit(100);
  }
}
