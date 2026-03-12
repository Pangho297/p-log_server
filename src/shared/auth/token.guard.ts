import { AuthService } from '@/auth/auth.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { extractBearer } from './utils';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractBearer(req.headers.authorization); // 토큰 없는 경우 401 에러
    const payload = await this.authService.verifyAccessToken(token);

    req.user = payload; // { sub, type, iat, exp, ... }
    return true;
  }
}
