import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { PORT, SERVER_ENV } from './consts';
import { setupSwagger } from './shared/swagger/setup';
import { ValidationException } from './shared/exceptions/validation';
import { AllInOneExceptionFilter } from './shared/exceptions/filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = PORT;

  app.useGlobalFilters(new AllInOneExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        // exceptionFactory: 유효성 검사 실패 시, 기본 예외(BadRequestException) 대신
        // 커스텀 ValidationException을 던져서 에러 응답을 일관되게 관리할 수 있게 함
        throw new ValidationException(errors);
      },
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  setupSwagger(app);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  console.log(`서버가 ${SERVER_ENV}환경으로 ${port}포트에서 실행되었습니다 🚀`);
  await app.listen(port); // PORT 3000은 Web에서 사용
}

bootstrap();
