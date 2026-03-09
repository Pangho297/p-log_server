import { createHash } from 'crypto';

export function hasher(input: string) {
  return createHash('sha256').update(input).digest('hex');
}
