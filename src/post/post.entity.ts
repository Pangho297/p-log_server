import {
  ArrayProperty,
  DateProperty,
  StringProperty,
} from '@/shared/decorator';
import { UUID } from '@/shared/types/common';

export class PostDto {
  @StringProperty({
    description: '게시글 Id (PK)',
  })
  id: UUID;

  @StringProperty({
    description: '작성자 Id (FK)',
  })
  userId: UUID;

  @StringProperty({
    description: '게시글 URL 식별자',
  })
  slug: string;

  @StringProperty({
    description: '게시글 제목',
  })
  title: string;

  @StringProperty({
    description: '게시글 내용 (Markdown)',
  })
  content: string;

  @ArrayProperty({ type: String, description: '식별 태그 목록' })
  tags: string[];

  @DateProperty({ transform: true, description: '게시글 생성일' })
  createdAt: Date;

  @DateProperty({ transform: true, description: '게시글 수정일' })
  updatedAt: Date;

  @DateProperty({
    transform: true,
    nullable: true,
    description: '게시글 삭제일 (soft delete)',
  })
  deletedAt: Date | null;
}
