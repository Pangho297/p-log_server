import { StringProperty } from '@/shared/decorator';

export class LoginInputDto {
  @StringProperty({ description: '사용자 Email 주소' })
  email: string;

  @StringProperty({ description: '비밀번호' })
  password: string;
}
