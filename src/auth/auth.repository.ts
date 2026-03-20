import { DRIZZLE_DB } from '@/shared/db/db.token';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/shared/db/schema';
import { SaveTokenInputDto } from './dto/save-token-input.dto';
import { FindActiveByJtiInputDto } from './dto/find-active-by-jti-input.dto';
import { RefreshTokenEntity } from './token.entity';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { RevokeTokenByJtiInput } from './dto/revoke-token-by-jti-input.dto';
import { RotateRefreshTokenInputDto } from './dto/rotate-refresh-token-input.dto';
import { UnauthorizedException } from '@/shared/exceptions/validation';
import { hasher } from '@/shared/utils/hasher';

@Injectable()
export class AuthRepository {
  private readonly refreshTokenModel = schema.refresh_token_model;
  constructor(
    @Inject(DRIZZLE_DB)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async saveToken(input: SaveTokenInputDto): Promise<RefreshTokenEntity> {
    const [row] = await this.db
      .insert(this.refreshTokenModel)
      .values({
        ...input,
        revokedAt: input.revokedAt ?? null,
      })
      .onConflictDoUpdate({
        target: this.refreshTokenModel.jti,
        set: {
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
          revokedAt: input.revokedAt ?? null,
        },
      })
      .returning();

    return row;
  }

  async findActiveByJti(
    input: FindActiveByJtiInputDto,
  ): Promise<RefreshTokenEntity | null> {
    const [row] = await this.db
      .select()
      .from(this.refreshTokenModel)
      .where(
        and(
          eq(schema.refresh_token_model.jti, input.jti),
          isNull(this.refreshTokenModel.revokedAt),
          gt(this.refreshTokenModel.expiresAt, new Date()),
        ),
      );

    return row ?? null;
  }

  async revokeTokenByJti(
    input: RevokeTokenByJtiInput,
  ): Promise<RefreshTokenEntity | null> {
    const [row] = await this.db
      .update(this.refreshTokenModel)
      .set({ revokedAt: new Date() })
      .where(eq(this.refreshTokenModel.jti, input.jti))
      .returning();

    return row ?? null;
  }

  async rotateRefreshToken(input: RotateRefreshTokenInputDto) {
    await this.db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(this.refreshTokenModel)
        .where(eq(this.refreshTokenModel.jti, input.oldJti));

      if (!row || row.revokedAt)
        throw new UnauthorizedException('Refresh Token이 유효하지 않습니다.');

      if (row.expiresAt.getTime() < Date.now())
        throw new UnauthorizedException('Refresh Token이 만료되었습니다.');

      if (row.tokenHash !== hasher(input.oldRefreshToken))
        throw new UnauthorizedException('Refresh Token이 일치하지 않습니다.');

      const revoked = await tx
        .update(this.refreshTokenModel)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(this.refreshTokenModel.jti, input.oldJti),
            isNull(this.refreshTokenModel.revokedAt),
            gt(this.refreshTokenModel.expiresAt, new Date()),
          ),
        )
        .returning({ jti: this.refreshTokenModel.jti });

      if (revoked.length === 0) {
        // 이미 다른 요청이 먼저 재발급에 사용;
        throw new UnauthorizedException('이미 사용된 Refresh Token입니다.');
      }

      await tx.insert(this.refreshTokenModel).values(input.newRow);
    });
  }
}
