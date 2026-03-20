import { ArrayProperty, StringProperty } from '@/shared/decorator';

export class MarkImageStatusInputDto {
  @StringProperty()
  ownerUserId: string;

  @StringProperty()
  postId: string;

  @ArrayProperty({ type: String })
  usedIds: string[];
}
