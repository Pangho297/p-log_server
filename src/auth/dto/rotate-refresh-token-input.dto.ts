import { NestedProperty, StringProperty } from '@/shared/decorator';
import { SaveTokenInputDto } from './save-token-input.dto';

export class RotateRefreshTokenInputDto {
  @StringProperty()
  oldJti: string;

  @StringProperty()
  oldRefreshToken: string;

  @NestedProperty({ type: SaveTokenInputDto })
  newRow: SaveTokenInputDto;
}
