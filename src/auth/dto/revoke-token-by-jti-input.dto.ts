import { StringProperty } from '@/shared/decorator';

export class RevokeTokenByJtiInput {
  @StringProperty()
  jti: string;
}
