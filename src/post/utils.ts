import { customAlphabet } from 'nanoid';

export const makeSuffix = customAlphabet(
  'abcdefghijklmnopqrstuvwxyz0123456789',
  6,
);
