#!/usr/bin/env sh
set -eu

environment_file=${1:-/opt/lia/.env}

if [ ! -s "$environment_file" ]; then
  echo "Deployment environment file is missing or empty: $environment_file" >&2
  exit 1
fi

required_variables='APP_DOMAIN FILES_DOMAIN ACME_EMAIL API_IMAGE WEB_IMAGE MINIO_IMAGE DATABASE_NAME DATABASE_USER DATABASE_PASSWORD JWT_SECRET REFRESH_TOKEN_SECRET S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY S3_BUCKET AI_PROVIDER SMTP_HOST SMTP_PORT SMTP_FROM'

for variable_name in $required_variables; do
  if ! grep -Eq "^${variable_name}=.+$" "$environment_file"; then
    echo "Missing required deployment variable: $variable_name" >&2
    exit 1
  fi
done

if grep -Eq '(^|=).*example\.com($|[^[:alnum:]._-])|=replace_with_' "$environment_file"; then
  echo 'Deployment environment still contains example domains or placeholder values.' >&2
  exit 1
fi

app_domain=$(sed -n 's/^APP_DOMAIN=//p' "$environment_file")
files_domain=$(sed -n 's/^FILES_DOMAIN=//p' "$environment_file")

if [ "$app_domain" = "$files_domain" ]; then
  echo 'APP_DOMAIN and FILES_DOMAIN must be different.' >&2
  exit 1
fi

ai_provider=$(sed -n 's/^AI_PROVIDER=//p' "$environment_file")
case "$ai_provider" in
  google)
    if ! grep -Eq '^GOOGLE_GENERATIVE_AI_API_KEY=.+$' "$environment_file"; then
      echo 'GOOGLE_GENERATIVE_AI_API_KEY is required when AI_PROVIDER=google.' >&2
      exit 1
    fi
    ;;
  ollama)
    if ! grep -Eq '^AI_BASE_URL=.+$' "$environment_file"; then
      echo 'AI_BASE_URL is required when AI_PROVIDER=ollama.' >&2
      exit 1
    fi
    ;;
  *)
    echo "Unsupported AI_PROVIDER: $ai_provider" >&2
    exit 1
    ;;
esac

echo "Deployment environment validated for $app_domain."
