import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserInputDto } from './dto/create-user.dto';
import { UserDto } from './user.entity';

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
}
