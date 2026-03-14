import { ArrayProperty, NestedProperty } from '../decorator';
import { PaginateOutputDto } from './paginate-output.dto';

export class CombinedPaginate<T> {
  @ArrayProperty({
    type: Object,
    description: '페이지 네이트가 적용된 리스트 목록',
  })
  items: T[];

  @NestedProperty({
    type: PaginateOutputDto,
    description: '`Cursor Meta` 페이지 네이트',
  })
  meta: PaginateOutputDto;
}
