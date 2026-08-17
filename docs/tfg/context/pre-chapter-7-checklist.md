# Lista de cierre antes del capítulo 7

Revisión iniciada el 12 de agosto de 2026 sobre `main` y actualizada el 13 de
agosto con el cierre técnico previo. Su objetivo es cerrar las evidencias antes de
redactar resultados de pruebas. No forma parte de la memoria publicable.

## Recomendación de avance

No conviene redactar todavía el capítulo 7 como capítulo cerrado. Es el primer
capítulo cuyo contenido depende de ejecuciones, métricas y resultados externos;
si se escribe antes de resolver los puntos críticos, habrá que rehacer tablas,
trazabilidad y conclusiones.

El orden recomendado es:

1. completar esta lista de cierre técnico y experimental;
2. redactar y cerrar el capítulo 7 con resultados regenerados;
3. estabilizar la identidad visual y preparar el conjunto de datos ficticios;
4. completar el capítulo 8 y todas sus capturas;
5. realizar una revisión conjunta de los capítulos 1 a 8;
6. redactar los capítulos 9 y 10 y efectuar la revisión final completa.

El siguiente punto de control amplio debe situarse, por tanto, después del
capítulo 8. Los capítulos 9 y 10 dependen de los resultados de pruebas y de la
versión funcional que finalmente documente el manual.

## Estado verificado en esta revisión

- [x] `pnpm test:cov` finaliza correctamente sin caché de Turborepo: 37 suites y
  142 pruebas de API, y 11 archivos y 35 pruebas web, superados.
- [x] Cobertura API: 63,16 % de líneas, 62,53 % de sentencias, 40,45 % de
  funciones y 34,59 % de ramas.
- [x] Cobertura web: 9,17 % de líneas, 8,25 % de sentencias, 4,86 % de
  funciones y 9,60 % de ramas.
- [x] E2E de API local: 12 de 12 casos superados contra PostgreSQL, incluida la
  matriz de autorización administrativa.
- [x] E2E de navegador local: 4 de 4 casos superados con PostgreSQL, MinIO y
  proveedor de IA determinista; el recorrido principal también verifica firma,
  acceso directo y caducidad de la descarga documental.
- [x] `pnpm check-types`, `pnpm lint` y `pnpm build` finalizan correctamente sin
  caché de Turborepo.
- [x] El lint mantiene 13 avisos no bloqueantes en componentes reutilizables
  de la interfaz.
- [x] CI remota validada. La ejecución `31687608812` finaliza correctamente en
  la revisión `edaf585`, incluidas las 12 pruebas API E2E que antes fallaban.

## Bloqueos antes de redactar resultados

### 1. Integración continua y entorno de base de datos

- [x] Confirmar el diagnóstico del HTTP 500 del registro en GitHub Actions. El
  log de la ejecución `31686791310` identifica la ausencia de
  `REFRESH_TOKEN_SECRET`; se ha añadido un valor exclusivo de prueba a
  `test/setup-env.ts`, junto con el secreto de acceso ya existente.
- [x] Alinear la versión de PostgreSQL: Docker local y la definición de CI usan
  `postgres:16-alpine`. Falta publicar y ejecutar la revisión para confirmar si
  esta diferencia explicaba el HTTP 500.
- [x] Obtener al menos una ejecución completa y satisfactoria del workflow de
  CI sobre la revisión `edaf585` que se citará en el capítulo 7.
- [x] Registrar la revisión de Git y el resultado remoto: `78ab280` supera la
  CI completa en la ejecución `31689863930`; fecha, comandos y resultados se
  conservan en `chapter-7-local-evidence-2026-08-13.md`. La revisión final de
  la campaña cambiará al incorporar las 28 salidas de Flash pendientes.

### 2. Autorización administrativa

- [x] Restringir a `ADMIN` la invitación, el cambio de rol y la eliminación de
  miembros mediante un guard aplicado a los tres endpoints.
- [x] Añadir casos E2E que demuestren permisos permitidos para `ADMIN` y rechazo
  para `MEMBER`, incluyendo la protección frente a la autoeliminación.
- [x] Actualizar RF-003, RN-003 y su trazabilidad después de ejecutar esos casos.

### 3. Evaluación experimental de IA

- [x] Seleccionar cinco casos completamente ficticios y redistribuibles, con
  PDF identificados mediante SHA-256.
- [x] Completar `evaluation-cases.json` con hechos y respuestas esperadas antes
  de ejecutar ningún modelo.
- [x] Confirmar la comparación entre `gemini-3-flash-preview` y
  `gemini-3.1-flash-lite` mediante credenciales de Google disponibles.
- [x] Asignar la segunda revisión ciega a un agente Codex independiente y
  documentar expresamente que no se trata de una revisión humana.
- [ ] Ejecutar tres repeticiones por caso y operación. Flash-Lite ha completado
  60/60 y Flash 32/60; las 28 salidas de Flash restantes están pendientes de
  otro reinicio de su cuota diaria gratuita. Resultados, latencia, tokens y
  piloto de cuota se conservan por separado.
- [x] Obtener y congelar las tarifas oficiales de Google vigentes el 13 de
  agosto de 2026, con fuente, USD y modelo exacto.
