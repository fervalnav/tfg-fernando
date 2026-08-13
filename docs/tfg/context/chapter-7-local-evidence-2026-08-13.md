# Evidencia local previa al capítulo 7 — 13 de agosto de 2026

Este resumen conserva la regeneración local realizada antes de cerrar el
capítulo 7. La base de Git era
`d8a12ee415bbc46b96246ffc5e94a26adcd9702e`, con cambios de trabajo todavía sin
confirmar. Debe sustituirse por la revisión definitiva después del commit y de
una ejecución satisfactoria de CI.

## Entorno

- macOS.
- Node.js 26.1.0 cargado mediante `nvm use`.
- pnpm 11.1.2.
- PostgreSQL 16 y MinIO locales para las suites E2E.

## Comandos y resultados

```bash
nvm use
pnpm exec turbo run test:cov --force
```

- API: 37 suites y 142 pruebas superadas.
- Cobertura API: 63,16 % de líneas, 62,53 % de sentencias, 40,45 % de
  funciones y 34,59 % de ramas.
- Web: 11 archivos y 35 pruebas superadas.
- Cobertura web: 9,17 % de líneas, 8,25 % de sentencias, 4,86 % de funciones y
  9,60 % de ramas.
- Turborepo indicó cero tareas recuperadas de caché.

```bash
nvm use
pnpm test:e2e:api
```

- 12 de 12 casos superados contra PostgreSQL.
- Incluye la matriz de permisos de administración para `ADMIN` y `MEMBER` y la
  protección frente a la autoeliminación.
- Jest mantiene el aviso de `forceExit` por manejadores abiertos.

```bash
nvm use
pnpm test:e2e:browser
```

- 4 de 4 casos superados con Chromium, PostgreSQL, MinIO y proveedor de IA
  determinista.
- El recorrido principal comprueba que la URL directa del objeto devuelve 403,
  que la URL firmada vigente permite descargar y que la misma URL devuelve 403
  tras caducar.

```bash
nvm use
pnpm exec turbo run check-types lint build --force
git diff --check
```

- Tipos, lint y build superados sin caché.
- El lint web conserva 13 avisos no bloqueantes en componentes UI.
- `git diff --check` no detectó errores de espacios.

## CI remota

La ejecución histórica `31639676403` superó tipos, lint, pruebas, cobertura y
build, pero falló en el registro de los E2E de API. Su log envolvía el error real
en un HTTP 500. En la revisión de trabajo se han serializado dos escrituras que
compartían `EntityManager`, se ha conservado la causa interna en el error de
registro y se ha alineado la CI con PostgreSQL 16. La corrección no se considera
validada hasta publicar la revisión y obtener un workflow satisfactorio.
