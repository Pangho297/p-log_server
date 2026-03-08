import { StringProperty } from '@/shared/decorator';

export class LoginReqDto {
  @StringProperty()
  email: string;

  @StringProperty()
  password: string;
}
