import { DateProperty, StringProperty } from '@/shared/decorator';
import { UUID } from '@/shared/types/common';

export class RefreshTokenEntity {
  @StringProperty({ description: 'refreshToken PK' })
  id: UUID;

  @StringProperty({ description: '사용자 Id' })
  userId: UUID;

  @StringProperty({ description: 'JsonWebToken Id' })
  jti: string;

  @StringProperty({ description: '해싱된 refreshToken 값' })
  tokenHash: string;

  @DateProperty({
    transform: true,
    description: '토큰 만료 예정일',
  })
  expiresAt: Date;

  @DateProperty({
    transform: true,
    nullable: true,
    description: '토큰 만료일',
  })
  revokedAt: Date | null;
}
