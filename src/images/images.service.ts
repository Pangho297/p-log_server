import { AppConfigService } from '@/shared/config/app-config.service';
import { BlogException } from '@/shared/exceptions/define/blog.exception';
import { CloudflareDirectURLResponse, UUID } from '@/shared/types/common';
import { Injectable } from '@nestjs/common';
import { ImagesRepository } from './images.repository';
import { CreateDirectUrlOutputDto } from './dto/create-direct-url-output.dto';

@Injectable()
export class ImagesService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly imagesRepository: ImagesRepository,
  ) {}
  async createDirectUploadUrl({
    ownerUserId,
    purpose,
    postId,
  }: {
    ownerUserId: UUID;
    purpose?: 'post-content';
    postId?: UUID;
  }): Promise<CreateDirectUrlOutputDto> {
    const form = new FormData();
    form.append('requireSignedURLs', 'false'); // 공개 variant URL로 접근 가능
    form.append(
      'metadata',
      JSON.stringify({
        ownerUserId,
        purpose: purpose ?? 'post-content',
        postId: postId ?? null,
      }),
    ); // 이미지 레코드에 커스텀 메타데이터 저장

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.appConfigService.cloudflare.accountId}/images/v2/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.appConfigService.cloudflare.token}`,
        },
        body: form,
      },
    );

    const data: CloudflareDirectURLResponse = await res.json();

    if (!res.ok || !data?.success) {
      throw new BlogException('IMAGES', 'FAIL_TO_UPLOAD');
    }

    const imageId = data.result.id;
    const uploadURL = data.result.uploadURL;

    await this.imagesRepository.create({
      imageId,
      ownerUserId,
      postId: postId ?? null,
    });

    return {
      imageId,
      uploadURL,
      deliveryURL: `https://imagedelivery.net/${this.appConfigService.cloudflare.accountHash}/${imageId}/public`,
    };
  }
}
