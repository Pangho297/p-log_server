import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PostService } from './post.service';
import { AccessAuth } from '@/shared/auth/access-auth.decorator';
import { User } from '@/shared/auth/user.decorator';
import { CreatePostInputDto } from './dto/create-post-input.dto';
import { PostDto } from './post.entity';
import { CombinedPaginate } from '@/shared/dto/combined-paginate.dto';
import { ApiCombinedPaginateResponse, QueryParams } from '@/shared/decorator';
import { GetPostListInputDto } from './dto/get-post-list-input.dto';
import { PostOutputDto } from './dto/post-output.dto';
import { UpdatePostInputDto } from './dto/update-post-input.dto';

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

1. 요청 쿠키의 **access_token**에서 **accessToken**을 가져옴
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
  ): Promise<PostOutputDto> {
    return await this.postService.create(body, userId);
  }

  @Get()
  @ApiCombinedPaginateResponse(PostDto)
  @ApiOperation({
    summary: '게시글 목록 조회',
    description: `
## 게시글 목록 조회 시 다음과 같은 과정이 진행됩니다.
1. 요청 시 입력 받은 **limit** 정규화 (페이지 사이즈는 최소 20개 ~ 최대 100개),
2. **cursor**를 입력받은 경우 해당 값은 디코드하여 **createdAt**과 **id**로 변환
3. 변환한 값은 페이지네이트 정렬에 사용
4. 정렬 시 조건은 다음과 같음 \`(created_at < cursor.createdAt) OR (created_at = cursor.createdAt AND id < cursor.id)\`
5. DB 데이터 조회 시 **limit** + 1의 값으로 다음 페이지 값이 존재하는지 체크
6. 조회된 내용은 **items** 배열로 반환
7. 페이지네이트 값은 **meta**로 반환
8. 클라이언트 측은 다음 페이지 조회 시도 시 반드시 **meta**에 존재하는 **nextCursor** 값 사용
    `,
  })
  async getPostList(
    @QueryParams() query: GetPostListInputDto,
  ): Promise<CombinedPaginate<PostOutputDto>> {
    return await this.postService.getPostList(query);
  }

  @Get(':slug')
  @ApiParam({
    name: 'slug',
    description: '게시글 식별 slug',
  })
  @ApiOkResponse({
    type: PostDto,
  })
  @ApiOperation({
    summary: '게시글 상세 조회',
    description: `
## 게시글 상세 조회 시 다음과 같은 과정이 진행됩니다.
1. **slug**를 기준으로 DB에서 검색
2. 발견된 게시글 정보 반환
3. 없는 경우 404 NotFound 에러 반환
4. (예정) 조회수 추가를 위한 **view** 추가
    `,
  })
  async getPostBySlug(@Param('slug') slug: string): Promise<PostOutputDto> {
    return await this.postService.getPostBySlug(slug);
  }

  @Patch(':slug')
  @AccessAuth()
  @ApiOperation({
    summary: '게시글 수정',
    description: `
## 게시글 수정 시 다음과 같은 과정이 진행됩니다.
1. **accessToken**으로 전달받은 **userId**, **slug**를 조건으로 사용
2. DB에서 데이터 조회, 이 때 **deletedAt**이 \`null\`인 경우만 포함
3. 전달받은 body 필드 중 데이터가 존재하는 경우만 update 수행
4. 성공 시 update결과를 반환
    `,
  })
  async update(
    @User() userId: string,
    @Param('slug') slug: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<PostOutputDto> {
    return await this.postService.update(userId, slug, body);
  }

  @Delete(':slug')
  @AccessAuth()
  @ApiOperation({
    summary: '게시글 삭제',
    description: `
## 게시글 삭제 시 다음과 같은 과정이 진행됩니다.
1. **accessToken**으로 전달받은 **userId**, **slug**를 조건으로 사용
2. DB에서 데이터 조회, 이 때 **deletedAt**이 \`null\`인 경우만 포함
3. 일치하는 **slug** **deletedAt**을 로직 수행 일시로 변경 (Soft-Delete)
4. 성공 시 **success** 여부 반환
    `,
  })
  async delete(@User() userId: string, @Param('slug') slug: string) {
    return await this.postService.delete(userId, slug);
  }
}
