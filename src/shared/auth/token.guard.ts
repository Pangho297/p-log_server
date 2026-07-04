import { AuthService } from '@/auth/auth.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ACCESS_TOKEN_COOKIE_NAME, extractBearer, getCookie } from './utils';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token =
      getCookie(req.headers.cookie, ACCESS_TOKEN_COOKIE_NAME) ||
      extractBearer(req.headers.authorization); // 토큰 없는 경우 401 에러
    const payload = await this.authService.verifyAccessToken(token);
    this.authService.assertOwner(payload.sub);

    req.user = payload; // { sub, type, iat, exp, ... }
    return true;
  }
}
