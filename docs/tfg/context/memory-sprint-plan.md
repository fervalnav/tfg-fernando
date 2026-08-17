# Plan iterativo de desarrollo de la memoria

Este plan organiza la redacción de la memoria en iteraciones propias. No debe
confundirse con los sprints de desarrollo del producto. Las iteraciones no
tienen una duración fija: cada una termina cuando se cumplen sus criterios de
salida y se resuelven las preguntas necesarias con el autor.

## Estado inicial

La estructura LaTeX, la portada, una primera introducción, dos diagramas, las
capturas de autenticación y los esqueletos de los capítulos ya existen. El resto
de la memoria no debe rellenarse de forma lineal sin antes estabilizar alcance,
requisitos y evidencias.

## Iteración M0 - Alcance, fuentes e inventario de evidencias

**Estado:** completada el 6 de agosto de 2026. El resultado se conserva en
`context/scope-evidence-inventory.md`.

### Objetivo

Crear una base fiable para que los capítulos posteriores no se contradigan.

### Trabajo

- Resolver la discrepancia sobre si las licitaciones públicas forman parte del
  alcance implementado del TFG. Resuelto: constituyen el dominio central; su
  descubrimiento o importación automática queda excluido.
- Sincronizar el estado real de los sprints 8 y 9 con el repositorio.
- Confirmar que los sprints opcionales 10 y 11 quedan fuera del núcleo.
- Crear una matriz de funcionalidades: implementada, parcial, futura o fuera de
  alcance.
- Identificar fuentes bibliográficas necesarias y decisiones que requieren una
  respuesta del autor.
- Corregir afirmaciones desactualizadas del README y de los documentos de
  alcance antes de utilizarlas como evidencia.

### Salida

Alcance congelado, fuentes jerarquizadas y lista de preguntas abiertas.

## Iteración M1 - Contexto, motivación y objetivos

**Estado:** completada el 6 de agosto de 2026. El análisis de las memorias de
referencia se conserva en `context/reference-m1-analysis.md`; el resumen y el
abstract permanecen deliberadamente provisionales hasta la iteración M8.

### Capítulos

- Resumen y abstract provisionales.
- Capítulo 1: introducción.

### Trabajo

- Investigar y citar el contexto de contratación pública y análisis de pliegos.
- Describir el problema sin atribuir cifras no verificadas.
- Conectar la motivación con la propuesta registrada.
- Delimitar alcance y exclusiones.
- Revisar el diagrama funcional de análisis de licitaciones.

### Salida

Introducción coherente con el alcance confirmado. El resumen seguirá siendo
provisional hasta conocer los resultados finales.

## Iteración M2 - Planificación, esfuerzo y costes

**Estado:** en curso. La metodología Scrum, el plan de diez sprints, la
distribución de 320 horas y el coste de personal están redactados. La
valoración económica queda pendiente de completar con el precio y la fecha de
adquisición del MacBook Pro M4 Pro y con los servicios de pago realmente
utilizados.

### Capítulos

- Capítulo 2: planificación y costes.

### Trabajo

- Explicar la adaptación de Scrum al trabajo individual.
- Resumir los sprints de producto y sus entregables.
- Preparar cronograma o Gantt.
- Distribuir con el autor las 320 horas totales entre desarrollo, pruebas,
  memoria y defensa.
- Documentar incidencias y ajustes reales de la planificación.
- Calcular costes solo con precios, amortizaciones y proveedores confirmados.

### Dependencias

Estado real de los sprints y decisiones de alcance cerradas en M0.

## Iteración M3 - Requisitos y trazabilidad

**Estado:** completada el 12 de agosto de 2026 y actualizada el 13 de agosto. El
catálogo de actores, requisitos funcionales, requisitos de información, reglas
de negocio y requisitos no funcionales está redactado. La autorización
administrativa ya está implementada y probada. Permanecen parciales la
evaluación documental de solvencia y la comparación de métricas de IA.

### Capítulos

- Capítulo 3: análisis de requisitos.

### Trabajo

- Confirmar actores y permisos.
- Catalogar requisitos funcionales, de información, reglas de negocio y
  requisitos no funcionales.
- Relacionar los objetivos registrados con los requisitos.
- Construir la matriz objetivo-requisito-módulo-prueba.
- Identificar requisitos sin implementación o sin prueba.

### Backlog técnico detectado

1. Ejecutar el banco de evaluación de solvencia con documentos y respuestas
   esperadas definidos previamente.
2. Ejecutar la comparación de calidad, latencia y coste. La persistencia de
   métricas queda como trabajo futuro y RF-016 permanece parcial.

### Salida

Catálogo estable y trazable. Los huecos detectados alimentan el backlog técnico.

## Iteración M4 - Análisis y diseño

