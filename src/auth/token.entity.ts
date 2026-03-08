import { DateProperty, StringProperty } from '@/shared/decorator';
import { UUID } from '@/shared/types/common';

export class RefreshTokenEntity {
  @StringProperty()
  id: UUID;

  @StringProperty()
  userId: UUID;

  @StringProperty()
  jti: string;

  @StringProperty()
  tokenHash: string;

  @DateProperty({
    transform: true,
  })
  expiresAt: Date;

  @DateProperty({
    transform: true,
    nullable: true,
  })
  revokedAt: Date | null;
}
