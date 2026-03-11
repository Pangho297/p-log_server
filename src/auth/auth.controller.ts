import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginInputDto } from './dto/login-input.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { IS_LOCAL } from '@/consts';
import { AccessTokenDto } from './dto/access-token.dto';
import { LogoutDto } from './dto/logout.dto';

@ApiTags('🔐 인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** refreshToken을 response 헤더에 삽입해 주는 과정 */
  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: IS_LOCAL ? false : true,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('login')
  @ApiOkResponse({ type: AccessTokenDto })
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
  async login(
    @Body() body: LoginInputDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenDto> {
    const { accessToken, refreshToken } = await this.authService.login(body);
    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('refresh')
  @ApiOkResponse({ type: AccessTokenDto })
  @ApiOperation({
    summary: '토큰 재발급',
    description: `
## AccessToken이 만료된 경우 사용하는 토큰 재발급 요청입니다.
다음과 같은 과정으로 토큰이 재발급 됩니다

1. **credentials: 'include'** 또는 **withCredentials: true** 설정으로 인해 브라우저에 자동으로 첨부된 쿠키 확인
2. 쿠키에서 **refresh_token**을 가져옴
3. 해당 토큰이 유효한 토큰인지 검증
4. 올바른 토큰이라면 **accessToken**과 **refreshToken** 생성
5. 올바르지 않은 경우 exception을 반환
6. 로그인 때와 마찬가지로 **accessToken**은 응답에 직접 전송
7. **refreshToken**은 _cookie_에 담아 전송
`,
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenDto> {
    const oldToken: string | undefined = req.cookies?.refresh_token;

    if (!oldToken) {
      throw new BadRequestException('Refresh Token이 존재하지 않습니다.');
    }

    const { accessToken, refreshToken } =
      await this.authService.refresh(oldToken);
    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('logout')
  @ApiOkResponse({ type: LogoutDto })
  @ApiOperation({
    summary: '로그아웃',
    description: `
## 브라우저 쿠키와 DB에 저장된 Refresh Token을 모두 만료하는 요청입니다.
클라이언트 측은 서버에서 보내주는 **success** 값을 받은 뒤 **logout** 처리를 진행하면 됩니다.
`,
  })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;

    if (!token) {
      throw new BadRequestException('Refresh Token이 존재하지 않습니다.');
    }

    await this.authService.logout(token);
    res.clearCookie('refresh_token', { path: '/auth/refresh' });

    return { success: true };
  }
}
