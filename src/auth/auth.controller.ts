import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginReqDto } from './dto/login-req.dto';

@ApiTags('🔐 인증')
@Controller('auth')
export class AuthController {
  constructor() {}

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: `
## 로그인 시 다음과 같은 과정이 진행됩니다

1. 로그인 성공 시 _crypto_와 _jwt_를 이용해 **accessToken**, **refreshToken**을 생성
2. **refreshToken**은 해싱되어 DB에 저장
3. 클라이언트에 **accessToken**은 응답에 직접 전송
4. **refreshToken**은 _cookie_에 담아 전송

## 클라이언트 측에서도 쿠키를 주고받기 위한 설정이 별도로 필요합니다
- **fetch API** 의 **credentials** 설정을 **include**로 설정
- 또는 **axios** 의 요청 설정 중 **withCredentials**를 **true**로 설정
    `,
  })
  login(@Body() body: LoginReqDto) {
    console.log('Test', body);
  }
}
