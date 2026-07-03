import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { SWAGGER_FILE_PATH } from '@/consts';
import { ACCESS_TOKEN_COOKIE_NAME } from '@/shared/auth/utils';

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
    .addCookieAuth(
      ACCESS_TOKEN_COOKIE_NAME,
      {
        type: 'apiKey',
        name: ACCESS_TOKEN_COOKIE_NAME,
        in: 'cookie',
      },
      'accessTokenCookie',
    )
    .addTag('🔐 인증', '/auth 인증')
    .addTag('🙋 사용자', '/user 사용자 관리')
    .addTag('📄 게시글', '/post 게시글 관리')
    .addTag('🖼️ 이미지', '/images 이미지 업로드')
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
