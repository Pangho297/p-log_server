import { DateProperty, StringProperty } from '../decorator';
import { UUID } from '../types/common';

export class DecodeCursorOutputDto {
  @DateProperty({
    description: 'decode된 Date 객체',
  })
  createdAt: Date;

  @StringProperty({
    description: '데이터 식별자 UUID',
  })
  id: UUID;
}
