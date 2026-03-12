import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostService } from './post.service';
import { AccessAuth } from '@/shared/auth/access-auth.decorator';
import { User } from '@/shared/auth/user.decorator';

@ApiTags('📄 게시글')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @AccessAuth()
  create(@Body() body, @User() userId: string) {
    return console.log('게시글 생성', { userId, body });
  }

  @Get()
  getPostList() {
    return console.log('게시글 목록 조회');
  }

  @Get(':slug')
  getPost() {
    return console.log('게시글 상세 조회');
  }

  @Patch()
  update() {
    return console.log('게시글 수정');
  }

  @Delete()
  delete() {
    return console.log('게시글 삭제');
  }
}
