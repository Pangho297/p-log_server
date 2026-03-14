import { BooleanProperty, NumberProperty, StringProperty } from '../decorator';

export class PaginateOutputDto {
  @NumberProperty({
    description: '현재 설정된 최대 표출 개수 (페이지 사이즈)',
    transform: true,
  })
  limit: number;

  @BooleanProperty({
    description: '다음 페이지 존재 여부, `nextCursor`도 함께 확인해 주세요',
  })
  hasNext: boolean;

  @StringProperty({
    description: '다음 페이지 `Cursor Key`',
    nullable: true,
  })
  nextCursor: string | null;
}
