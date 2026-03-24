import { Injectable } from '@nestjs/common';
import { CreatePostInputDto } from './dto/create-post-input.dto';
import { PostRepository } from './post.repository';
import { UnauthorizedException } from '@/shared/exceptions/validation';
import {
  createCursorMeta,
  decodeCursor,
  normalizeLimit,
} from '@/shared/utils/paginate';
import { GetPostListInputDto } from './dto/get-post-list-input.dto';
import { CombinedPaginate } from '@/shared/dto/combined-paginate.dto';
import { PostOutputDto } from './dto/post-output.dto';
import { UpdatePostInputDto } from './dto/update-post-input.dto';
import { PostDto } from './post.entity';
import { ImagesRepository } from '@/images/images.repository';
import { extractCloudflareImageIds, extractCloudflareImageUrls } from './utils';
import { defaultThumbnail } from '@/shared/constants/post';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly imagesRepository: ImagesRepository,
  ) {}

  private mappingRowData(row: PostDto): PostOutputDto {
    return {
      id: row.id,
      userId: row.userId,
      slug: row.slug,
      title: row.title,
      content: row.content,
      tags: row.tags,
      createdAt: row.createdAt,
    };
  }

  async create(
    input: CreatePostInputDto,
    userId?: string,
  ): Promise<PostOutputDto> {
    if (!userId) {
      throw new UnauthorizedException('사용자를 조회할 수 없습니다.');
    }

    const extractImageUrl = extractCloudflareImageUrls(input.content)[0];

    const randomIdx = Math.floor(Math.random() * 5);
    const randomThumbnail = defaultThumbnail[randomIdx];

    const addThumbnailInput = {
      ...input,
      thumbnail: extractImageUrl ? extractImageUrl : randomThumbnail,
    };

    const post = await this.postRepository.create(addThumbnailInput, userId);

    /** 업로드 완료된 이미지 목록
     *
     * - 실제 업로드된 이미지들은 모두 상태를 attached로 변경
     * - 업로드되진 않았지만 postId가 같다면 delete_pending으로 변경
     */
    const usedIds = extractCloudflareImageIds(input.content);
    await this.imagesRepository.markImageStatusByPublish({
      ownerUserId: userId,
      postId: post.id,
      usedIds,
    });
    return this.mappingRowData(post);
  }

  async getPostList(
    query: GetPostListInputDto,
  ): Promise<CombinedPaginate<PostOutputDto>> {
    const limit = await normalizeLimit(query.limit);
    const cursor = query.cursor ? await decodeCursor(query.cursor) : undefined;
    const rows = await this.postRepository.getPostList({ limit, cursor });

    const mapper = rows.map(
      (row) => this.mappingRowData(row) satisfies PostOutputDto,
    );

    return createCursorMeta(mapper, limit);
  }

  async getPostBySlug(slug: string): Promise<PostOutputDto> {
    const row = await this.postRepository.getPostBySlug(slug);

    return {
      id: row.id,
      userId: row.userId,
      slug: row.slug,
      title: row.title,
      content: row.content,
      tags: row.tags,
      createdAt: row.createdAt,
    } satisfies PostOutputDto;
  }

  async update(
    userId: string,
    slug: string,
    input: UpdatePostInputDto,
  ): Promise<PostOutputDto> {
    const row = await this.postRepository.update(userId, slug, input);

    return this.mappingRowData(row);
  }

  async delete(userId: string, slug: string): Promise<{ success: boolean }> {
    await this.postRepository.delete(userId, slug);
    return { success: true };
  }
}
