import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { TokenGuard } from './token.guard';

/** AccessToken 인증이 필요한 API에 적용하는 데코레이터
 * - HttpOnly `access_token` 쿠키를 검증
 * - Swagger Cookie Auth 설정을 함께 적용
 */
export function AccessAuth() {
  return applyDecorators(
    ApiCookieAuth('accessTokenCookie'),
    UseGuards(TokenGuard),
  );
}
