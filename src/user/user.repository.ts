import { DRIZZLE_DB } from '@/shared/db/db.token';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/shared/db/schema';
import { and, eq } from 'drizzle-orm';
import { CreateUserInputDto } from './dto/create-user.dto';
import { VerifyUserInputDto } from './dto/verify-user-input.dto';
import { UserDto } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DRIZZLE_DB)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  // 유저 생성
  async create(input: CreateUserInputDto): Promise<UserDto> {
    // service 계층에서 비밀번호 해싱되어 받아 DB에 저장
    const userModel = schema.user_model;
    try {
      const [row] = await this.db.insert(userModel).values(input).returning(); // 생성 결과물 배출
      return {
        id: row.id,
        email: row.email,
      };
    } catch (e) {
      if (e?.code === '23505') {
        throw new ConflictException('이미 사용 중인 이메일 입니다.');
      }

      throw e;
    }
  }

  // 유저 조회 예시 코드
  async findUserByEmail(email: string) {
    const userModel = schema.user_model;
    const row = await this.db.query.user_model.findFirst({
      where: eq(userModel.email, email),
    });

    return row ?? null;
  }

  async verifyAccount(input: VerifyUserInputDto): Promise<UserDto> {
    console.log({ input });
    const userModel = schema.user_model;
    const row = await this.db.query.user_model.findFirst({
      where: and(
        eq(userModel.email, input.email),
        eq(userModel.password, input.password),
      ),
    });

    if (!row) {
      throw new NotFoundException('가입된 계정을 찾을 수 없습니다.');
    }

    return row;
  }
}
