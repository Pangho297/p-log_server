import { NumberProperty, StringProperty } from '../decorator';

export class PaginateInputDto {
  @NumberProperty({
    description: '최대 표출 개수 (페이지 사이즈)',
    optional: true,
    transform: true,
  })
  limit?: number;

  @StringProperty({
    description:
      '페이지 좌표 (페이지 넘버) `Cursor Meta`를 사용 중이므로 클라이언트는 직접 `cursor`를 작성하는 것이아닌 서버에서 내려준 `nextCursor`를 사용해야 합니다',
    optional: true,
  })
  cursor?: string;
}
