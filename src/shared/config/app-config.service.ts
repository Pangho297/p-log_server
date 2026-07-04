import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get app() {
    return {
      serverEnv: this.config.getOrThrow<string>('app.serverEnv'),
      port: this.config.getOrThrow<number>('app.port'),
      ownerUserId: this.config.getOrThrow<string>('app.ownerUserId'),
    };
  }

  get dbUrl(): string {
    return this.config.getOrThrow<string>('db.url');
  }

  get jwtSecret() {
    return {
      accessSecret: this.config.getOrThrow<string>('jwt.accessSecret'),
      refreshSecret: this.config.getOrThrow<string>('jwt.refreshSecret'),
    };
  }

  get cloudflare() {
    return {
      accountId: this.config.getOrThrow<string>('cloudflare.accountId'),
      token: this.config.getOrThrow<string>('cloudflare.token'),
      accountHash: this.config.getOrThrow<string>('cloudflare.accountHash'),
    };
  }
}
