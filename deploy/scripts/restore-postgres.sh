#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /opt/lia/backups/postgres/lia-TIMESTAMP.sql.gz" >&2
  exit 1
fi

backup_file=$1
deployment_directory=/opt/lia

if [ ! -f "$backup_file" ]; then
  echo "Backup not found: $backup_file" >&2
  exit 1
fi

cd "$deployment_directory"
gzip -dc "$backup_file" | docker compose --env-file .env -f compose.yaml exec -T postgres \
  sh -c 'psql --set ON_ERROR_STOP=on --username="$POSTGRES_USER" "$POSTGRES_DB"'
