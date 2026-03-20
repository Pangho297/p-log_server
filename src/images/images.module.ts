import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { AuthModule } from '@/auth/auth.module';
import { AppConfigModule } from '@/shared/config/config.module';
import { ImagesRepository } from './images.repository';

@Module({
  imports: [AuthModule, AppConfigModule],
  providers: [ImagesService, ImagesRepository],
  controllers: [ImagesController],
  exports: [ImagesService],
})
export class ImagesModule {}
