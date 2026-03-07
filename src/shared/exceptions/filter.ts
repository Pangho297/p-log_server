import {
  ArgumentsHost,
  BadRequestException,
  ExceptionFilter,
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

    // 로깅
    const { ip, url, method, headers, query, params, body } = request;

    console.log(body);
    console.log(query);
    console.log(url);
    console.log(ip);
    console.log(exception);
    console.log(exception.message);

    // 500 에러 처리
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ip,
      url,
      method,
      headers,
      query,
      params,
      body,
      exception,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message,
      response: exception.getResponse(),
      timestamp: new Date().toISOString(),
      error: '서버 오류가 발생했습니다.',
    });
  }
}
