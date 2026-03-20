import { StringProperty } from '@/shared/decorator';

export class CreateDirectUrlOutputDto {
  @StringProperty({
    description:
      '업로드될 이미지의 Id, 클라이언트 측에서 이미지가 업로드되면 반영될 이미지의 Id',
  })
  imageId: string;

  @StringProperty({
    description:
      'Cloudflare 업로드 URL, 클라이언트 측은 이 URL로 이미지를 직접 업로드해야 합니다',
  })
  uploadURL: string;

  @StringProperty({
    description:
      '업로드될 이미지의 URL, 업로드가 완료되면 이미지를 표시할 수 있는 URL이 됩니다.',
  })
  deliveryURL: string;
}
