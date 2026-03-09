import { StringProperty } from '@/shared/decorator';

export class CreateUserInputDto {
  @StringProperty()
  email: string;

  @StringProperty({description: "사용자에게 받은 해싱되지 않은 비밀번호, 반드시 해싱하여 저장할 것"})
  password: string;
}
