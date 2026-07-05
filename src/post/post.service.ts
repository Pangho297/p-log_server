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
import { AppConfigService } from '@/shared/config/app-config.service';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly imagesRepository: ImagesRepository,
    private readonly appConfigService: AppConfigService,
  ) {}

  private getCloudflareImageExtractOptions() {
    return {
      accountHash: this.appConfigService.cloudflare.accountHash,
      allowedVariants: ['public'],
    };
  }

  private mappingRowData(row: PostDto): PostOutputDto {
    return {
      id: row.id,
      userId: row.userId,
      slug: row.slug,
      title: row.title,
      content: row.content,
      thumbnail: row.thumbnail,
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

    const extractImageUrls = extractCloudflareImageUrls(
      input.content,
      this.getCloudflareImageExtractOptions(),
    );
    const extractImageUrl = extractImageUrls ? extractImageUrls[0] : null;

    const randomIdx = Math.floor(Math.random() * 5);
    const randomThumbnail = defaultThumbnail[randomIdx];

    const addThumbnailInput = {
      ...input,
      thumbnail: extractImageUrl ? extractImageUrl : randomThumbnail,
    };

    const post = await this.postRepository.create(addThumbnailInput, userId);

    /** 최종 본문에 남아있는 이미지 목록을 현재 게시글과 동기화 */
    const usedIds = extractCloudflareImageIds(
      input.content,
      this.getCloudflareImageExtractOptions(),
    );
    await this.imagesRepository.syncPostImages({
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
      thumbnail: row.thumbnail,
      tags: row.tags,
      createdAt: row.createdAt,
    } satisfies PostOutputDto;
  }

  async update(
    userId: string,
    slug: string,
    input: UpdatePostInputDto,
  ): Promise<PostOutputDto> {
    const extractImageUrls = extractCloudflareImageUrls(
      input.content,
      this.getCloudflareImageExtractOptions(),
    );
    const extractImageUrl = extractImageUrls ? extractImageUrls[0] : null;

    const randomIdx = Math.floor(Math.random() * 5);
    const randomThumbnail = defaultThumbnail[randomIdx];
    const addThumbnailInput = {
      ...input,
      thumbnail: extractImageUrl ? extractImageUrl : randomThumbnail,
    };

    const row = await this.postRepository.update(
      userId,
      slug,
      addThumbnailInput,
    );

    if (input.content) {
      const usedIds = extractCloudflareImageIds(
        input.content,
        this.getCloudflareImageExtractOptions(),
      );
      await this.imagesRepository.syncPostImages({
        ownerUserId: userId,
        postId: row.id,
        usedIds,
      });
    }

    return this.mappingRowData(row);
  }

  async delete(userId: string, slug: string): Promise<{ success: boolean }> {
    const row = await this.postRepository.delete(userId, slug);
    await this.imagesRepository.markPostImagesAsDeletePending({
      ownerUserId: userId,
      postId: row.id,
    });

    return { success: true };
  }
}
