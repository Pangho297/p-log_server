import { StringProperty } from '@/shared/decorator';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserDto {
  @StringProperty({ description: '사용자 Id (PK)' })
  id: string;

  @StringProperty({ description: '사용자 Email' })
  email: string;
}