- [ ] Calcular la comparación final cuando termine Flash. Las 92 salidas
  disponibles tienen dos revisiones reconciliadas: Flash alcanza
  provisionalmente 7,75/8, 100 % de validez y ninguna alucinación en 32
  salidas; Flash-Lite mantiene 7,53/8, 100 % de validez y dos alucinaciones
  críticas en 60.

### 4. Métricas operativas de IA

- [x] Decidir que proveedor, modelo, duración y tokens no se persistirán dentro
  de LIA en este cierre; OE-002 se demostrará mediante el banco experimental.
- [ ] Si se implementa la persistencia, añadir entidad o registro, migración,
  consulta y pruebas antes de cerrar RF-016.
- [x] Mantener RF-016 como parcial y describir la
  observabilidad operativa como limitación y trabajo futuro. La evaluación
  externa debe seguir realizándose para poder valorar el objetivo OE-002.

## Coherencia técnica que debe resolverse

### Política temporal

- [x] Resolver la contradicción entre la regla que exige Temporal API para la
  lógica de negocio y el uso generalizado de `Date` en entidades y servicios.
- [x] Adoptar una política incremental: Temporal para nueva aritmética temporal;
  `Date` admitido en código histórico, persistencia y DTO, sin migración lateral.
- [x] Actualizar después `AGENTS.md`, la documentación técnica y las pruebas
  afectadas. No debe quedar una regla que el código incumpla de forma global.

### Almacenamiento de documentos

- [x] Retirar durante el arranque cualquier política pública `s3:GetObject` y
  presentar el acceso mediante URL prefirmada como protección efectiva.
  mediante URL prefirmadas como la protección efectiva del sistema.
- [x] Añadir una prueba de navegador que compruebe acceso firmado autorizado,
  caducidad y rechazo del acceso directo no firmado.

### Alcance y planes internos

- [x] Actualizar las casillas del Sprint 8 con el alcance real: los cuatro
  mecanismos de IA tienen pruebas de aplicación, pero el E2E de navegador
  ejecuta la generación de resumen y trata preguntas y campos manualmente.
- [x] Separar el pulido de entrega de las notificaciones del Sprint 12. Las
  notificaciones están fuera del núcleo confirmado y no deben convertirse en
  requisito previo para terminar el TFG.
- [x] Mantener organizaciones, contactos, comentarios, tareas y exportación
  PDF como trabajo futuro; no abrir nuevos sprints funcionales antes del cierre.

## Preparación específica del capítulo 7

- [ ] Congelar la revisión definitiva. Todas las suites locales ya se han
  regenerado sin caché y su resumen reproducible se conserva en
  `chapter-7-local-evidence-2026-08-13.md`, todavía sobre un árbol sin commit.
- [x] Seleccionar casos representativos por riesgo y vincularlos con RF, RN y
  RNF en `chapter-7-writing-brief.md`, sin enumerar archivos como estrategia.
- [x] Separar unitarias, componentes, integración, API E2E, navegador E2E y
  evaluación experimental de IA en el guion verificable del capítulo.
- [x] Preparar tablas de casos y resultados y la figura
  `figure-sources/tikz/testing-levels.tex`. Se descarta un gráfico de cobertura
  por redundante y se aplaza el de modelos hasta completar Flash.
- [x] Explicar el 9,17 % de cobertura web junto con los cuatro recorridos E2E,
  los riesgos cubiertos y la limitación de regresión unitaria visual.
- [x] Documentar las incidencias reales: `forceExit`, acceso local a Docker,
  diferencia local/CI, secreto E2E ausente, cuotas Gemini y 13 avisos de lint.
- [x] Actualizar la matriz de trazabilidad del capítulo 3 con los resultados
  automatizados y experimentales disponibles. RF-012, RF-016, RI-008 y RNF-008
  permanecen parciales y deberán revisarse al completar Flash.

## Trabajo que puede esperar

Estos elementos no bloquean el capítulo 7 y deben cerrarse en su iteración:

- presupuesto del MacBook Pro, servicios de IA y licencias;
- criterio del coste de personal: los 25,67 euros por hora aparecen como tarifa
  de un perfil desarrollador en contratación pública, no como coste medio del
  mercado; debe decidirse si se conserva como tarifa de referencia o se calcula
  el coste desde las tablas salariales de 2026;
- porcentaje empresarial del presupuesto: el 29,9 % debe recalcularse o
  justificarse con la normativa de 2026, que añade conceptos como el mecanismo
  de equidad intergeneracional y puede requerir la prima por contingencias
  profesionales;
- fecha definitiva de portada y fechas naturales del proyecto;
- despliegue real, si finalmente se realiza;
- agradecimientos y enlace definitivo al repositorio;
- conclusiones, resumen y abstract definitivos.

## Preparación antes del capítulo 8

- [x] Adoptar una identidad textual sencilla de LIA y retirar la marca
  provisional Tendios de las pantallas que aparecerán en el manual.
- [x] Crear un conjunto coherente de usuarios, cuenta, licitaciones, pipelines,
  workflows, preguntas, campos, resúmenes y PDFs completamente ficticios.
- [ ] Revisar estados de carga, error, vacío y comportamiento responsive de los
  recorridos que aparecerán en el manual.
- [x] Capturar todos los flujos estables con la misma resolución, recorte y
  estilo visual, incluida la autenticación con la identidad de LIA.
- [x] Documentar únicamente la puesta en marcha local mientras no exista un
  despliegue real verificado.
