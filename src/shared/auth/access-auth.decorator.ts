import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TokenGuard } from './token.guard';

/** AccessToken 인증이 필요한 API에 적용하는 데코레이터
 * - Authorization: Bearer `accessToken` 헤더를 검증
 * - Swagger Bearer 설정을 함께 적용
 */
export function AccessAuth() {
  return applyDecorators(ApiBearerAuth('인증토큰'), UseGuards(TokenGuard));
}
