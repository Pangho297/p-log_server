import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { SWAGGER_FILE_PATH } from '@/consts';

/** Swagger 세팅
 *
 * @param app Nestjs Application
 */
export function setupSwagger(app: INestApplication) {
  const descriptionPath = join(
    process.cwd(),
    'src',
    'shared',
    'swagger',
    'description.md',
  );
  const description = readFileSync(descriptionPath, 'utf-8');

  const config = new DocumentBuilder()
    .setTitle(`Pangho's 블로그 프로젝트 API`)
    .setDescription(description)
    .setVersion('v1')
    .addBearerAuth(
      {
        type: 'http',
        name: 'Authorization',
        in: 'header',
      },
      '인증토큰',
    )
    .addTag('🙋 사용자', '/user 사용자 관리')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  writeFileSync(SWAGGER_FILE_PATH, JSON.stringify(document));

  console.log(
    `Swagger 파일이 생성되었습니다 경로는 ${SWAGGER_FILE_PATH} 입니다.`,
  );

  const options: SwaggerCustomOptions = {
    swaggerOptions: {
      docExpansion: 'none',
    },
  };

  SwaggerModule.setup('api/docs', app, document, options);
}
