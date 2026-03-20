import { HttpException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

interface IBaseException {
  errorCode: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

export class BaseException extends HttpException implements IBaseException {
  constructor(
    errorMessage: string,
    statusCode: number,
    errorCode: string,
    { group, payload }: { group?: string; payload?: any } = {},
  ) {
    super(errorMessage, statusCode);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
    this.group = group ?? 'ERROR';
    this.payload = payload;
  }

  @ApiProperty()
  group?: string;

  @ApiProperty()
  errorCode: string;

  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  payload?: any;
}
