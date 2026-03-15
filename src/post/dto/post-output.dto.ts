import { OmitType } from '@nestjs/swagger';
import { PostDto } from '../post.entity';

export class PostOutputDto extends OmitType(PostDto, [
  'updatedAt',
  'deletedAt',
]) {}
