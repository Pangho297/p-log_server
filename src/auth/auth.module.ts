import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { UserService } from '@/user/user.service';
import { UserRepository } from '@/user/user.repository';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { TokenGuard } from '@/shared/auth/token.guard';
import { AppConfigModule } from '@/shared/config/config.module';

@Module({
  imports: [AppConfigModule],
  providers: [
    TokenGuard,
    JwtService,
    UserService,
    UserRepository,
    AuthService,
    AuthRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
