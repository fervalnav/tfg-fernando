#!/usr/bin/env sh
set -eu

deployment_directory=/opt/lia
backup_directory="$deployment_directory/backups/postgres"
timestamp=$(date -u +%Y%m%dT%H%M%SZ)

mkdir -p "$backup_directory"
cd "$deployment_directory"

docker compose --env-file .env -f compose.yaml exec -T postgres \
  sh -c 'pg_dump --clean --if-exists --no-owner --username="$POSTGRES_USER" "$POSTGRES_DB"' \
  | gzip > "$backup_directory/lia-$timestamp.sql.gz"

find "$backup_directory" -type f -name 'lia-*.sql.gz' -mtime +7 -delete
