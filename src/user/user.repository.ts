import { DRIZZLE_DB } from '@/shared/db/db.token';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/shared/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DRIZZLE_DB)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  // 유저 생성 예시 코드
  async create(input) {
    try {
      const [row] = await this.db
        .insert(schema.user_model)
        .values(input)
        .returning(); // 생성 결과물 배출
      return row;
    } catch (e) {
      if (e?.code === '23505') {
        throw new ConflictException('이미 사용 중인 이메일 입니다.');
      }

      throw e;
    }
  }

  // 유저 조회 예시 코드
  async findByEmail(email: string) {
    const row = await this.db.query.user_model.findFirst({
      where: eq(schema.user_model.email, email),
    });

    return row ?? null;
  }
}