**Estado:** completada el 12 de agosto de 2026. El diseño adopta la perspectiva
previa al desarrollo y reserva las capturas reales para el manual de usuario.
Los modelos, secuencias y wireframes cubren por separado todas las secciones de
cualificación, además del acceso, la cartera de oportunidades, la configuración
que las alimenta y la selección y comparación de proveedores de IA.

### Capítulos

- Capítulo 4: análisis del sistema.
- Parte visual del capítulo 5.

### Trabajo

- Modelo de dominio de cuentas, oportunidades, pipelines, workflows,
  cualificación, IA y adjuntos.
- Casos de uso o historias representativas.
- Diagramas de secuencia para autenticación, asignación de workflow, generación
  por IA y subida de documentos.
- Proceso de negocio de cualificación de una licitación.
- Diagrama de navegación e interfaces principales.
- Wireframes conceptuales de acceso, oportunidades, detalle, documentación,
  preguntas de control, campos personalizados, resúmenes, workflow y catálogos
  de configuración.

### Salida

Conjunto pequeño de diagramas legibles y coherentes con el código.

## Iteración M5 - Arquitectura e implementación

**Estado:** completada. El capítulo 5 documenta la vista de componentes, el
monorepositorio, las arquitecturas del backend y el frontend, la persistencia,
los adjuntos, la integración de IA y la topología local verificada. El capítulo
6 desarrolla la sesión multiempresa, la cartera, la ejecución de workflows, la
cualificación, la generación estructurada, el contexto documental y los
reintentos a partir del código implementado.

### Capítulos

- Capítulo 5: arquitectura.
- Capítulo 6: implementación.

### Trabajo

- Explicar componentes, dependencias y decisiones.
- Documentar backend, frontend, persistencia, almacenamiento e IA.
- Seleccionar flujos técnicos que demuestren la aportación del proyecto.
- Comparar alternativas solo cuando exista evidencia de que fueron valoradas.
- Documentar errores, reintentos y aislamiento por cuenta.

### Salida

Arquitectura reproducible y descripción de implementación centrada en
decisiones, no en un inventario de archivos.

## Iteración M6 - Pruebas y validación

**Estado:** redactada de forma verificable el 17 de agosto de 2026. Las pruebas
automatizadas, la cobertura y la integración continua están cerradas. La
evaluación experimental se presenta como resultado parcial porque la cuota de
Google dejó 28 de las 60 salidas de Flash pendientes; no se selecciona un
modelo ganador.

### Capítulos

- Capítulo 7: pruebas.

### Trabajo documental

- Definir estrategia y niveles de prueba.
- Seleccionar casos vinculados con requisitos críticos.
- Generar tablas de resultados y cobertura actualizadas.
- Documentar incidencias encontradas y corregidas.
- Evaluar la IA con documentos, criterios y resultados reproducibles.

### Trabajo técnico previo

Completado:

- E2E de API con autenticación, workflows, adjuntos, cualificación y
  aislamiento multiempresa.
- Cuatro escenarios E2E de navegador mediante Playwright: un recorrido
  principal de cualificación con resumen generado por IA, autenticación,
  validación de formularios y diferenciación entre error y estado vacío.
- Pruebas de componentes, composables y casos de uso de frontend y backend.
- Integración determinista con IA y almacenamiento mediante fakes, además de
  verificación local con PostgreSQL y MinIO.
- Umbrales mínimos de cobertura para impedir regresiones silenciosas.

Completado como trabajo experimental de la memoria:

- Banco congelado con cinco expedientes ficticios y cuatro operaciones por
  expediente.
- Métricas de calidad, validez, latencia, tokens y coste para las salidas
  disponibles, con dos revisiones ciegas independientes y reconciliación.

Pendiente:

- Ejecutar y revisar las 28 salidas restantes de Flash cuando exista cuota.
- Regenerar la comparación final sin alterar los resultados parciales.

### Salida

Capítulo basado en ejecuciones verificables, no en expectativas.

## Iteración M7 - Manuales y capturas

**Estado:** completada el 17 de agosto de 2026. El capítulo documenta la
puesta en marcha local y los recorridos funcionales mediante datos y archivos
ficticios. El despliegue público permanece aplazado hasta disponer de un
entorno verificable.

### Capítulos

- Capítulo 8: manuales.

### Trabajo

- Estabilizar identidad visual y sustituir la marca provisional si procede.
- Documentar puesta en marcha local.
- Validar un despliegue antes de escribir un manual de despliegue.
- Capturar autenticación, configuración, oportunidades, workflows,
  cualificación, adjuntos y generación por IA.
- Utilizar datos ficticios consistentes en todas las capturas.

### Salida

Manual reproducible con capturas actuales y sin datos sensibles.

## Iteración M8 - Cierre académico

### Capítulos

- Capítulo 9: dificultades, limitaciones y trabajo futuro.
- Capítulo 10: conclusiones.
- Resumen y abstract definitivos.
- Bibliografía y anexos.

### Trabajo

