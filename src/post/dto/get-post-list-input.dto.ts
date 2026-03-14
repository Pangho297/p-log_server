import { BooleanProperty } from '@/shared/decorator';
import { PaginateInputDto } from '@/shared/dto/paginate-input.dto';

export class GetPostListInputDto extends PaginateInputDto {
  @BooleanProperty({
    description: '최신 게시글 목록 조회',
    optional: true,
  })
  showRecent?: true;

  @BooleanProperty({
    description:
      '인기 게시글 목록 조회, 아직 계획 중인 설정... 심지어 post에 view도 안찍음...',
    optional: true,
  })
  showBest?: true;
}
