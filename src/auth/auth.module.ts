import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { TokenGuard } from '@/shared/auth/token.guard';
import { AppConfigModule } from '@/shared/config/config.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [AppConfigModule, forwardRef(() => UserModule)],
  providers: [TokenGuard, JwtService, AuthService, AuthRepository],
  controllers: [AuthController],
  exports: [AuthService, TokenGuard],
})
export class AuthModule {}
