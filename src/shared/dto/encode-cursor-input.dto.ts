import { StringProperty } from '../decorator';
import { UUID } from '../types/common';

export class EncodeCursorInput {
  @StringProperty({
    description: 'Date ISO 문자열',
  })
  createdAt: string; // ISO 형식 Date 문자열

  @StringProperty({
    description: '데이터 식별자 UUID',
  })
  id: UUID;
}
