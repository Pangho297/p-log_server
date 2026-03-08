import { ISO_DATETIME, TRUE_VALUES, FALSE_VALUES } from '@/shared/constants';
import { isValid, parseISO } from 'date-fns';

export function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();

    if (TRUE_VALUES.includes(lower)) {
      return true;
    }

    if (FALSE_VALUES.includes(lower)) {
      return false;
    }
  }

  return Boolean(value);
}

export function toString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';

  return String(value);
}

export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);

  if (isNaN(parsed)) {
    throw new Error(`값을 숫자로 변경할 수 없습니다: ${value}`);
  }

  return parsed;
}

export function toDate(value: unknown): Date {
  if (value instanceof Date) {
    if (!isValid(value))
      throw new Error(`유효하지 않은 Date 객체입니다. (Invalid Date)`); // `Invalid Date`도 타입상 Date는 맞으나 값으로써 유효한 Date 객체는 아님
    return value;
  }

  if (typeof value !== 'string') {
    throw new Error(
      `날짜 형식으로 변경할 수 없습니다 ISO 형식의 string 날짜를 입력해 주세요: ${value}`,
    );
  }
  const input = value.trim();

  if (!ISO_DATETIME.test(input)) {
    throw new Error(`UTC 기준 ISO(예: 2026-03-07T12:00:00Z)만 허용됩니다.`);
  }

  const date = parseISO(input);
  if (!isValid(date)) {
    throw new Error(`잘못된 ISO 형식의 string 입니다 ${value}`);
  }

  return date;
}
