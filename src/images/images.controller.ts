import { AccessAuth } from '@/shared/auth/access-auth.decorator';
import { User } from '@/shared/auth/user.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateDirectUrlInputDto } from './dto/create-direct-url-input.dto';
import { ImagesService } from './images.service';

@ApiTags('🖼️ 이미지')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('direct-upload-url')
  @AccessAuth()
  async createDirectUploadUrl(
    @User() userId: string,
    @Body() body: CreateDirectUrlInputDto,
  ) {
    return console.log('Test');
  }
}
