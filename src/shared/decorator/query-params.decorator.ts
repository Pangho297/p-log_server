import { Query, ValidationPipe } from '@nestjs/common';

export function QueryParams(): ParameterDecorator {
  return Query(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );
}
