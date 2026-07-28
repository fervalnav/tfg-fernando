# TFG — Plataforma de Gestión de Oportunidades Comerciales

Plataforma web SaaS B2B para gestión de oportunidades comerciales con CRM, pipelines configurables y workflows automatizados con IA.

Monorepo Turborepo con NestJS (backend) + Nuxt 4 SPA (frontend). Arquitectura Hexagonal + DDD + CQRS.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS 11, MikroORM 6, PostgreSQL |
| Frontend | Nuxt 4 SPA, Vue 3, Pinia, TanStack Query |
| Mensajería | RabbitMQ |
| Almacenamiento | AWS S3 (MinIO en local) |
| IA | Vercel AI SDK, OpenAI |
| Monorepo | Turborepo, pnpm workspaces |

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
make setup        # Copia .env.example → .env y levanta Docker (PostgreSQL + RabbitMQ + MinIO)
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
make up           # Inicia PostgreSQL + RabbitMQ + MinIO
make down         # Para los contenedores

# Migraciones
make migration-create   # Genera nueva migración
make migration-up       # Aplica pendientes
make migration-down     # Revierte última
make db-refresh         # Drop + re-run todas

# Health check
curl http://localhost:3000/api/health
```

## Módulos

- **Auth** — Registro, login/logout JWT, gestión de miembros y roles (`ADMIN` / `MEMBER`)
- **Pipelines** — Procesos de venta con estados configurables, vista kanban
- **Workflows** — Pasos y acciones que guían la ejecución de una oportunidad, con auto-ejecución por IA
- **Oportunidades** — Núcleo de la plataforma; vistas kanban, listado y detalle
- **CRM** — Organizaciones y contactos vinculados a oportunidades
- **Custom Fields** — Campos personalizados por cuenta, con relleno automático por IA
- **Control Questions** — Preguntas de verificación con respuesta manual o por IA
- **Summaries** — Resúmenes generados por IA o editables manualmente
- **Attachments** — Archivos vinculados a oportunidades, almacenados en S3
- **Tasks** — Tareas con prioridad y asignación de usuarios
- **Comments** — Comentarios con threading y menciones

## Arquitectura

El backend sigue Hexagonal Architecture + DDD + CQRS:

```
domain/         — Entidades, repositorios (interfaces), excepciones, value objects
application/    — Comandos y queries (handlers de CQRS)
infrastructure/ — Controladores HTTP, repositorios MikroORM, ORM entities
```

Las dependencias fluyen hacia adentro: `infrastructure → application → domain`.

Cada módulo tiene un `index.ts` que define su API pública. Las importaciones entre módulos solo pueden hacerse a través de ese barrel.
