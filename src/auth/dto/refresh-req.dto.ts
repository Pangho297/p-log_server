import { StringProperty } from '@/shared/decorator';
import { UUID } from '@/shared/types/common';

export class RefreshTokenReqDto {
  @StringProperty()
  userId: UUID;

  @StringProperty()
  oldRefreshToken: string;
}
