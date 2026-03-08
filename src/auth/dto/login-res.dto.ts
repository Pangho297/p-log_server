import { StringProperty } from '@/shared/decorator';

export class LoginResDto {
  @StringProperty({
    description: `**accessToken**은 쿠키로 관리해 주세요 (기간 15분)`,
  })
  accessToken: string;
}
