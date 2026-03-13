import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { AuthModule } from '@/auth/auth.module';
import { PostRepository } from './post.repository';

@Module({
  imports: [AuthModule],
  providers: [PostService, PostRepository],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
