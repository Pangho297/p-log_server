import { StringProperty } from '@/shared/decorator';

export class LoginTokenDto {
  @StringProperty()
  accessToken: string;

  @StringProperty()
  refreshToken: string;
}
