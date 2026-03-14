import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostService } from './post.service';
import { AccessAuth } from '@/shared/auth/access-auth.decorator';
import { User } from '@/shared/auth/user.decorator';
import { CreatePostInputDto } from './dto/create-post-input.dto';
import { PostDto } from './post.entity';

@ApiTags('📄 게시글')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @AccessAuth()
  @ApiOkResponse({ type: PostDto })
  @ApiOperation({
    summary: '게시글 생성',
    description: `
## 게시글 생성 시 다음과 같은 과정이 진행됩니다.

1. 요청 헤더의 **Authorization**에서 **accessToken**을 가져옴
2. 가져온 **accessToken** 검증하여 userId를 조회
3. userId가 존재하지 않는 경우 401에러 반환
4. 사용자 입력 값 중 **title** 로 **slug** 생성
5. 이 때 1회 생성 시마다 DB에 게시글 데이터 추가 시도
6. **slug**는 유니크 값으로 충돌 발생 가능
7. 충돌 시 **slug** 재생성 후 DB 입력 재시도 
8. 이외의 DB 에러는 **throw**
9. 재시도 후에도 실패 시 커스텀(**BlogException**) 에러 반환
    `,
  })
  async create(
    @Body() body: CreatePostInputDto,
    @User() userId?: string,
  ): Promise<PostDto> {
    return await this.postService.create(body, userId);
  }

  @Get()
  getPostList() {
    return console.log('게시글 목록 조회');
  }

  @Get(':slug')
  getPostBySlug() {
    return console.log('게시글 상세 조회');
  }

  @Patch(':slug')
  update() {
    return console.log('게시글 수정');
  }

  @Delete(':slug')
  delete() {
    return console.log('게시글 삭제');
  }
}
