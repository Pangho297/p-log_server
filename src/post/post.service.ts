import { Injectable } from '@nestjs/common';
import { CreatePostInputDto } from './dto/create-post-input.dto';
import { PostRepository } from './post.repository';
import { PostDto } from './post.entity';
import { UnauthorizedException } from '@/shared/exceptions/validation';
import {
  createCursorMeta,
  decodeCursor,
  normalizeLimit,
} from '@/shared/utils/paginate';
import { GetPostListInputDto } from './dto/get-post-list-input.dto';
import { CombinedPaginate } from '@/shared/dto/combined-paginate.dto';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(input: CreatePostInputDto, userId?: string): Promise<PostDto> {
    if (!userId) {
      throw new UnauthorizedException('사용자를 조회할 수 없습니다.');
    }

    const post = await this.postRepository.create(input, userId);
    return post;
  }

  async getPostList(
    query: GetPostListInputDto,
  ): Promise<CombinedPaginate<PostDto>> {
    const limit = await normalizeLimit(query.limit);
    const cursor = query.cursor ? await decodeCursor(query.cursor) : undefined;
    const rows = await this.postRepository.getPostList({ limit, cursor });

    return createCursorMeta(rows, limit);
  }

  async getPostBySlug() {}

  async update() {}

  async delete() {}
}
