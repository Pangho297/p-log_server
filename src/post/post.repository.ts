import { DRIZZLE_DB } from '@/shared/db/db.token';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/shared/db/schema';
import { Inject, NotFoundException } from '@nestjs/common';
import { CreatePostInputDto } from './dto/create-post-input.dto';
import { makeSuffix } from './utils';
import { BlogException } from '@/shared/exceptions/define/blog.exception';
import { PostDto } from './post.entity';
import slugify from '@sindresorhus/slugify';
import { DecodeCursorOutputDto } from '@/shared/dto/decode-cursor-output.dto';
import { and, desc, eq, isNull, lt, or } from 'drizzle-orm';
import { UpdatePostInputDto } from './dto/update-post-input.dto';

export class PostRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    input: CreatePostInputDto & { thumbnail: string },
    userId: string,
  ): Promise<PostDto> {
    const postModel = schema.post_model;

    // slug 생성 시 DB 충돌 방지를 위해 repository 계층에서 수행
    const slugBase = slugify(input.title, {
      transliterate: false, // 유니코드(한글) 유지
      lowercase: true, // 소문자
      separator: '_',
      decamelize: false,
    });

    const base = slugBase || 'post'; // 제목이 전부 제거되는 경우 대비

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const slug = `${base}_${makeSuffix()}`;

      try {
        const [row] = await this.db
          .insert(postModel)
          .values({
            userId,
            slug,
            thumbnail: input.thumbnail,
            title: input.title,
            content: input.content,
            tags: input.tags,
          })
          .returning();

        return row;
      } catch (error: any) {
        // Postgres unique violation: 23505
        // slug unique 인덱스 충돌이면 재시도, 그 외 에러는 즉시 throw
        if (
          error?.code === '23505' &&
          error?.constraint === 'post_slug_uq' &&
          String(error?.detail).includes('(slug)')
        ) {
          continue;
        }
        throw error;
      }
    }

    throw new BlogException('POST', 'CREATE_SLUG');
  }

  async getPostList(params: {
    limit: number;
    cursor?: DecodeCursorOutputDto;
  }): Promise<PostDto[]> {
    const { limit, cursor } = params;
    const postModel = schema.post_model;

    /** 커서 조건 (다음 페이지)
     * - 정렬: created_at DESC, id DESC
     * - 다음 페이지: (created_at < cursor.createdAt) OR (created_at = cursor.createdAt AND id < cursor.id)
     */
    const cursorCondition = cursor
      ? or(
          lt(postModel.createdAt, cursor.createdAt),
          and(
            eq(postModel.createdAt, cursor.createdAt),
            lt(postModel.id, cursor.id),
          ),
        )
      : undefined;

    /** limit + 1 조회로 hasNext 계산 */
    const rows = await this.db
      .select({
        id: postModel.id,
        userId: postModel.userId,
        slug: postModel.slug,
        title: postModel.title,
        content: postModel.content,
        tags: postModel.tags,
        createdAt: postModel.createdAt,
        updatedAt: postModel.updatedAt,
        deletedAt: postModel.deletedAt,
      })
      .from(postModel)
      .where(and(cursorCondition, isNull(postModel.deletedAt)))
      .orderBy(desc(postModel.createdAt), desc(postModel.id))
      .limit(limit + 1);

    return rows;
  }

  async getPostBySlug(slug: string): Promise<PostDto> {
    const postModel = schema.post_model;

    const row = await this.db.query.post_model.findFirst({
      where: and(eq(postModel.slug, slug), isNull(postModel.deletedAt)),
    });

    if (!row) {
      throw new NotFoundException('게시글이 존재하지 않습니다.');
    }

    return row;
  }

  async update(
    userId: string,
    slug: string,
    input: UpdatePostInputDto & { thumbnail: string },
  ): Promise<PostDto> {
    const postModel = schema.post_model;

    const hasTitle = input.title !== undefined;
    const hasContent = input.content !== undefined;
    const hasTags = input.tags !== undefined;

    if (!hasTitle && !hasContent && !hasTags) {
      throw new BlogException('POST', 'INPUT_IS_EMPTY');
    }

    // 2) 들어온 필드만 유효성 검사
    if (hasTitle && !input.title?.trim()) {
      throw new BlogException('POST', 'INPUT_IS_EMPTY');
    }

    if (hasContent && !input.content?.trim()) {
      throw new BlogException('POST', 'INPUT_IS_EMPTY');
    }

    if (
      input.tags &&
      (input.tags.length === 0 || input.tags.some((tag) => !tag?.trim()))
    ) {
      throw new BlogException('POST', 'INPUT_IS_EMPTY');
    }

    const [row] = await this.db
      .update(postModel)
      .set({
        title: input.title,
        content: input.content,
        tags: input.tags,
      })
      .where(
        and(
          eq(postModel.userId, userId),
          eq(postModel.slug, slug),
          isNull(postModel.deletedAt),
        ),
      )
      .returning();

    if (!row) {
      throw new BlogException('POST', 'POST_NOT_FOUND');
    }

    return row;
  }

  async delete(userId: string, slug: string) {
    const postModel = schema.post_model;

    const [row] = await this.db
      .update(postModel)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(postModel.userId, userId),
          eq(postModel.slug, slug),
          isNull(postModel.deletedAt),
        ),
      )
      .returning();

    if (!row) {
      throw new BlogException('POST', 'POST_NOT_FOUND');
    }

    return row;
  }
}
