import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { createHash, randomUUID } from 'crypto';
import { JWTPayload, UUID } from '@/shared/types/common';
import { IS_LOCAL } from '@/consts';
import { UnauthorizedException } from '@/shared/exceptions/validation';
import { RefreshTokenEntity } from './token.entity';
import { LoginTokenDto } from './dto/login-token.dto';

@Injectable()
export class AuthService {
  private readonly ACCESS_EXPIRES_IN = '15m';
  private readonly REFRESH_EXPIRES_SEC = 60 * 60 * 24 * 14; // 14일

  constructor(
    private readonly jwtService: JwtService,
    private readonly AuthRepository: AuthRepository,
  ) {}

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

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
    const jti = randomUUID();
    const accessToken = this.signAccessToken(userId);
    const refreshToken = this.signRefreshToken(userId, jti);

    // TODO: 토큰 저장 추가 필요
    await this.AuthRepository.saveToken();

    return { accessToken, refreshToken };
  }

  async refresh(oldRefreshToken: string): Promise<LoginTokenDto> {
    const payload = await this.verifyRefreshToken(oldRefreshToken);

    // TODO: 토큰 조회 추가 필요
    const found: RefreshTokenEntity = await this.AuthRepository.findOne();

    if (!found || found.revokedAt)
      throw new UnauthorizedException('Refresh Token이 유효하지 않습니다.');
    if (found.expiresAt.getTime() < Date.now())
      throw new UnauthorizedException('Refresh Token이 만료되었습니다.');
    if (found.tokenHash !== this.hashToken(oldRefreshToken))
      throw new UnauthorizedException('Refresh Token이 일치하지 않습니다.');

    // TODO 토큰이 유효하지 않은 경우 로그아웃

    found.revokedAt = new Date();
    // TODO 기존 토큰 폐기 (soft delete)
    await this.AuthRepository.saveToken();

    const newJti = randomUUID();
    const accessToken = this.signAccessToken(payload.sub);
    const refreshToken = this.signRefreshToken(payload.sub, newJti);

    // TODO: 새로운 토큰 저장
    await this.AuthRepository.saveToken();

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    try {
      await this.verifyRefreshToken(refreshToken);
      // TODO: 토큰 조회 추가 필요
      const found: RefreshTokenEntity = await this.AuthRepository.findOne();

      if (found && !found.revokedAt) {
        found.revokedAt = new Date();
        // TODO 토큰 변경 추가 필요
        await this.AuthRepository.saveToken();
      }
    } catch {
      // 토큰을 찾지 못하거나 이미 revokedAt이 있는경우에도 성공 처리
    }
  }
}