- Evaluar cada objetivo mediante requisitos y resultados.
- Separar limitaciones actuales de mejoras opcionales.
- Revisar coherencia terminológica y temporal.
- Cerrar índices, referencias, pies y anexos.
- Compilar y revisar visualmente la memoria completa.
- Preparar material de defensa a partir de la memoria cerrada.

### Salida

Versión candidata a revisión de la tutora.

## Revisión transversal de los capítulos 1--8

**Estado:** completada el 17 de agosto de 2026.

La revisión contrastó estructura, profundidad, trazabilidad y maquetación con
las guías internas y las memorias modelo. Se corrigieron la explicación de los
roles en la adaptación individual de Scrum, el carácter provisional del
presupuesto, una relación errónea entre pruebas y reglas de negocio, las
referencias textuales de figuras y tablas, la configuración reproducible del
proveedor de IA local y la diferenciación visual entre la vista general de
preguntas y el detalle de un resultado generado.

Permanecen deliberadamente abiertos los datos enumerados en
`context/final-todo.md`: coste y fecha del equipo, criterios económicos
definitivos, consumos de pago, fecha académica, despliegue y cierre de la
campaña experimental.

## Auditoría técnica previa a la redacción final

Datos verificados de nuevo el 12 de agosto de 2026 con Node 26.1.0:

- `pnpm test:cov` finaliza correctamente sin caché de Turborepo y respeta los
  umbrales configurados.
- Backend: 37 suites y 142 pruebas superadas; cobertura de líneas 63,16 %, de
  sentencias 62,53 %, de funciones 40,45 % y de ramas 34,59 %.
- Frontend: 11 archivos y 35 pruebas superadas; cobertura de líneas 9,17 %, de
  sentencias 8,25 %, de funciones 4,86 % y de ramas 9,60 %.
- E2E de API: 12 casos superados contra PostgreSQL, incluyendo aislamiento de
  oportunidades, adjuntos, workflows, cualificación y permisos administrativos.
- E2E de navegador: 4 casos superados con Playwright, PostgreSQL, MinIO y un
  proveedor de IA determinista.
- `pnpm check-types`, `pnpm lint` y `pnpm build` finalizan correctamente sin
  caché de Turborepo; `git diff --check` también pasa. El lint mantiene 13
  avisos no bloqueantes en componentes UI.
- El workflow de integración continua ejecuta tipos, lint, pruebas, cobertura,
  build y E2E de API con PostgreSQL 16. Las ejecuciones `31687608812` y
  `31689863930` finalizaron correctamente después de incorporar el secreto E2E
  ausente y alinear el entorno remoto con el local.

La cobertura no es un objetivo por sí sola. La estrategia prioriza los riesgos
funcionales del proyecto y combina pruebas unitarias, de componentes, de API y
de navegador.

## Backlog técnico recomendado

### Prioridad crítica para defender el núcleo

1. **Completar la evaluación de IA.** El banco, las respuestas esperadas y la
   rúbrica están congelados; quedan 28 salidas de Flash y su revisión cuando se
   reponga la cuota disponible.

### Cierre técnico completado el 13 de agosto de 2026

1. La administración de miembros exige `ADMIN` y dispone de una matriz E2E de
   permisos y autoeliminación.
2. El Sprint 8 distingue la cobertura de aplicación del recorrido completo de
   resumen en navegador.
3. RF-016 permanece parcial: las métricas no se persistirán en este cierre y la
   comparación se demostrará mediante el banco experimental.
4. La política temporal es incremental y admite `Date` histórico y de frontera
   sin exigir una migración lateral.
5. MinIO elimina políticas públicas al arrancar y el E2E verifica URL firmada,
   rechazo directo y caducidad.

### Prioridad alta restante

1. **Validar despliegue.** Confirmar entorno objetivo, variables, migraciones,
   almacenamiento y proveedor de IA antes de documentarlo como operativo.

### Pulido y coherencia final

- Sustituir la marca Tendios de las pantallas si LIA tendrá identidad propia.
- Revisar estados de carga, errores, vacíos y comportamiento responsive.
- Comprobar límites y validación de PDFs, descarga y borrado.
- Preparar datos ficticios coherentes para capturas y demostración.
- Mantener organizaciones/contactos, comentarios, tareas y notificaciones como
  trabajo futuro salvo que el autor active expresamente esos sprints.

## Orden recomendado inmediato

1. Completar las 28 salidas de Flash y reconciliar sus revisiones sin modificar
   el banco congelado.
2. Confirmar los datos económicos pendientes del presupuesto y la fecha
   académica definitiva.
3. Decidir si se validará un despliegue o se mantendrá expresamente como trabajo
   futuro.
4. Redactar los capítulos 9 y 10 y cerrar el resumen y el abstract con los
   resultados disponibles.
5. Ejecutar la revisión final de referencias, índices, maquetación y anexos.
