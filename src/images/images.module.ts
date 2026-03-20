import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { AuthModule } from '@/auth/auth.module';
import { AppConfigModule } from '@/shared/config/config.module';
import { ImagesRepository } from './images.repository';
import { ImageGcJob } from './images-gc.job';

@Module({
  imports: [AuthModule, AppConfigModule],
  providers: [ImagesService, ImagesRepository, ImageGcJob],
  controllers: [ImagesController],
  exports: [ImagesService, ImagesRepository],
})
export class ImagesModule {}
