import { ArrayProperty, NestedProperty } from '../decorator';
import { PaginateOutputDto } from './paginate-output.dto';

export class CombinedPaginate<T> {
  @ArrayProperty({
    type: Object,
    description: '데이터 목록',
  })
  items: T[];

  @NestedProperty({
    type: PaginateOutputDto,
    description: '`Cursor Meta` 페이지 네이트',
  })
  meta: PaginateOutputDto;
}
