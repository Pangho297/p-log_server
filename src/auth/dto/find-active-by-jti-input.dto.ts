import { StringProperty } from '@/shared/decorator';

export class FindActiveByJtiInputDto {
  @StringProperty()
  jti: string;
}
