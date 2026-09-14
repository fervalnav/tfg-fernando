# Evidencia local previa al capítulo 7 — 13 de agosto de 2026

Este resumen conserva la regeneración local realizada antes de cerrar el
capítulo 7. El cierre técnico se publicó en `532d85c` y la corrección definitiva
del entorno E2E y el banco experimental v2 en `edaf585`.

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
build, pero ocultó la causa del HTTP 500 de registro. La ejecución
`31686791310`, con el registro de causa mejorado, identificó que faltaba
`REFRESH_TOKEN_SECRET` en el entorno E2E aislado. Tras añadir un secreto
exclusivo de prueba, la ejecución
[31687608812](https://github.com/fervalnav/tfg-fernando/actions/runs/31687608812)
finalizó correctamente sobre `edaf585`: instalación, tipos, lint, unitarias,
cobertura, build y 12 pruebas API E2E superadas.

La revisión posterior `78ab280`, que incorpora los resultados experimentales
provisionales y ambas revisiones ciegas, también quedó validada íntegramente por
la ejecución
[31689863930](https://github.com/fervalnav/tfg-fernando/actions/runs/31689863930).

## Evaluación experimental de IA

- Banco v2 aprobado por un segundo agente antes de revisar salidas: cinco casos,
  siete PDF, 16 páginas y hashes SHA-256 congelados.
- `gemini-3.1-flash-lite`: 60 de 60 salidas ejecutadas, todas con esquema válido.
- `gemini-3-flash-preview`: 32 de 60 salidas ejecutadas, todas con esquema
  válido; la cuota diaria de Google limitó el tamaño final de la muestra.
- El piloto de cuota se conserva separado y no se agrega a la comparación final.
- Las 92 salidas disponibles se han aleatorizado para dos revisiones ciegas.

Continuación del 17 de agosto de 2026: la cuota de Flash se restableció y
permitió ejecutar otras 22 salidas antes de agotarse de nuevo. Flash queda en
32/60, sin errores. Las 22 nuevas obtuvieron dos revisiones ciegas y se
reconciliaron con las 70 anteriores: la calidad de Flash es 7,75/8, con 100 %
de validez y sin alucinaciones detectadas. La decisión final utiliza Flash para
resúmenes y Flash-Lite para las otras tres operaciones evaluadas.
