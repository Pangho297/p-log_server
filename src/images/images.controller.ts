import { AccessAuth } from '@/shared/auth/access-auth.decorator';
import { User } from '@/shared/auth/user.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateDirectUrlInputDto } from './dto/create-direct-url-input.dto';
import { ImagesService } from './images.service';
import { CreateDirectUrlOutputDto } from './dto/create-direct-url-output.dto';

@ApiTags('🖼️ 이미지')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('direct-upload-url')
  @AccessAuth()
  @ApiOkResponse({
    type: CreateDirectUrlOutputDto,
  })
  @ApiOperation({
    summary: 'cloudflare direct url 요청',
    description: `
## Cloudflare Images의 \`uploadURL\`을 요청합니다.
Cloudflare Images의 업로드 방식은 다음과 같습니다.

1. 사용자가 이미지를 업로드할 수 있도록 **Cloudflare**에 \`uploadURL\` 요청
2. **Cloudflare**는 \`uploadURL\`을 사용자에게 전달
3. 사용자는 전달받은 \`uploadURL\`로 **Cloudflare**에 이미지를 직접 업로드
4. **Cloudflare**에 이미지 업로드 완료

여기서 블로그 서비스의 서버 작업이 추가되면 전체 과정은 아래와 같습니다

1. 사용자가 게시글에 이미지를 업로드 할 수 있도록 서버에 **Cloudflare** 업로드 URL 요청
2. 서버는 **Cloudflare**의 \`uploadURL\`을 받습니다
3. 이 때 **Cloudflare**는 \`uploadURL\`뿐만 아닌 업로드될 이미지의 \`imageId\`도 부여해줍니다
4. 서버는 \`imageId\`를 \`postId\`와 함께 **DB**에 \`temp\` 상태로 저장 후 사용자에게 전달(\`deliveryURL\` 포함)
5. 사용자는 전달받은 \`uploadURL\`을 이용해 **Cloudflare**에 이미지를 업로드
6. 이후 게시글 업로드 시 사용된 이미지를 판별하여 이미지 업로드 상태를 \`attached\`로 갱신
7. 서버는 **Cron**을 활용해 이미지 업로드 상태가 \`temp\`, \`delete_pending\` 상태인 이미지들을 **Cloudflare**에 삭제 요청 및 DB상태 갱신
    `,
  })
  async createDirectUploadUrl(
    @User() userId: string,
    @Body() body: CreateDirectUrlInputDto,
  ): Promise<CreateDirectUrlOutputDto> {
    return await this.imagesService.createDirectUploadUrl({
      ownerUserId: userId,
      postId: body.postId,
    });
  }
}
