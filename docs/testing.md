# Estrategia de testing

Esta guía describe la evidencia técnica reproducible del proyecto. No sustituye el análisis de resultados de la memoria del TFG.

## Pirámide de pruebas

1. **Unitarias de dominio y aplicación**: reglas de negocio, handlers, errores, reintentos y aislamiento por cuenta. Son rápidas y no acceden a servicios externos.
2. **Componentes y composables web**: comportamiento visible, navegación, filtros, mutaciones, estados y caché con la red simulada en el límite HTTP.
3. **E2E de API**: aplicación NestJS real y PostgreSQL aislado, con datos creados por cada prueba y proveedores externos sustituidos por fakes.
4. **E2E de navegador**: un recorrido crítico completo con Chromium, API y web reales, PostgreSQL/MinIO locales y proveedor de IA fake.

La cobertura porcentual es una señal auxiliar. La prioridad está en los riesgos funcionales: autenticación, aislamiento multiempresa, workflows, cualificación, adjuntos y fallos de IA.

## Requisitos

- Node `26.1.0`, cargado con `nvm use`.
- pnpm `11.1.2`.
- PostgreSQL para los E2E de API.
- PostgreSQL y MinIO (`make up`) para el E2E de navegador.
- Chromium de Playwright, instalable una vez con `pnpm --filter @tfg/web exec playwright install chromium`.

Las bases E2E se crean y regeneran automáticamente. Su nombre debe cumplir el patrón protegido `tfg_*e2e*`; nunca se reutiliza una base de producción.

## Comandos

Desde la raíz, después de `source /Users/fernandovaldesnavarro/.nvm/nvm.sh && nvm use`:

```bash
pnpm test                 # Unitarias y componentes
pnpm test:cov             # Cobertura backend y frontend
pnpm test:e2e:api         # E2E HTTP de NestJS
pnpm test:e2e:browser     # Recorrido Playwright
pnpm check-types
pnpm lint                 # Solo comprueba; no modifica archivos
pnpm build
```

El E2E de API usa por defecto PostgreSQL en `localhost:5432`, usuario `tfg_user`, contraseña `tfg_password` y base `tfg_e2e`. Se puede configurar con `E2E_DATABASE_HOST`, `E2E_DATABASE_PORT`, `E2E_DATABASE_USER`, `E2E_DATABASE_PASSWORD` y `E2E_DATABASE_NAME`.

La configuración E2E cierra explícitamente MikroORM y Nest. Jest se ejecuta con `forceExit` por una incompatibilidad observada entre Jest 30 y Node 26: después del cierre, el diagnóstico de handles solo conserva los streams estándar, pero el runner no finaliza por sí mismo.

## Fakes y fixtures

- `FakeAiGenerationService` devuelve objetos deterministas validados contra el esquema solicitado. Solo puede activarse fuera de producción con `AI_PROVIDER=fake`.
- Los E2E HTTP sustituyen almacenamiento y proveedor de IA dentro del módulo de pruebas, por lo que no necesitan MinIO ni una API externa.
- El E2E de navegador activa el proveedor fake y utiliza `apps/web/tests/fixtures/anuncio-e2e.pdf`, un PDF mínimo sin datos sensibles.
- Las pruebas del adaptador MinIO simulan `StorageService`; comprueban la delegación de subida, descarga, URL y borrado sin acceder a almacenamiento real.

No deben guardarse tokens, respuestas facturables, informes de Playwright, cobertura ni builds en Git.

## Cobertura funcional

La suite incluye, entre otros:

- registro, sesión, login, credenciales inválidas y rutas protegidas;
- creación, consulta, filtros y mutaciones de oportunidades;
- estados de pipeline y configuración de workflow;
- asignación, progreso, `skip` y reintento de acciones;
- preguntas de control, campos personalizados y resúmenes;
- generación fake, validación estructurada, errores y contexto documental como `Buffer`;
- subida, listado, descarga y borrado de PDFs;
- recursos inexistentes y aislamiento por `accountId`;
- middleware de autenticación, serialización de filtros y estados visibles del workflow;
- recorrido de navegador desde registro hasta cierre de sesión.

## Limitaciones pendientes

- Playwright cubre un recorrido crítico principal; no pretende duplicar todos los casos negativos ya cubiertos en API y componentes.
- El E2E de navegador requiere MinIO local porque verifica la integración real de subida. El E2E de API usa almacenamiento en memoria y es el que se ejecuta en CI.
- La suite contiene código de producción anterior basado en `Date`, aunque la política actual exige Temporal API. Esta contradicción se documenta y no se resuelve mediante una migración lateral dentro del trabajo de testing.
- Los servicios externos reales de IA no forman parte de ninguna suite automática; sus credenciales y disponibilidad quedan fuera del alcance de las pruebas reproducibles.

## Integración continua

`.github/workflows/ci.yml` levanta PostgreSQL y ejecuta instalación bloqueada, tipos, lint no mutante, unitarias, cobertura, build y E2E de API. No utiliza secretos ni servicios de producción. El E2E de navegador se mantiene como comprobación local hasta incorporar un servicio MinIO reproducible al workflow.
