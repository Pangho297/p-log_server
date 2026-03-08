import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { randomUUID } from 'crypto';
import { JWTPayload, UUID } from '@/shared/types/common';
import { IS_LOCAL } from '@/consts';
import { UnauthorizedException } from '@/shared/exceptions/validation';
import { LoginTokenDto } from './dto/login-token.dto';
import { hashToken } from './utils';

@Injectable()
export class AuthService {
  private readonly ACCESS_EXPIRES_IN = '15m';
  private readonly REFRESH_EXPIRES_SEC = 60 * 60 * 24 * 14; // 14일

  constructor(
    private readonly jwtService: JwtService,
    private readonly AuthRepository: AuthRepository,
  ) {}

  private signAccessToken(userId: UUID) {
    return this.jwtService.sign<JWTPayload>(
      { sub: userId, type: 'access' },
      {
        secret: IS_LOCAL
          ? process.env.DEV_JWT_ACCESS_SECRET
          : process.env.JWT_ACCESS_SECRET,
        expiresIn: this.ACCESS_EXPIRES_IN,
      },
    );
  }

  private signRefreshToken(userId: UUID, jti: string) {
    return this.jwtService.sign<JWTPayload>(
      { sub: userId, jti, type: 'refresh' },
      {
        secret: IS_LOCAL
          ? process.env.DEV_JWT_REFRESH_SECRET
          : process.env.JWT_REFRESH_SECRET,
        expiresIn: this.REFRESH_EXPIRES_SEC,
      },
    );
  }

  async verifyRefreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<JWTPayload>(token, {
        secret: IS_LOCAL
          ? process.env.DEV_JWT_REFRESH_SECRET
          : process.env.JWT_REFRESH_SECRET,
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
        secret: IS_LOCAL
          ? process.env.DEV_JWT_ACCESS_SECRET
          : process.env.JWT_ACCESS_SECRET,
      });

      if (payload.type !== 'access') {
        throw new UnauthorizedException('유효하지 않은 Access Token입니다');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('유효하지 않은 Access Token입니다');
    }
  }

  async login(userId: UUID): Promise<LoginTokenDto> {
    // TODO: 이메일 + 비밀번호 입력으로 로그인 구현 이메일로 사용자 조회 추가 필요
    const jti = randomUUID();
    const accessToken = this.signAccessToken(userId);
    const refreshToken = this.signRefreshToken(userId, jti);

    await this.AuthRepository.saveToken({
      userId,
      jti,
      tokenHash: hashToken(refreshToken),
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

    await this.AuthRepository.rotateRefreshToken({
      oldJti: payload.jti,
      oldRefreshToken,
      newRow: {
        userId: payload.sub,
        jti: newJti,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + this.REFRESH_EXPIRES_SEC * 1000),
        revokedAt: null,
      },
    });

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);

      if (!payload.jti) {
        throw new UnauthorizedException('Refresh Token이 유효하지 않습니다.');
      }

      const found = await this.AuthRepository.findActiveByJti({
        jti: payload.jti,
      });

      if (found && !found.revokedAt) {
        await this.AuthRepository.revokeTokenByJti({ jti: payload.jti });
      }
    } catch {
      // 토큰을 찾지 못하거나 이미 revokedAt이 있는경우에도 성공 처리
    }
  }
}
