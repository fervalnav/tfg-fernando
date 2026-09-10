# Alcance e inventario de evidencias de LIA

Este documento cierra la iteración M0 de la memoria. Su finalidad es separar
el alcance académico confirmado, el comportamiento comprobado en el
repositorio y las mejoras futuras. La auditoría se realizó el 6 de agosto de
2026 sobre la rama `main`.

## Decisiones de alcance

1. El TFG se centra en el análisis y la cualificación de licitaciones públicas.
   La propuesta registrada en la Universidad es la fuente autoritativa para el
   título, la descripción y los objetivos.
2. LIA representa cada licitación como una oportunidad comercial. El usuario
   crea y organiza la oportunidad, configura su flujo de análisis y adjunta la
   documentación que servirá de contexto a la inteligencia artificial.
3. La obtención automática de anuncios o pliegos no forma parte del alcance. No
   se han implementado scrapers, sincronización con plataformas de contratación
   ni un módulo independiente denominado `Tender`.
4. El núcleo funcional implementado comprende los sprints 0 a 9: plataforma,
   autenticación multiempresa, pipelines, workflows, oportunidades,
   cualificación, integración de IA y adjuntos PDF.
5. Organizaciones y contactos, comentarios, tareas, notificaciones y
   exportación a PDF se mantienen como posibles mejoras futuras. No deben
   aparecer en la memoria como funcionalidades implementadas.
6. No se mencionará ni reproducirá código interno de la empresa. La memoria
   describe exclusivamente las decisiones y la implementación del TFG.

## Matriz de funcionalidades y evidencias

| Área | Estado | Comportamiento verificado | Evidencia principal |
|---|---|---|---|
| Autenticación y cuentas | Implementada | Registro, inicio y cierre de sesión, renovación, perfil, miembros, invitaciones, roles y cambio de cuenta | `apps/api/src/auth`, `apps/web/app/modules/auth`, `apps/web/app/pages/auth` |
| Aislamiento multiempresa | Implementado | Las operaciones se acotan mediante `accountId`; los E2E comprueban que una cuenta no accede a oportunidades, workflows, adjuntos ni cualificación de otra | `apps/api/test/app.e2e-spec.ts` |
| Pipelines | Implementados | CRUD, estados configurables, orden, estado inicial, resultados terminales y configuración por defecto | `apps/api/src/pipeline`, `apps/web/app/modules/pipeline` |
| Workflows configurables | Implementados | CRUD, duplicación, pasos, decisiones y acciones que referencian plantillas del catálogo | `apps/api/src/workflow`, `apps/web/app/modules/workflow` |
| Oportunidades | Implementadas | Alta, edición, borrado físico, listado, kanban, filtros, importes, fechas y transiciones de estado | `apps/api/src/opportunity`, `apps/web/app/modules/opportunity` |
| Ejecución de workflows | Implementada | Asignación a una oportunidad, instanciación de acciones, progreso, finalización, omisión, fallo y reintento | `apps/api/src/opportunity/application`, `OpportunityWorkflowActionRow.vue` |
| Catálogo de cualificación | Implementado | Plantillas de preguntas de control, campos personalizados y resúmenes configurables por cuenta | `apps/api/src/control-question`, `apps/api/src/custom-field`, `apps/api/src/summary` |
| Cualificación por oportunidad | Implementada | Instancias vinculadas al workflow, respuesta o edición manual y alta controlada de plantillas no instanciadas | Módulos de cualificación y detalle de oportunidad |
| Generación estructurada con IA | Implementada | Resúmenes, respuestas a preguntas, campos automáticos y decisiones de workflow mediante esquemas validados | `apps/api/src/ai` y comandos `*with-ai` |
| Proveedores de IA | Implementados | Selección por entorno entre Google, un proveedor compatible con OpenAI/Ollama y un fake determinista de pruebas | `apps/api/src/ai/ai.module.ts`, `apps/api/.env.example` |
| Estados y recuperación de IA | Implementados | Estados pendiente, en proceso, completado y fallido; persistencia del error y reintento explícito | Entidades `Summary`, `ControlQuestion`, `CustomField` y resultados de decisión |
| Adjuntos PDF | Implementados | Subida, listado, descarga prefirmada, borrado, asociación a acciones y recuperación del buffer para la IA | `apps/api/src/attachment`, sección de documentación del detalle |
| Contexto documental para IA | Implementado | Los PDF se recuperan desde MinIO/S3 y se entregan como binarios al proveedor; no se persiste una extracción de texto | `OpportunityAttachmentDocumentsService` y handlers de generación |
| Pruebas automatizadas | Implementadas | Unitarias, componentes, cobertura, E2E de API y E2E de navegador | `docs/testing.md`, `apps/api/test`, `apps/web/tests/e2e` |
| Integración continua | Implementada, pendiente de ejecución remota completa | Workflow con instalación bloqueada, tipos, lint, tests, cobertura, build y E2E de API | `.github/workflows/ci.yml` |
| Optimización de coste y rendimiento de IA | Parcial | El adaptador obtiene proveedor, modelo, duración y tokens, y limita la salida; esas métricas aún no se persisten ni se han comparado experimentalmente | `AiGenerationService` y protocolo `apps/api/test/ai-evaluation` |
| Detección de solvencia económica | Parcial | Las preguntas configurables pueden solicitar una evaluación y evidencia a la IA, pero falta validar esta capacidad con casos documentales y una rúbrica definida | Preguntas de control y protocolo de evaluación de IA |
| Despliegue de producción | No verificado | Existe configuración local reproducible, pero no hay evidencia de un despliegue final validado | `docker-compose.yml`, archivos `.env.example` |

