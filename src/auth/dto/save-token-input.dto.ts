import { DateProperty, StringProperty } from '@/shared/decorator';
import { UUID } from '@/shared/types/common';

export class SaveTokenInputDto {
  @StringProperty()
  userId: UUID;

  @StringProperty()
  jti: string;

  @StringProperty()
  tokenHash: string;

  @DateProperty()
  expiresAt: Date;

  @DateProperty({ optional: true, nullable: true })
  revokedAt?: Date | null;
}
