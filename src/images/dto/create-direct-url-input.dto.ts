import { StringProperty } from '@/shared/decorator';
import { UUID } from '@/shared/types/common';

export class CreateDirectUrlInputDto {
  @StringProperty()
  postId: UUID;
}
