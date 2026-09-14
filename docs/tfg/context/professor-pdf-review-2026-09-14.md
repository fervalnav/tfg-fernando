# Revisión de las anotaciones de la tutora — 14/09/2026

Fuente: PDF anotado facilitado por el autor (87 páginas, 21 anotaciones).
Las páginas son las del archivo fuente, no las de la nueva compilación.
La revisión se aplica al checkout actual sin revertir correcciones previas.

| Nota | Página | Corrección | Resultado |
| --- | --- | --- | --- |
| 1 | 13 | Revisión por usuario experto | Conservada: persona experta. |
| 2 | 13 | Verbo en el primer bloque de la figura 1.1 | Cambiado a «Cargar documentación». |
| 3 | 13 | Documento para su revisión | Conservado, sin afirmar revisión previa. |
| 4–5 | 14 | Referencias automáticas a todos los capítulos | Conservadas y comprobadas; no se detectan números de capítulos/figuras/tablas escritos manualmente en las fuentes publicables. |
| 6 | 14 | Declaración de uso de IAG | Apéndice A conservado, incluido y referenciado. |
| 7 | 17 | Vincular bloques de esfuerzo con sprints | Integrada la planificación inicial por sprint de la tarea de costes. |
| 8 | 17 | Estimado frente a ejecutado antes de incidencias | Integrada la tabla por sprint de la tarea de costes: 320 h estimadas frente a 339 h de dedicación, antes del análisis de incidencias. |
| 9 | 18 | Separador de miles | Comprobadas cantidades en texto, tablas y ecuaciones. |
| 10 | 22 | Separar estado de la especificación de requisitos | Catálogos sin columna de estado; las limitaciones de validación no se ocultan. |
| 11–13 | 24 | Reclasificar requisitos no funcionales | Conservadas RN-011, RN-012 y RF-018; reparada trazabilidad que aún utilizaba ocho RNF antiguos en lugar de los cuatro actuales. |
| 14 | 27 | Orden de estados y pasos | `{ordered}` conservado y explicado; orden verificado en repositorios de pipeline y workflow. |
| 15–16 | 27–28 | Conceptos del modelo en requisitos de información | RI-001–RI-007 y su explicación conservados y cotejados con ambas figuras. |
| 17 | 29 | Vocabulario comprensible | Definiciones tempranas en introducción y ampliación del vocabulario de dominio. |
| 18 | 29 | Introducción a procesos de negocio | Párrafo introductorio conservado. |
| 19 | 30 | Separar tareas manuales y automáticas | Diagrama funcional rediseñado con carriles; no se presenta como BPMN formal. Incluye corrección/reintento, continuación y cierre. |
| 20 | 33 | Evitar solapamientos | Separadas lista/kanban, detalle y navegación contextual; conservada explicación sobre sustitución no simultánea de workflows. |
| 21 | 34 | Introducción a wireframes | Párrafo de organización conservado. |

## Datos que no se completan artificialmente

La integración de `codex/tfg-planificacion-costes-modelos` sustituye la
comparación agregada anterior por el desglose aprobado por el autor en la tarea
de costes. En esta integración se comprueban las sumas y los cálculos, no se
obtiene un registro horario independiente. `final-todo.md` conserva la revisión
de coherencia de las cifras antes de la entrega.

## Verificación

- Compilación completa mediante `latexmk`, con referencias estabilizadas.
- Comprobación de `git diff --check`, errores y referencias indefinidas.
- Revisión visual de las páginas de introducción, esfuerzo, presupuesto,
  requisitos/trazabilidad, modelos conceptuales, vocabulario, cualificación,
  navegabilidad, introducción a wireframes y declaración de IAG.
- No se realizan commits automáticamente.

## Recuperación de los bloques pendientes

- Campos personalizados: recuperados los cambios de `ecc03cd`, incluidos los
  contratos, la validación HTTP, los filtros compartidos por listado/kanban y
  totales, las pruebas y la ampliación de los capítulos 4 y 8.
- Riesgos: recuperada de `82ac45d` la sección del capítulo 2 con los ocho riesgos,
  probabilidad/impacto, prevención, señal de activación y contingencia.
- Comprobación actual: tipos, lint sin errores y build de API/web correctos;
  158 pruebas API y 35 web superadas. La suite E2E no se ejecuta porque PostgreSQL
  no está disponible en `127.0.0.1:5432`.
- Los PDF históricos de los snapshots no se importan. Se actualiza el PDF
  integrado tras compilar y revisar las páginas afectadas.
