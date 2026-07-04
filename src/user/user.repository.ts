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
  private readonly userModel = schema.user_model;
  constructor(
    @Inject(DRIZZLE_DB)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  // 유저 생성
  async create(input: CreateUserInputDto): Promise<UserDto> {
    // service 계층에서 비밀번호 해싱되어 받아 DB에 저장
    try {
      const [row] = await this.db
        .insert(this.userModel)
        .values(input)
        .returning(); // 생성 결과물 배출
      return {
        id: row.id,
        email: row.email,
      };
    } catch (e) {
      if (e?.cause?.code === '23505') {
        throw new ConflictException('이미 사용 중인 이메일 입니다.');
      }

      throw e;
    }
  }

  // 유저 조회 예시 코드
  async findUserByEmail(email: string) {
    const row = await this.db.query.user_model.findFirst({
      where: eq(this.userModel.email, email),
    });

    return row ?? null;
  }

  async findUserById(userId: string) {
    const row = await this.db.query.user_model.findFirst({
      where: eq(this.userModel.id, userId),
      columns: {
        id: true,
        email: true,
      },
    });

    if (!row) {
      throw new NotFoundException('사용자 계정을 찾을 수 없습니다.');
    }

    return row;
  }

  async verifyAccount(input: VerifyUserInputDto): Promise<UserDto> {
    const row = await this.db.query.user_model.findFirst({
      where: and(
        eq(this.userModel.email, input.email),
        eq(this.userModel.password, input.password),
      ),
      columns: {
        id: true,
        email: true,
      },
    });

    if (!row) {
      throw new NotFoundException('가입된 계정을 찾을 수 없습니다.');
    }

    return row;
  }
}
