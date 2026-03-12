import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/db/db.module';
import { ConfigModule } from './shared/config/config.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, UserModule, PostModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
