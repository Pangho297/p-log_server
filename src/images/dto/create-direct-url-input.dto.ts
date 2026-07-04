import { StringProperty } from '@/shared/decorator';
import { UUID } from '@/shared/types/common';

export class CreateDirectUrlInputDto {
  @StringProperty({
    description: '업로드 목적',
    optional: true,
  })
  purpose?: 'post-content';

  @StringProperty({
    description: '업로드를 시도한 게시글 Id',
    optional: true,
  })
  postId?: UUID;
}
