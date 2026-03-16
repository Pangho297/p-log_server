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

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

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

    const post = await this.postRepository.create(input, userId);
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
