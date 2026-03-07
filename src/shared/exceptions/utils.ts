import { ArgumentsHost } from '@nestjs/common';

export function extractHttpContext(host: ArgumentsHost) {
  const http = host.switchToHttp();
  return {
    response: http.getResponse(),
    request: http.getRequest(),
  };
}
