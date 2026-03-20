import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { AuthModule } from '@/auth/auth.module';
import { PostRepository } from './post.repository';
import { ImagesRepository } from '@/images/images.repository';

@Module({
  imports: [AuthModule],
  providers: [PostService, PostRepository, ImagesRepository],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
