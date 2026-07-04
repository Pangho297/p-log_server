import { StringProperty } from '@/shared/decorator';

export class CreateImagesInputDto {
  @StringProperty({
    description:
      '업로드될 이미지 URL, 클라이언트측에서 업로드를 수행하지 않았다면 업로드되진 않음 업로드 추적 용 값',
  })
  imageId: string;

  @StringProperty({ description: '업로드를 시도한 사용자 Id' })
  ownerUserId: string;

  @StringProperty({
    description: '업로드를 시도한 게시글 Id',
    optional: true,
    nullable: true,
  })
  postId?: string | null;
}
