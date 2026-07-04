import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserInputDto } from './dto/create-user.dto';
import { UserDto } from './user.entity';
import { User } from '@/shared/auth/user.decorator';
import { AccessAuth } from '@/shared/auth/access-auth.decorator';

@ApiTags('🙋 사용자')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOkResponse({ type: UserDto })
  @ApiOperation({
    summary: '계정 생성',
    description: `
## 사용자 계정을 생성합니다

개인용 블로그 프로젝트이지만 공부 차원에서 회원 관리의 흐름을 파악하기 위해
회원 생성, 로그인, 인증 과정을 거치게 만들었습니다. 회원가입 시 다음과 같은 과정이 진행됩니다.

1. 비밀번호 해싱
2. email, 비밀번호를 DB에 저장

## 결과를 확인할 수 있도록 response에 생성 결과 반환
실제 환경에선 생성 성공/실패 여부만 확인할 수 있어야 하겠지만 프로젝트 프리뷰 차원에서 생성 결과 반환 중
    `,
  })
  create(@Body() body: CreateUserInputDto): Promise<UserDto> {
    return this.userService.create(body);
  }

  @Get()
  @AccessAuth()
  @ApiOkResponse({ type: UserDto })
  @ApiOperation({
    summary: '계정 조회',
    description: `
## 사용자 계정 정보를 조회합니다

개인용 블로그 프로젝트 이기때문에 특성상 블로그인 주인장 게정밖에 조회하지 못합니다<br />
계정 조회가 필요한 부분이 있을 것 같아 만들어둔 API입니다<br />
계정 조회 시 다음과 같은 과정을 거치게 만들었습니다.

1. Cookie의 AccessToken 가져오기
2. AccessToken이 환경변수로 지정해둔 특정 Id와 일치한지 확인
3. 일치할 경우 해당 계정의 정보 전송

    `,
  })
  me(@User() userId: string) {
    return this.userService.findUserById(userId);
  }
}
