import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { randomUUID } from 'crypto';
import { JWTPayload, UUID } from '@/shared/types/common';
import { UnauthorizedException } from '@/shared/exceptions/validation';
import { LoginTokenDto } from './dto/login-token.dto';
import { hasher } from '@/shared/utils/hasher';
import { UserService } from '@/user/user.service';
import { LoginInputDto } from './dto/login-input.dto';
import { LogoutDto } from './dto/logout.dto';
import { AppConfigService } from '@/shared/config/app-config.service';

@Injectable()
export class AuthService {
  private readonly ACCESS_EXPIRES_IN = '15m';
  private readonly REFRESH_EXPIRES_SEC = 60 * 60 * 24 * 14; // 14일

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly authRepository: AuthRepository,
    private readonly appConfigService: AppConfigService,
  ) {}

  private signAccessToken(userId: UUID) {
    return this.jwtService.sign<JWTPayload>(
      { sub: userId, type: 'access' },
      {
        secret: this.appConfigService.jwtSecret.accessSecret,
        expiresIn: this.ACCESS_EXPIRES_IN,
      },
    );
  }

  private signRefreshToken(userId: UUID, jti: string) {
    return this.jwtService.sign<JWTPayload>(
      { sub: userId, jti, type: 'refresh' },
      {
        secret: this.appConfigService.jwtSecret.refreshSecret,
        expiresIn: this.REFRESH_EXPIRES_SEC,
      },
    );
  }

  async verifyRefreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<JWTPayload>(token, {
        secret: this.appConfigService.jwtSecret.refreshSecret,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('유효하지 않은 Refresh Token입니다');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('유효하지 않은 Refresh Token입니다');
    }
  }

  async verifyAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify<JWTPayload>(token, {
        secret: this.appConfigService.jwtSecret.accessSecret,
      });

      if (payload.type !== 'access') {
        throw new UnauthorizedException('유효하지 않은 Access Token입니다');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('유효하지 않은 Access Token입니다');
    }
  }

  assertOwner(userId: UUID) {
    if (userId !== this.appConfigService.app.ownerUserId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }
  }

  async login(input: LoginInputDto): Promise<LoginTokenDto> {
    const hashing = hasher(input.password);

    const user = await this.userService.verifyAccount({
      email: input.email,
      password: hashing,
    });

    const userId = user.id;

    const jti = randomUUID();
    const accessToken = this.signAccessToken(userId);
    const refreshToken = this.signRefreshToken(userId, jti);

    await this.authRepository.saveToken({
      userId,
      jti,
      tokenHash: hasher(refreshToken),
      expiresAt: new Date(Date.now() + this.REFRESH_EXPIRES_SEC * 1000),
      revokedAt: null,
    });

    return { accessToken, refreshToken };
  }

  async refresh(oldRefreshToken: string): Promise<LoginTokenDto> {
    const payload = await this.verifyRefreshToken(oldRefreshToken);

    if (!payload.jti) {
      throw new UnauthorizedException('Refresh Token이 유효하지 않습니다.');
    }

    const newJti = randomUUID();
    const accessToken = this.signAccessToken(payload.sub);
    const refreshToken = this.signRefreshToken(payload.sub, newJti);

    await this.authRepository.rotateRefreshToken({
      oldJti: payload.jti,
      oldRefreshToken,
      newRow: {
        userId: payload.sub,
        jti: newJti,
        tokenHash: hasher(refreshToken),
        expiresAt: new Date(Date.now() + this.REFRESH_EXPIRES_SEC * 1000),
        revokedAt: null,
      },
    });

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string): Promise<LogoutDto> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);

      if (!payload.jti) {
        throw new UnauthorizedException('Refresh Token이 유효하지 않습니다.');
      }

      const found = await this.authRepository.findActiveByJti({
        jti: payload.jti,
      });

      if (found && !found.revokedAt) {
        await this.authRepository.revokeTokenByJti({ jti: payload.jti });
      }

      return { success: true };
    } catch {
      // 토큰을 찾지 못하거나 이미 revokedAt이 있는경우에도 성공 처리
      return { success: true };
    }
  }
}
