# PostgreSQL 백업 설정

운영 서버에서 PostgreSQL을 Docker Compose로 실행하는 경우, Lightsail Auto snapshots와 별개로 논리 백업을 함께 둔다.

## 백업 스크립트

서버의 `~/apps/p-log/backup-postgres.sh`에 생성한다.

```bash
#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$HOME/apps/p-log"
BACKUP_DIR="$HOME/backups/postgres"
DB_SERVICE="postgres"
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"
cd "$APP_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/p_log_${TIMESTAMP}.sql.gz"

docker-compose exec -T "$DB_SERVICE" sh -c 'pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --no-owner \
  --no-privileges' \
  | gzip > "$BACKUP_FILE"

find "$BACKUP_DIR" -type f -name 'p_log_*.sql.gz' -mtime +"$RETENTION_DAYS" -delete
```

서버 compose의 DB 서비스명이 `postgres`가 아니라면 스크립트의 `DB_SERVICE` 값을 실제 서비스명으로 바꾼다.

실행 권한을 부여한다.

```bash
chmod +x ~/apps/p-log/backup-postgres.sh
```

## 수동 백업 테스트

```bash
cd ~/apps/p-log
./backup-postgres.sh
ls -lh ~/backups/postgres
```

## cron 등록

매일 새벽 3시 20분에 백업한다.

```bash
crontab -e
```

```cron
20 3 * * * /home/admin/apps/p-log/backup-postgres.sh >> /home/admin/backups/postgres/backup.log 2>&1
```

서버 사용자가 `admin`이 아니면 경로의 `/home/admin`을 실제 홈 디렉토리로 바꾼다.

## 복구 예시

```bash
gunzip -c ~/backups/postgres/p_log_YYYYMMDD_HHMMSS.sql.gz \
  | docker-compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```
