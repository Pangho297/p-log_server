import { PartialType } from '@nestjs/swagger';
import { CreatePostInputDto } from './create-post-input.dto';

export class UpdatePostInputDto extends PartialType(CreatePostInputDto) {}