## Exclusiones confirmadas

- descubrimiento, scraping o importación automática de licitaciones;
- organizaciones y contactos como módulo CRM;
- tareas, comentarios, menciones y notificaciones;
- exportación de informes o preguntas de control a PDF;
- planes, pagos y facturación;
- autenticación con Google o LinkedIn;
- tiempo real mediante WebSocket;
- aplicación multilingüe;
- despliegue distribuido de inferencia o procesamiento mediante un intermediario externo;
- Langfuse u otra plataforma externa de observabilidad de IA.

Los flujos asíncronos actuales se coordinan mediante eventos internos de
NestJS CQRS. No se presentará un intermediario externo como transporte
operativo de la generación de IA.

## Evidencias pendientes para la memoria

1. Seleccionar documentos públicos o completamente ficticios para el banco de
   evaluación de IA.
2. Definir las respuestas esperadas antes de ejecutar los modelos.
3. Medir calidad, validez estructural, latencia, tokens y coste con el protocolo
   ya preparado.
4. Obtener una ejecución completa del workflow de GitHub Actions.
5. Confirmar si se validará un despliegue real; mientras no exista evidencia,
   la memoria documentará únicamente la puesta en marcha local.
6. Preparar capturas de los flujos estables con un conjunto coherente de datos
   ficticios.

## Fuentes que se necesitarán en las siguientes iteraciones

- normativa y fuentes institucionales vigentes sobre contratación pública y
  criterios de solvencia;
- fuentes oficiales sobre el volumen y la estructura documental de las
  licitaciones, solo si se incorporan cifras al contexto;
- bibliografía académica sobre extracción de información y evaluación de
  sistemas basados en modelos generativos;
- documentación oficial de las tecnologías utilizadas para justificar
  decisiones arquitectónicas concretas;
- tarifas oficiales, modelo, moneda y fecha para calcular el coste de cada
  proveedor durante la evaluación experimental.

Estas fuentes se investigarán y citarán cuando se redacte el capítulo al que
correspondan. Esta iteración no asigna cifras ni resultados todavía no medidos.
