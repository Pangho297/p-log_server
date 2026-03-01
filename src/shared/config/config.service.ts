import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  constructor(@Inject('ENV_LOADER') _loaded: boolean) {}

  public DATABASE_URL: string = '';

  // .env 파일 외에도 설정이나 환경변수 등을 가져올 일이 있는지 모르겠음...
  // 굳이 필요 없다면 ConfigModule을 제거하고 그냥 AppModule에서 설정해도 될지도?

  public async load() {
    this.DATABASE_URL = await this.getEnvValue('DATABASE_URL');
  }

  private async getEnvValue(key: string): Promise<string> {
    const envValue = process.env[key];

    if (!envValue) {
      throw new Error(`${key}를 찾을 수 없습니다.`);
    }

    return envValue;
  }
}
