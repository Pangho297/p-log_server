import { BooleanProperty } from '@/shared/decorator';

export class AuthSuccessDto {
  @BooleanProperty({
    description: '인증 요청 성공 여부',
  })
  success: boolean;
}
