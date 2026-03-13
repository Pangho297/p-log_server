import { Injectable } from '@nestjs/common';
import { CreatePostInputDto } from './dto/create-post-input.dto';
import { PostRepository } from './post.repository';
import { PostDto } from './post.entity';
import { UnauthorizedException } from '@/shared/exceptions/validation';

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

  async getPostList() {}

  async getPostBySlug() {}

  async update() {}

  async delete() {}
}
