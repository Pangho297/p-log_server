import { ArrayProperty, StringProperty } from '@/shared/decorator';

export class CreatePostInputDto {
  @StringProperty({
    description: '글 제목',
  })
  title: string;

  @StringProperty({
    description: '글 내용',
  })
  content: string;

  @ArrayProperty({ type: String, description: '카테고리 목록' })
  tags: string[];
}
