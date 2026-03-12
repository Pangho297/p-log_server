import { StringProperty } from '@/shared/decorator';
import { UUID } from '@/shared/types/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserDto {
  @StringProperty({ description: '사용자 Id (PK)' })
  id: UUID;

  @StringProperty({ description: '사용자 Email' })
  email: string;
}
