import {
  ArgumentsHost,
  BadRequestException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { extractHttpContext } from './utils';
import { ValidationException } from './validation';
import { BaseException } from './base';

export class AllInOneExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    /** NestJS 11.x 버전에서 예외 필터 체이닝에 이슈가 있다는 보고가 올라옴
     *
     * 떄문에 모든 예외를 처리하는 필터를 만들어서 사용함
     */
    const { response, request } = extractHttpContext(host);

    // ValidationException 처리
    if (exception instanceof ValidationException) {
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: '유효성 검사 실패',
        errors: exception.errors,
      });

      return;
    }

    // BadRequestException 처리
    if (exception instanceof BadRequestException) {
      const res = exception.getResponse();

      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message:
          typeof res === 'object' && res !== null && 'message' in res
            ? (res as any).message
            : res,
      });

      return;
    }

    // NotFoundException 처리
    if (exception instanceof NotFoundException) {
      const res = exception.getResponse();

      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: '요청하신 데이터를 찾을 수 없습니다.',
        response: res,
      });

      return;
    }

    // BaseException 처리
    if (exception instanceof BaseException) {
      response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        message: exception.message,
        errorCode: exception.errorCode,
        timestamp: exception.timestamp,
        path: exception.path,
        payload: exception.payload,
      });

      return;
    }

    const isHttp = exception instanceof HttpException;
    const isDev = process.env.SERVER_ENV === 'development';

    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttp
      ? exception.getResponse()
      : {
          message: 'DB 요청 처리 중 오류가 발생했습니다',
          dbError: {
            name: exception?.name,
            code: exception?.code ?? exception?.cause?.code, // ECONNREFUSED, 23505
            message: exception?.message,
            detail: isDev ? exception?.cause?.detail : undefined, // 개발 환경에서만 노출, 그렇지 않을 경우 민감 정보 노출 위험 존재
          },
        };

    const normalizedResponseBody =
      typeof responseBody === 'string'
        ? { message: responseBody }
        : (responseBody as { message?: string; dbError?: unknown });

    const message = normalizedResponseBody.message ?? '예상치 못한 오류 발생';

    // 로깅
    console.error({
      path: request.url,
      method: request.method,
      status,
      exception,
    });

    // 500 에러 처리
    response.status(status).json({
      statusCode: status,
      message,
      ...(normalizedResponseBody?.dbError
        ? { dbError: normalizedResponseBody.dbError }
        : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
