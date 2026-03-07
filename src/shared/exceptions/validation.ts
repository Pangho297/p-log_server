import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationException extends HttpException {
  public readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(errors, HttpStatus.UNPROCESSABLE_ENTITY);
    this.errors = errors;
    this.name = 'ValidationException';
  }

  public static create(message: string) {
    const validationError = new ValidationError();
    validationError.constraints = {
      notfound: message,
    };

    return new ValidationException([validationError]);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message?: string) {
    super(message || '인증이 필요합니다.', HttpStatus.UNAUTHORIZED);
  }
}
