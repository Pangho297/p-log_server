import { BooleanProperty } from '@/shared/decorator';

export class LogoutDto {
  @BooleanProperty({
    description: 'refreshToken 만료 여부',
  })
  success: boolean;
}
