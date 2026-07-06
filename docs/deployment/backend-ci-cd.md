# Backend CI/CD

GitHub Actions에서 백엔드 NestJS 애플리케이션을 빌드 검증한 뒤 Docker Hub에 이미지를 push하고, Lightsail 서버에서 `backend` 서비스만 갱신한다.

## GitHub Secrets

Repository secrets에 아래 값을 등록한다.

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
LIGHTSAIL_HOST
LIGHTSAIL_USER
LIGHTSAIL_SSH_KEY
LIGHTSAIL_DEPLOY_PATH
```

운영 값 예시:

```text
LIGHTSAIL_USER=admin
LIGHTSAIL_DEPLOY_PATH=/home/admin/apps/p-log
```

`LIGHTSAIL_DEPLOY_PATH`가 비어 있으면 workflow는 기본값으로 `~/apps/p-log`를 사용한다.

애플리케이션 실행에 필요한 환경변수는 GitHub Actions build args가 아니라 Lightsail 서버의 백엔드 env 파일에서 관리한다.

```text
SERVER_ENV=production
PORT=3001
OWNER_USER_ID=<owner-user-uuid>
DATABASE_URL=postgres://<user>:<password>@db:5432/<database>
JWT_ACCESS_SECRET=<access-token-secret>
JWT_REFRESH_SECRET=<refresh-token-secret>
CF_ACCOUNT_ID=<cloudflare-account-id>
CF_IMAGES_TOKEN=<cloudflare-images-token>
CF_ACCOUNT_HASH=<cloudflare-account-hash>
```

## Docker Hub 이미지

workflow는 아래 두 태그를 push한다.

```text
<DOCKERHUB_USERNAME>/p-log-backend:latest
<DOCKERHUB_USERNAME>/p-log-backend:<commit-sha>
```

## 서버 docker-compose.yml

Lightsail 서버의 `docker-compose.yml`에서 `backend` 서비스는 Docker Hub 이미지를 사용해야 한다.

```yaml
backend:
  image: <DOCKERHUB_USERNAME>/p-log-backend:latest
  container_name: p-log-backend
  restart: unless-stopped
  env_file:
    - backend.env
  ports:
    - '127.0.0.1:3001:3001'
  depends_on:
    db:
      condition: service_healthy
```

`build:` 설정이 남아 있으면 서버에서 로컬 빌드를 시도할 수 있으므로 운영 compose에서는 `image:` 기준으로 관리한다.

PostgreSQL을 같은 compose에서 운영하는 경우 `DATABASE_URL`의 host는 DB 서비스명인 `db`를 사용한다.

## 배포 흐름

`main` 브랜치에 push되거나 workflow를 수동 실행하면 다음 순서로 진행된다.

```text
1. pnpm install --frozen-lockfile
2. pnpm build
3. Docker image build and push
4. Lightsail SSH 접속
5. docker-compose pull backend
6. docker-compose up -d backend
7. docker-compose exec -T backend pnpm db:migrate
8. docker image prune -f
```

마이그레이션은 새 백엔드 컨테이너가 올라온 뒤 실행된다. `drizzle` 디렉터리와 `drizzle.config.ts`는 Docker 이미지에 포함되어 있어 컨테이너 내부에서 `pnpm db:migrate`를 실행할 수 있다.
