import { DRIZZLE_DB } from '@/shared/db/db.token';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/shared/db/schema';
import { CreateImagesInputDto } from './dto/create-images-input.dto';
import { MarkImageStatusInputDto } from './dto/mark-image-status-input.dto';
import {
  and,
  eq,
  inArray,
  isNull,
  lte,
  notInArray,
  or,
  sql,
} from 'drizzle-orm';

@Injectable()
export class ImagesRepository {
  private readonly DELETE_GRACE_HOURS = 6;
  private readonly TEMP_TTL_HOURS = 24;
  private readonly imageAssetsModel = schema.image_assets_model;

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  private getDeleteAfter() {
    return new Date(Date.now() + this.DELETE_GRACE_HOURS * 60 * 60 * 1000);
  }

  private getTempExpiresBefore() {
    return new Date(Date.now() - this.TEMP_TTL_HOURS * 60 * 60 * 1000);
  }

  async create({ imageId, ownerUserId, postId }: CreateImagesInputDto) {
    await this.db.insert(this.imageAssetsModel).values({
      imageId,
      ownerUserId,
      postId: postId ?? null,
      status: 'temp',
    });
  }

  async syncPostImages({
    ownerUserId,
    postId,
    usedIds,
  }: MarkImageStatusInputDto) {
    await this.db.transaction(async (tx) => {
      if (usedIds.length > 0) {
        await tx
          .update(this.imageAssetsModel)
          .set({
            postId,
            status: 'attached',
            lastSeenAt: new Date(),
            deleteAfter: null,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(this.imageAssetsModel.ownerUserId, ownerUserId),
              or(
                isNull(this.imageAssetsModel.postId),
                eq(this.imageAssetsModel.postId, postId),
              ),
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
          deleteAfter: this.getDeleteAfter(),
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

  async markPostImagesAsDeletePending({
    ownerUserId,
    postId,
  }: Pick<MarkImageStatusInputDto, 'ownerUserId' | 'postId'>) {
    await this.db
      .update(this.imageAssetsModel)
      .set({
        status: 'delete_pending',
        deleteAfter: this.getDeleteAfter(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(this.imageAssetsModel.ownerUserId, ownerUserId),
          eq(this.imageAssetsModel.postId, postId),
          inArray(this.imageAssetsModel.status, [
            'temp',
            'attached',
            'delete_pending',
          ]),
        ),
      );
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
          inArray(this.imageAssetsModel.status, ['temp', 'delete_pending']),
        ),
      );
  }

  async getImagesReadyForGc() {
    return await this.db
      .select()
      .from(this.imageAssetsModel)
      .where(
        or(
          and(
            eq(this.imageAssetsModel.status, 'delete_pending'),
            lte(this.imageAssetsModel.deleteAfter, new Date()),
          ),
          and(
            eq(this.imageAssetsModel.status, 'temp'),
            lte(this.imageAssetsModel.createdAt, this.getTempExpiresBefore()),
          ),
        ),
      )
      .limit(100);
  }
}
