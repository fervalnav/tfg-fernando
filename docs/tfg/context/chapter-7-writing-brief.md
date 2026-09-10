# Guion verificable del capítulo 7

Preparado el 13 de agosto de 2026. Este documento organiza las evidencias ya
obtenidas sin cerrar todavía la comparación Flash frente a Flash-Lite.

## Estrategia narrativa

El capítulo debe explicar una estrategia por riesgos, no enumerar ficheros. La
evidencia se ordenará desde reglas aisladas hasta recorridos completos:

1. pruebas unitarias de entidades, servicios, guards y handlers;
2. pruebas de componentes y composables web con dependencias simuladas;
3. integración de repositorios, PostgreSQL, MinIO y adaptadores de IA;
4. API E2E con aplicación NestJS y PostgreSQL reales;
5. navegador E2E con Nuxt, API, PostgreSQL y MinIO;
6. banco experimental con documentos y modelos Gemini reales.

La figura `figure-sources/tikz/testing-levels.tex` representa estos niveles. El
fake determinista pertenece a las pruebas automatizadas; la evaluación de
calidad con modelos reales se presenta como una campaña separada y no como una
prueba funcional ordinaria.

## Casos representativos por riesgo

| Riesgo | Requisitos relacionados | Evidencia principal | Resultado estable |
|---|---|---|---|
| Sesión inválida, reutilización de refresh token y acceso cruzado | RF-001, RF-002, RN-001, RN-002, RN-011 | Unitarias de `AuthSessionService` y API E2E de registro, sesión y aislamiento | Superado |
| Escalada de privilegios en administración de cuenta | RF-003, RN-003 | Guard unitario y matriz API E2E ADMIN/MEMBER/autoeliminación | Superado |
| Estados o transiciones incoherentes de pipeline y workflow | RF-004, RF-005, RF-009, RN-004, RN-005, RN-007 | Entidades, handlers, eventos, API E2E y navegador E2E | Superado |
| Duplicación o cruce de instancias de cualificación | RF-006, RF-010, RN-006 | Servicios de instanciación y handlers de preguntas, campos y resúmenes | Superado |
| Persistencia de una salida de IA con forma incorrecta | RF-011, RF-015, RN-008, RNF-002, RNF-004 | Esquemas Zod, fake determinista y pruebas del adaptador Google | Superado en integración |
| Documento inseguro, no admitido o perteneciente a otra cuenta | RF-013, RF-014, RN-002, RN-009, RN-011, RN-012 | Handlers, almacenamiento, API E2E y navegador E2E de URL firmada/directa/caducada | Superado |
| Evaluación de solvencia incorrecta o no sustentada | RF-012, RF-016, RI-008 | Banco ficticio, tres repeticiones, dos revisiones ciegas | Parcial: Flash pendiente; Flash-Lite presenta dos alucinaciones críticas |

## Resultados automatizados que deben convertirse en tablas

### Validación local

| Nivel | Alcance | Resultado |
|---|---|---:|
| API unitarias/componentes | 37 suites | 142 pruebas superadas |
| Web unitarias/componentes | 11 archivos | 35 pruebas superadas |
| API E2E | NestJS y PostgreSQL | 12/12 |
| Navegador E2E | Nuxt, API, PostgreSQL, MinIO y fake IA | 4/4 |
| Calidad estática | tipos, lint y build | Superado; 13 avisos web no bloqueantes |

### Cobertura

| Aplicación | Líneas | Sentencias | Funciones | Ramas |
|---|---:|---:|---:|---:|
| API | 63,16 % | 62,53 % | 40,45 % | 34,59 % |
| Web | 9,17 % | 8,25 % | 4,86 % | 9,60 % |

El 9,17 % web no debe presentarse como indicador aislado de baja calidad. La
cobertura instrumentada se concentra en middleware, stores, validación,
composables y componentes con lógica. Los riesgos de integración que atraviesan
páginas completas se verifican mediante cuatro recorridos Playwright. Esto no
convierte la cifra en suficiente: deja como limitación la escasa regresión
unitaria visual y de páginas, pero evita afirmar que el 90,83 % restante carece
de toda prueba.

### Evaluación de IA

La tabla provisional está en
`apps/api/test/ai-evaluation/results/interim-report.md`. La versión publicable se
regenerará desde `aggregate.json` al completar las 28 salidas pendientes de
Flash. Hasta entonces no se seleccionará un modelo ganador ni se generalizarán
las métricas de las 32 salidas disponibles de Flash.

## Incidencias que deben explicarse

- Jest utiliza `forceExit` porque permanecen manejadores abiertos después de la
  suite E2E; es deuda técnica del entorno de prueba, no un caso fallido.
- Los E2E locales dieron `AggregateError` dentro del sandbox cuando no podían
  acceder a Docker/PostgreSQL; con acceso a la infraestructura superaron 12/12.
- La primera CI ocultó la causa del HTTP 500 de registro. Tras conservar el
  `cause`, se identificó la ausencia de `REFRESH_TOKEN_SECRET` en `setup-env`.
- La CI `31687608812` sobre `edaf585` confirmó la corrección completa.
- El lint web emite 13 avisos no bloqueantes; deben describirse como deuda de
  mantenimiento y no como errores ignorados.
- El piloto de Gemini alcanzó límites de 5 solicitudes por minuto. La campaña
  final añadió espera y reanudación; Flash agotó además la cuota diaria de la
  credencial, mientras Flash-Lite completó 60 salidas.
- La revisión ciega independiente detectó dos atribuciones no sustentadas que
  el primer revisor no había marcado. La reconciliación conserva ambas
  puntuaciones y adopta la valoración más estricta.

## Gráficos

La figura de niveles de prueba sí aporta contexto y debe incluirse. Un gráfico
de cobertura no mejora las dos filas de la tabla y se omite. La comparación de
modelos podrá representarse con calidad, coste y latencia cuando ambos tengan
60 salidas; dibujarla ahora produciría una comparación visual engañosa.

## Pendiente antes de redactar el capítulo como definitivo

- completar las 28 salidas de Flash;
- revisarlas dos veces de forma ciega y reconciliar desacuerdos;
- regenerar los agregados y la tabla definitiva;
- actualizar RF-012, RF-016 y RI-008 en la matriz de trazabilidad sin
  convertir una evaluación externa en persistencia interna inexistente.
