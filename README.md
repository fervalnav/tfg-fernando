# LIA — Integración de IA para análisis automático de licitaciones

Plataforma web multiempresa para gestionar y cualificar licitaciones públicas como oportunidades comerciales mediante pipelines, workflows configurables, documentos PDF e inteligencia artificial generativa.

Monorepo Turborepo con NestJS (backend) + Nuxt 4 SPA (frontend). Arquitectura Hexagonal + DDD + CQRS.

## Stack

| Capa                   | Tecnología                                                                      |
| ---------------------- | ------------------------------------------------------------------------------- |
| Backend                | NestJS 11, MikroORM 6, PostgreSQL                                               |
| Frontend               | Nuxt 4 SPA, Vue 3, Pinia, TanStack Query                                        |
| Coordinación asíncrona | Eventos internos de NestJS CQRS                                                 |
| Almacenamiento         | AWS S3 (MinIO en local)                                                         |
| IA                     | Vercel AI SDK, Google Generative AI y proveedores compatibles con OpenAI/Ollama |
| Monorepo               | Turborepo, pnpm workspaces                                                      |

## Estructura

```
apps/
  api/        — Backend NestJS (Hexagonal + DDD + CQRS)
  web/        — Frontend Nuxt 4 SPA
packages/
  types/               — DTOs y tipos compartidos (TS puro)
  typescript-config/   — tsconfig base compartido
  eslint-config/       — ESLint compartido
```

## Setup inicial

### Requisitos

- Node 26.1.0 (versión fijada en `.nvmrc`)
- pnpm 11.1.2
- Docker

### Primera vez

```bash
nvm use           # Siempre antes de ejecutar comandos Node/pnpm; lee .nvmrc
make setup        # Copia .env.example → .env y levanta Docker (PostgreSQL + MinIO + MailHog)
pnpm install
make migration-up # Aplica migraciones
pnpm dev          # Levanta api + web
```

### Variables de entorno

Copia los `.env.example` de cada app:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

## Comandos

```bash
# Desarrollo
pnpm dev          # Levanta api + web en paralelo
pnpm dev:api      # Solo backend  → http://localhost:3000
pnpm dev:web      # Solo frontend → http://localhost:3001
pnpm build        # Build completo
pnpm lint         # ESLint en todos los paquetes

# Infraestructura (Docker)
make up           # Inicia PostgreSQL + MinIO + MailHog
make down         # Para los contenedores

# Migraciones
make migration-create   # Genera nueva migración
make migration-up       # Aplica pendientes
make migration-down     # Revierte última
make db-refresh         # Drop + re-run todas

# Health check
curl http://localhost:3000/api/health
```

## Despliegue

La preparación del entorno económico de producción se divide en dos partes:

- [`infra/hetzner`](infra/hetzner/README.md) crea el servidor, el firewall y el
  usuario de despliegue mediante OpenTofu o Terraform;
- [`deploy`](deploy/README.md) define los contenedores, HTTPS, copias y el
  despliegue manual desde GitHub Actions.

La configuración no crea recursos por sí sola. El alta del servidor requiere
un `terraform apply` explícito y el despliegue necesita un dominio y los
secretos del entorno `production`.

## Módulos

- **Auth** — Registro, login/logout JWT, gestión de miembros y roles (`ADMIN` / `MEMBER`)
- **Pipelines** — Procesos de venta con estados configurables, vista kanban
- **Workflows** — Pasos y acciones que guían la ejecución de una oportunidad, con auto-ejecución por IA
- **Oportunidades** — Núcleo de la plataforma; vistas kanban, listado y detalle
- **Custom Fields** — Campos personalizados por cuenta, con relleno automático por IA
- **Control Questions** — Preguntas de verificación con respuesta manual o por IA
- **Summaries** — Resúmenes generados por IA o editables manualmente
- **Attachments** — Documentos PDF vinculados a oportunidades, almacenados en S3/MinIO y utilizados como contexto de IA

La importación automática de licitaciones, el CRM de organizaciones y
contactos, las tareas, los comentarios, las notificaciones y la exportación a
PDF no forman parte del núcleo implementado.

## Arquitectura

El backend sigue Hexagonal Architecture + DDD + CQRS:

```
domain/         — Entidades, repositorios (interfaces), excepciones, value objects
application/    — Comandos y queries (handlers de CQRS)
infrastructure/ — Controladores HTTP, repositorios MikroORM, ORM entities
```

Las dependencias fluyen hacia adentro: `infrastructure → application → domain`.

Cada módulo tiene un `index.ts` que define su API pública. Las importaciones entre módulos solo pueden hacerse a través de ese barrel.
