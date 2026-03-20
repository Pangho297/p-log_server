import { DRIZZLE_DB } from '@/shared/db/db.token';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/shared/db/schema';
import { CreateImagesInputDto } from './dto/create-images-input.dto';

@Injectable()
export class ImagesRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create({ imageId, ownerUserId, postId }: CreateImagesInputDto) {
    const imageAssetsModel = schema.image_assets_model;

    await this.db.insert(imageAssetsModel).values({
      imageId,
      ownerUserId,
      postId,
      status: 'temp',
    });
  }
}
