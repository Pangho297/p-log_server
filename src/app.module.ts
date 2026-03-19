import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/db/db.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { ImagesModule } from './images/images.module';
import { ConfigModule } from '@nestjs/config';
import env from './shared/config/env';
import { validateEnv } from './shared/config/env.validation';
import { AppConfigModule } from './shared/config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [`.env.${process.env.SERVER_ENV ?? 'development'}`, '.env'],
      load: [env],
      validate: validateEnv,
    }),
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    PostModule,
    ImagesModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
