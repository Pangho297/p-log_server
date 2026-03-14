import { BadRequestException } from '@nestjs/common';
import { EncodeCursorInput } from '../dto/encode-cursor-input.dto';
import { DecodeCursorOutputDto } from '../dto/decode-cursor-output.dto';
import { CombinedPaginate } from '../dto/combined-paginate.dto';

export async function normalizeLimit(raw?: number): Promise<number> {
  const DEFAULT_LIMIT = 20;
  const MAX_LIMIT = 100;

  if (!raw) return DEFAULT_LIMIT;
  if (!Number.isInteger(raw) || raw <= 0) {
    throw new BadRequestException('limit은 1 이상의 정수여야 합니다.');
  }

  return Math.min(raw, MAX_LIMIT);
}

export function encodeCursor(payload: EncodeCursorInput) {
  return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
}

export async function decodeCursor(
  cursor: string,
): Promise<DecodeCursorOutputDto> {
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as EncodeCursorInput;

    if (!parsed?.createdAt || !parsed?.id) {
      throw new BadRequestException('cursor 형식이 올바르지 않습니다.');
    }

    const createdAt = new Date(parsed.createdAt);

    return { createdAt: createdAt, id: parsed.id };
  } catch {
    throw new BadRequestException('cursor 형식이 올바르지 않습니다.');
  }
}

export function createCursorMeta<T extends DecodeCursorOutputDto>(
  rows: T[],
  limit: number,
): CombinedPaginate<T> {
  const hasNext = rows.length > limit;
  const items = hasNext ? rows.slice(0, limit) : rows;
  const nextCursor =
    hasNext && items.length > 0
      ? encodeCursor({
          createdAt: items[items.length - 1].createdAt.toISOString(),
          id: items[items.length - 1].id,
        })
      : null;

  return {
    items,
    meta: {
      limit,
      hasNext,
      nextCursor,
    },
  };
}
