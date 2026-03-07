import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../base';

export type ErrorContext = {
  errorMessage: string;
  statusCode: number;
  errorCode: string;
};

type ErrorTypeShape = Record<string, Record<string, ErrorContext>>;

export const errorMapper = {
  POST: {
    UNAUTHORIZED: {
      errorMessage: '게시글 작성 권인이 없습니다.',
      statusCode: HttpStatus.FORBIDDEN,
      errorCode: 'POST_10000',
    },
  },
} as const satisfies ErrorTypeShape;

export type ErrorMapper = typeof errorMapper;
export type ModuleName = keyof ErrorMapper;
export type ErrorCode<M extends ModuleName> = keyof ErrorMapper[M];
export type AnyErrorCode = {
  [K in ModuleName]: keyof ErrorMapper[K];
}[ModuleName];

export class BlogException<
  M extends ModuleName,
  C extends ErrorCode<M>,
> extends BaseException {
  constructor(module: M, code: C, payload?: any) {
    const info = errorMapper[module][code] as ErrorContext;
    super(info.errorMessage, info.statusCode, info.errorCode, {
      group: module,
      payload,
    });
  }
}
