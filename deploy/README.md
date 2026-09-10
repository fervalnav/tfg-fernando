# Despliegue de producción de LIA

La topología utiliza una sola máquina Hetzner de bajo coste. Caddy es el único
servicio con puertos públicos. La web, la API, PostgreSQL y MinIO permanecen en
redes privadas de Docker. La API se publica bajo `/api` en el mismo origen que
la SPA; los documentos se descargan desde un segundo nombre DNS mediante URL
prefirmadas de corta duración.

## Decisión provisional sobre MinIO

El servidor se compila desde el código de
`RELEASE.2025-10-15T17-29-55Z`, última publicación de seguridad disponible antes
del archivo del proyecto comunitario. La etiqueta no dispone de imagen oficial,
por lo que `deploy/minio/Dockerfile` construye el binario exacto y el workflow lo
publica en el registro del proyecto. Se mantiene por decisión del autor para
minimizar el coste inicial y no debe sustituirse por `minio/minio:latest`. Antes
de considerar el entorno apto para una carga empresarial se deberá migrar a un
servicio S3 mantenido o justificar y probar otra alternativa.

## Servicios desplegados

| Servicio      | Exposición                              | Persistencia                         |
| ------------- | --------------------------------------- | ------------------------------------ |
| Caddy         | TCP 80 y 443                            | certificados y configuración interna |
| Web Nuxt      | solo red Docker                         | ninguna                              |
| API NestJS    | solo red Docker                         | ninguna                              |
| PostgreSQL 16 | solo red Docker                         | volumen `postgres_data`              |
| MinIO         | solo a través del dominio de documentos | volumen `minio_data`                 |

MailHog y Ollama no forman parte de producción. La aplicación coordina sus
casos de uso mediante el EventBus interno de NestJS, utiliza un servidor SMTP
externo y Google como proveedor de IA.

## Datos que faltan hasta disponer del dominio

Se reservarán dos nombres que apunten a la IPv4 e IPv6 del servidor:

- `APP_DOMAIN`, por ejemplo `lia.example.com`;
- `FILES_DOMAIN`, por ejemplo `files.lia.example.com`.

Caddy solicitará automáticamente los certificados cuando ambos registros DNS
resuelvan al servidor y los puertos 80 y 443 sean accesibles. No se debe iniciar
el Compose con los valores `example.com`.

## Configuración inicial del servidor

Después de aplicar `infra/hetzner`, esperar a que termine cloud-init:

```bash
ssh deploy@IP_DEL_SERVIDOR cloud-init status --wait
```

Crear la configuración local a partir del ejemplo y generar secretos
independientes. `openssl rand -base64 48` puede utilizarse para cada secreto.

```bash
cp deploy/.env.example deploy/.env
chmod 600 deploy/.env
```

Después de completar dominio, correo, Google, base de datos y almacenamiento,
copiar el fichero directamente; nunca se incorpora a Git ni se envía como
artefacto de GitHub Actions.

```bash
scp -i ~/.ssh/lia_hetzner deploy/.env deploy@IP_DEL_SERVIDOR:/opt/lia/.env
ssh -i ~/.ssh/lia_hetzner deploy@IP_DEL_SERVIDOR 'chmod 600 /opt/lia/.env'
```

El workflow ejecuta `scripts/validate-env.sh` antes de autenticarse en el
registro o modificar contenedores. El despliegue se detiene si falta una
variable obligatoria, quedan valores `replace_with_`, se conserva un dominio
`example.com` o no está configurado el proveedor de IA seleccionado.

## Secretos de GitHub

Crear un entorno protegido llamado `production` y registrar:

- `HETZNER_HOST`: IPv4 o nombre del servidor;
- `HETZNER_SSH_PRIVATE_KEY`: clave privada exclusiva de despliegue;
- `HETZNER_SSH_HOST_KEY`: línea completa y comprobada de `known_hosts`.

La huella debe comprobarse desde la consola de Hetzner antes de guardarla. El
workflow no usa `ssh-keyscan` automáticamente para no confiar en una clave no
verificada.

## Publicación

El workflow `Deploy production` solo se ejecuta manualmente. Construye las tres
imágenes, las publica en GHCR con el SHA del commit, copia únicamente los
ficheros públicos de Compose y arranca exactamente esa revisión. La API aplica
las migraciones pendientes antes de aceptar tráfico. Si la migración o un
`healthcheck` falla, Compose no marca el despliegue como correcto.

## Copias y restauración

La IaC activa siete copias rotatorias del disco en Hetzner. Además, un timer
genera cada noche un `pg_dump` lógico y conserva siete días en
`/opt/lia/backups/postgres`. Esos volcados comparten disco con el servidor y
solo constituyen una capa adicional para que la copia de Hetzner capture un
estado coherente de PostgreSQL; no sustituyen una copia externa independiente.

La restauración es una operación destructiva y debe realizarse durante una
ventana sin tráfico, después de conservar una copia del estado actual:

```bash
sudo systemctl start lia-backup.service
/opt/lia/scripts/restore-postgres.sh /opt/lia/backups/postgres/lia-TIMESTAMP.sql.gz
```

## Verificaciones posteriores

```bash
cd /opt/lia
docker compose --env-file .env -f compose.yaml ps
docker compose --env-file .env -f compose.yaml logs --tail=100 api caddy
curl --fail "https://APP_DOMAIN/api/health"
systemctl status lia-backup.timer
```

También se debe comprobar manualmente el registro, el acceso, una invitación,
la subida y descarga de un PDF, una generación por IA y el rechazo de la URL
directa del bucket sin firma.
