import { StringProperty } from '@/shared/decorator';

export class VerifyUserInputDto {
  @StringProperty({
    description: '사용자 Email',
  })
  email: string;

  @StringProperty({
    description: '해싱된 비밀 번호',
  })
  password: string;
}
